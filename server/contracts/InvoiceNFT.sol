// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract InvoiceNFT {
    string public name = "ZEEX Invoice & Securities NFT";
    string public symbol = "ZINV";
    address public owner;

    uint256 private _nextTokenId;

    struct InvoiceData {
        uint256 invoiceAmountUSD;
        uint256 dueDate;
        uint8 debtorRating; // 1-5 rating
        string invoiceURI;
        bool isSettled;
    }

    mapping(uint256 => address) private _owners;
    mapping(address => uint256) private _balances;
    mapping(uint256 => InvoiceData) public invoices;

    // ── ERC-721 Approval State ───────────────────────────────────────────
    /// @dev tokenId => approved spender (single-token approval)
    mapping(uint256 => address) private _tokenApprovals;
    /// @dev owner => operator => approved (operator approval for all tokens)
    mapping(address => mapping(address => bool)) private _operatorApprovals;

    // ── Events ────────────────────────────────────────────────────────────
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed tokenOwner, address indexed approved, uint256 indexed tokenId);
    event ApprovalForAll(address indexed tokenOwner, address indexed operator, bool approved);
    event InvoiceMinted(uint256 indexed tokenId, address indexed recipient, uint256 amountUSD, uint256 dueDate);
    event InvoiceSettled(uint256 indexed tokenId);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    // ── ERC-721 Core Views ────────────────────────────────────────────────

    function ownerOf(uint256 tokenId) public view returns (address) {
        address tokenOwner = _owners[tokenId];
        require(tokenOwner != address(0), "Token does not exist");
        return tokenOwner;
    }

    function balanceOf(address account) public view returns (uint256) {
        require(account != address(0), "Zero address");
        return _balances[account];
    }

    // ── ERC-721 Approval Functions ────────────────────────────────────────

    /**
     * @notice Approve `to` to transfer token `tokenId` on behalf of the caller.
     *         Caller must be the token owner or an approved operator.
     */
    function approve(address to, uint256 tokenId) public {
        address tokenOwner = _owners[tokenId];
        require(tokenOwner != address(0), "Token does not exist");
        require(
            msg.sender == tokenOwner || _operatorApprovals[tokenOwner][msg.sender],
            "Not owner or operator"
        );
        _tokenApprovals[tokenId] = to;
        emit Approval(tokenOwner, to, tokenId);
    }

    /**
     * @notice Returns the account approved to transfer token `tokenId`.
     */
    function getApproved(uint256 tokenId) public view returns (address) {
        require(_owners[tokenId] != address(0), "Token does not exist");
        return _tokenApprovals[tokenId];
    }

    /**
     * @notice Grant or revoke `operator` approval to manage ALL of caller's tokens.
     */
    function setApprovalForAll(address operator, bool approved) public {
        require(operator != msg.sender, "Cannot approve self");
        _operatorApprovals[msg.sender][operator] = approved;
        emit ApprovalForAll(msg.sender, operator, approved);
    }

    /**
     * @notice Returns whether `operator` is approved to manage all of `tokenOwner`'s tokens.
     */
    function isApprovedForAll(address tokenOwner, address operator) public view returns (bool) {
        return _operatorApprovals[tokenOwner][operator];
    }

    // ── Mint ──────────────────────────────────────────────────────────────

    function mintInvoice(
        address recipient,
        uint256 amountUSD,
        uint256 dueDate,
        uint8 debtorRating,
        string memory invoiceURI
    ) public returns (uint256) {
        require(recipient != address(0), "Invalid recipient");
        _nextTokenId++;
        uint256 newId = _nextTokenId;

        _owners[newId] = recipient;
        _balances[recipient] += 1;

        invoices[newId] = InvoiceData({
            invoiceAmountUSD: amountUSD,
            dueDate: dueDate,
            debtorRating: debtorRating,
            invoiceURI: invoiceURI,
            isSettled: false
        });

        emit Transfer(address(0), recipient, newId);
        emit InvoiceMinted(newId, recipient, amountUSD, dueDate);

        return newId;
    }

    // ── Settle ────────────────────────────────────────────────────────────

    function markSettled(uint256 tokenId) external {
        require(ownerOf(tokenId) == msg.sender || msg.sender == owner, "Unauthorized");
        invoices[tokenId].isSettled = true;
        emit InvoiceSettled(tokenId);
    }

    // ── Transfer ──────────────────────────────────────────────────────────

    /**
     * @notice Transfer token `tokenId` from `from` to `to`.
     *         Caller must be the token owner, the contract owner, an approved spender,
     *         or an approved operator — enabling vault contracts to call this on behalf
     *         of a user after the user calls approve(vaultAddress, tokenId).
     */
    function transferFrom(address from, address to, uint256 tokenId) public {
        require(ownerOf(tokenId) == from, "Not token owner");
        require(to != address(0), "Invalid recipient");
        require(
            msg.sender == from ||
            msg.sender == owner ||
            _tokenApprovals[tokenId] == msg.sender ||
            _operatorApprovals[from][msg.sender],
            "Not approved"
        );

        // Clear single-token approval on transfer (ERC-721 standard behaviour)
        delete _tokenApprovals[tokenId];

        _balances[from] -= 1;
        _balances[to] += 1;
        _owners[tokenId] = to;

        emit Transfer(from, to, tokenId);
    }
}
