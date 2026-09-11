// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20Vault {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract RevolvingCreditVault {
    address public owner;
    address public stablecoinAddress;

    struct RevolvingFacility {
        address borrower;
        uint256 creditLimitUSD;
        uint256 drawnAmountUSD;
        uint256 interestRateBps; // Annual interest in basis points (e.g. 750 = 7.5%)
        uint256 creditScore;     // 300 - 850
        uint256 lastDrawTimestamp;
        bool isActive;
    }

    struct LoanRFQ {
        uint256 rfqId;
        address borrower;
        uint256 requestedAmountUSD;
        uint256 durationDays;
        string businessPurpose;
        bool isOpen;
        uint256 winningBidId;
    }

    struct RFQBid {
        uint256 bidId;
        uint256 rfqId;
        address lenderVenue;
        string venueName;       // e.g. "InvoiceX Vault", "ZSE Trust Pool", "P2P Liquidity"
        uint256 proposedInterestBps;
        uint256 maxAmountUSD;
        bool isAccepted;
    }

    uint256 private _nextRfqId;
    uint256 private _nextBidId;

    mapping(address => RevolvingFacility) public facilities;
    mapping(uint256 => LoanRFQ) public rfqRequests;
    mapping(uint256 => RFQBid[]) public rfqBids;

    event FacilityApproved(address indexed borrower, uint256 creditLimitUSD, uint256 creditScore, uint256 interestRateBps);
    event RevolvingDraw(address indexed borrower, uint256 amountUSD, uint256 newTotalDrawn);
    event RevolvingRepay(address indexed borrower, uint256 amountUSD, uint256 remainingDrawn);
    event RFQCreated(uint256 indexed rfqId, address indexed borrower, uint256 amountUSD, string purpose);
    event BidSubmitted(uint256 indexed rfqId, uint256 indexed bidId, address lender, string venueName, uint256 rateBps);
    event BidAccepted(uint256 indexed rfqId, uint256 indexed bidId, address lender, uint256 amountUSD);
    event StablecoinAddressUpdated(address indexed oldAddress, address indexed newAddress);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor(address _stablecoinAddress) {
        require(_stablecoinAddress != address(0), "Stablecoin address cannot be zero");
        owner = msg.sender;
        stablecoinAddress = _stablecoinAddress;
    }

    // ── Admin ─────────────────────────────────────────────────────────────

    /**
     * @notice Update the stablecoin address used for liquidity draws and repayments.
     *         Useful after contract redeployment or stablecoin migration.
     */
    function setStablecoinAddress(address _stablecoinAddress) external onlyOwner {
        require(_stablecoinAddress != address(0), "Cannot be zero address");
        emit StablecoinAddressUpdated(stablecoinAddress, _stablecoinAddress);
        stablecoinAddress = _stablecoinAddress;
    }

    function approveFacility(
        address borrower,
        uint256 creditLimitUSD,
        uint256 creditScore,
        uint256 interestRateBps
    ) external onlyOwner {
        require(borrower != address(0), "Invalid borrower");
        facilities[borrower] = RevolvingFacility({
            borrower: borrower,
            creditLimitUSD: creditLimitUSD,
            drawnAmountUSD: 0,
            interestRateBps: interestRateBps,
            creditScore: creditScore,
            lastDrawTimestamp: block.timestamp,
            isActive: true
        });

        emit FacilityApproved(borrower, creditLimitUSD, creditScore, interestRateBps);
    }

    // ── View Helpers ──────────────────────────────────────────────────────

    /**
     * @notice Returns the vault's current stablecoin balance.
     *         Use this to verify liquidity before calling drawRevolvingCredit.
     */
    function getVaultBalance() external view returns (uint256) {
        return IERC20Vault(stablecoinAddress).balanceOf(address(this));
    }

    /**
     * @notice Returns the available (undrawn) credit for a borrower.
     */
    function availableCredit(address borrower) external view returns (uint256) {
        RevolvingFacility storage fac = facilities[borrower];
        if (!fac.isActive) return 0;
        return fac.creditLimitUSD - fac.drawnAmountUSD;
    }

    // ── Draw & Repay ──────────────────────────────────────────────────────

    /**
     * @notice Draw `amountUSD` from the revolving credit facility.
     *
     * FIX: Balance check and transfer now occur BEFORE state mutation to
     * prevent a situation where drawnAmountUSD is incremented even if the
     * actual token transfer fails (check-effects-interactions pattern).
     */
    function drawRevolvingCredit(uint256 amountUSD) external {
        RevolvingFacility storage fac = facilities[msg.sender];
        require(fac.isActive, "No active revolving facility");
        require(fac.drawnAmountUSD + amountUSD <= fac.creditLimitUSD, "Exceeds approved revolving limit");

        IERC20Vault stablecoin = IERC20Vault(stablecoinAddress);

        // ── FIX: check liquidity BEFORE updating state (check-effects-interactions) ──
        uint256 vaultBalance = stablecoin.balanceOf(address(this));
        require(vaultBalance >= amountUSD, "Vault liquidity buffer empty");

        // Update state after validation passes
        fac.drawnAmountUSD += amountUSD;
        fac.lastDrawTimestamp = block.timestamp;

        // Transfer stablecoins to borrower
        require(stablecoin.transfer(msg.sender, amountUSD), "Transfer failed");

        emit RevolvingDraw(msg.sender, amountUSD, fac.drawnAmountUSD);
    }

    function repayRevolvingCredit(uint256 amountUSD) external {
        RevolvingFacility storage fac = facilities[msg.sender];
        require(fac.isActive, "No active facility");
        require(fac.drawnAmountUSD > 0, "No drawn balance");

        uint256 payAmount = amountUSD > fac.drawnAmountUSD ? fac.drawnAmountUSD : amountUSD;

        IERC20Vault stablecoin = IERC20Vault(stablecoinAddress);
        require(stablecoin.transferFrom(msg.sender, address(this), payAmount), "Repay transfer failed");

        fac.drawnAmountUSD -= payAmount;
        emit RevolvingRepay(msg.sender, payAmount, fac.drawnAmountUSD);
    }

    // ── Loan RFQ ──────────────────────────────────────────────────────────

    function createLoanRFQ(uint256 amountUSD, uint256 durationDays, string memory purpose) external returns (uint256) {
        require(amountUSD > 0, "Invalid amount");
        _nextRfqId++;
        uint256 rfqId = _nextRfqId;

        rfqRequests[rfqId] = LoanRFQ({
            rfqId: rfqId,
            borrower: msg.sender,
            requestedAmountUSD: amountUSD,
            durationDays: durationDays,
            businessPurpose: purpose,
            isOpen: true,
            winningBidId: 0
        });

        emit RFQCreated(rfqId, msg.sender, amountUSD, purpose);
        return rfqId;
    }

    function submitRFQBid(
        uint256 rfqId,
        string memory venueName,
        uint256 proposedInterestBps,
        uint256 maxAmountUSD
    ) external returns (uint256) {
        LoanRFQ storage rfq = rfqRequests[rfqId];
        require(rfq.isOpen, "RFQ closed");

        _nextBidId++;
        uint256 bidId = _nextBidId;

        RFQBid memory newBid = RFQBid({
            bidId: bidId,
            rfqId: rfqId,
            lenderVenue: msg.sender,
            venueName: venueName,
            proposedInterestBps: proposedInterestBps,
            maxAmountUSD: maxAmountUSD,
            isAccepted: false
        });

        rfqBids[rfqId].push(newBid);

        emit BidSubmitted(rfqId, bidId, msg.sender, venueName, proposedInterestBps);
        return bidId;
    }

    function acceptRFQBid(uint256 rfqId, uint256 bidIndex) external {
        LoanRFQ storage rfq = rfqRequests[rfqId];
        require(rfq.isOpen, "RFQ closed");
        require(rfq.borrower == msg.sender, "Not borrower");
        require(bidIndex < rfqBids[rfqId].length, "Invalid bid index");

        RFQBid storage bid = rfqBids[rfqId][bidIndex];
        bid.isAccepted = true;
        rfq.isOpen = false;
        rfq.winningBidId = bid.bidId;

        // Upgrade/set revolving credit facility for borrower based on winning bid
        facilities[msg.sender] = RevolvingFacility({
            borrower: msg.sender,
            creditLimitUSD: rfq.requestedAmountUSD,
            drawnAmountUSD: 0,
            interestRateBps: bid.proposedInterestBps,
            creditScore: 720,
            lastDrawTimestamp: block.timestamp,
            isActive: true
        });

        emit BidAccepted(rfqId, bid.bidId, bid.lenderVenue, rfq.requestedAmountUSD);
    }

    function getBidsForRFQ(uint256 rfqId) external view returns (RFQBid[] memory) {
        return rfqBids[rfqId];
    }
}
