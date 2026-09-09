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

    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event InvoiceMinted(uint256 indexed tokenId, address indexed recipient, uint256 amountUSD, uint256 dueDate);
    event InvoiceSettled(uint256 indexed tokenId);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function ownerOf(uint256 tokenId) public view returns (address) {
        address tokenOwner = _owners[tokenId];
        require(tokenOwner != address(0), "Token does not exist");
        return tokenOwner;
    }

    function balanceOf(address account) public view returns (uint256) {
        require(account != address(0), "Zero address");
        return _balances[account];
    }

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

    function markSettled(uint256 tokenId) external {
        require(ownerOf(tokenId) == msg.sender || msg.sender == owner, "Unauthorized");
        invoices[tokenId].isSettled = true;
        emit InvoiceSettled(tokenId);
    }

    function transferFrom(address from, address to, uint256 tokenId) public {
        require(ownerOf(tokenId) == from, "Not token owner");
        require(msg.sender == from || msg.sender == owner, "Not approved");
        require(to != address(0), "Invalid recipient");

        _balances[from] -= 1;
        _balances[to] += 1;
        _owners[tokenId] = to;

        emit Transfer(from, to, tokenId);
    }
}
