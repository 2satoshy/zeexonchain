// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract RWAToken {
    string public name;
    string public symbol;
    uint8 public constant decimals = 18;
    uint256 public totalSupply;
    address public owner;
    string public assetCategory; // e.g., "Real Estate", "Startup Equity", "Commodities"
    uint256 public valuationUSD;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    mapping(address => bool) public isWhitelisted;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event WhitelistUpdated(address indexed target, bool status);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _initialSupply,
        address _owner,
        string memory _assetCategory,
        uint256 _valuationUSD
    ) {
        name = _name;
        symbol = _symbol;
        owner = _owner;
        totalSupply = _initialSupply;
        assetCategory = _assetCategory;
        valuationUSD = _valuationUSD;

        balanceOf[_owner] = _initialSupply;
        isWhitelisted[_owner] = true;

        emit Transfer(address(0), _owner, _initialSupply);
    }

    function setWhitelisted(address target, bool status) external onlyOwner {
        isWhitelisted[target] = status;
        emit WhitelistUpdated(target, status);
    }

    function transfer(address to, uint256 amount) public returns (bool) {
        require(isWhitelisted[msg.sender] || isWhitelisted[to] || msg.sender == owner, "Compliance: KYC Whitelist required");
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        emit Transfer(msg.sender, to, amount);
        return true;
    }

    function approve(address spender, uint256 amount) public returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) public returns (bool) {
        require(isWhitelisted[from] || isWhitelisted[to] || msg.sender == owner, "Compliance: KYC Whitelist required");
        require(balanceOf[from] >= amount, "Insufficient balance");
        require(allowance[from][msg.sender] >= amount, "Insufficient allowance");

        allowance[from][msg.sender] -= amount;
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        emit Transfer(from, to, amount);
        return true;
    }
}
