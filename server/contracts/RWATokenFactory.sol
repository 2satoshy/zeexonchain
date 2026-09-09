// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./RWAToken.sol";

contract RWATokenFactory {
    address public owner;
    address[] public deployedRWATokens;

    event RWATokenDeployed(
        address indexed tokenAddress,
        string name,
        string symbol,
        string assetCategory,
        uint256 valuationUSD,
        address indexed creator
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function createRWAToken(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        string memory assetCategory,
        uint256 valuationUSD
    ) external returns (address) {
        RWAToken newToken = new RWAToken(
            name,
            symbol,
            initialSupply,
            msg.sender,
            assetCategory,
            valuationUSD
        );

        address tokenAddr = address(newToken);
        deployedRWATokens.push(tokenAddr);

        emit RWATokenDeployed(tokenAddr, name, symbol, assetCategory, valuationUSD, msg.sender);
        return tokenAddr;
    }

    function getDeployedTokens() external view returns (address[] memory) {
        return deployedRWATokens;
    }

    function getDeployedTokensCount() external view returns (uint256) {
        return deployedRWATokens.length;
    }
}
