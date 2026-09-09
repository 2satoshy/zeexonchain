// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IInvoiceNFT {
    function ownerOf(uint256 tokenId) external view returns (address);
    function transferFrom(address from, address to, uint256 tokenId) external;
    function invoices(uint256 tokenId) external view returns (
        uint256 invoiceAmountUSD,
        uint256 dueDate,
        uint8 debtorRating,
        string memory invoiceURI,
        bool isSettled
    );
}

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract InvoiceCreditVault {
    address public owner;
    address public invoiceNFTAddress;
    address public stablecoinAddress;

    // Max Loan-to-Value in basis points (e.g. 7500 = 75%)
    uint256 public maxLTVBps = 7500;
    // Annual interest rate in basis points (e.g. 800 = 8%)
    uint256 public interestRateBps = 800;

    struct CreditLine {
        address borrower;
        uint256 collateralTokenId;
        uint256 principalBorrowedUSD;
        uint256 maxBorrowUSD;
        uint256 startTime;
        bool isActive;
    }

    mapping(uint256 => CreditLine) public creditLines;
    mapping(address => uint256[]) public borrowerCreditLines;

    event CollateralDeposited(address indexed borrower, uint256 indexed tokenId, uint256 maxBorrowUSD);
    event FundsDrawn(uint256 indexed tokenId, address indexed borrower, uint256 amountUSD);
    event LoanRepaid(uint256 indexed tokenId, address indexed borrower, uint256 amountUSD);
    event CollateralReleased(uint256 indexed tokenId, address indexed borrower);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor(address _invoiceNFTAddress, address _stablecoinAddress) {
        owner = msg.sender;
        invoiceNFTAddress = _invoiceNFTAddress;
        stablecoinAddress = _stablecoinAddress;
    }

    function depositCollateral(uint256 tokenId) external returns (uint256) {
        IInvoiceNFT nft = IInvoiceNFT(invoiceNFTAddress);
        require(nft.ownerOf(tokenId) == msg.sender, "Must own NFT collateral");

        (uint256 invoiceAmountUSD, uint256 dueDate, , , bool isSettled) = nft.invoices(tokenId);
        require(!isSettled, "Invoice already settled");
        require(dueDate > block.timestamp, "Invoice expired");

        uint256 maxBorrow = (invoiceAmountUSD * maxLTVBps) / 10000;

        nft.transferFrom(msg.sender, address(this), tokenId);

        creditLines[tokenId] = CreditLine({
            borrower: msg.sender,
            collateralTokenId: tokenId,
            principalBorrowedUSD: 0,
            maxBorrowUSD: maxBorrow,
            startTime: block.timestamp,
            isActive: true
        });

        borrowerCreditLines[msg.sender].push(tokenId);

        emit CollateralDeposited(msg.sender, tokenId, maxBorrow);
        return maxBorrow;
    }

    function drawCreditLine(uint256 tokenId, uint256 amountUSD) external {
        CreditLine storage line = creditLines[tokenId];
        require(line.isActive, "Credit line not active");
        require(line.borrower == msg.sender, "Not borrower");
        require(line.principalBorrowedUSD + amountUSD <= line.maxBorrowUSD, "Exceeds max LTV");

        line.principalBorrowedUSD += amountUSD;

        // Transfer stablecoins to borrower
        IERC20 stablecoin = IERC20(stablecoinAddress);
        require(stablecoin.balanceOf(address(this)) >= amountUSD, "Vault insufficient liquidity");
        require(stablecoin.transfer(msg.sender, amountUSD), "Transfer failed");

        emit FundsDrawn(tokenId, msg.sender, amountUSD);
    }

    function repayCreditLine(uint256 tokenId, uint256 amountUSD) external {
        CreditLine storage line = creditLines[tokenId];
        require(line.isActive, "Credit line not active");

        IERC20 stablecoin = IERC20(stablecoinAddress);
        require(stablecoin.transferFrom(msg.sender, address(this), amountUSD), "Repay transfer failed");

        if (amountUSD >= line.principalBorrowedUSD) {
            line.principalBorrowedUSD = 0;
            line.isActive = false;

            // Return NFT collateral to borrower
            IInvoiceNFT nft = IInvoiceNFT(invoiceNFTAddress);
            nft.transferFrom(address(this), line.borrower, tokenId);
            emit CollateralReleased(tokenId, line.borrower);
        } else {
            line.principalBorrowedUSD -= amountUSD;
        }

        emit LoanRepaid(tokenId, msg.sender, amountUSD);
    }

    function setVaultAddresses(address _invoiceNFTAddress, address _stablecoinAddress) external onlyOwner {
        invoiceNFTAddress = _invoiceNFTAddress;
        stablecoinAddress = _stablecoinAddress;
    }
}
