// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20Airdrop {
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract AirdropDistributor {
    address public owner;
    address public tokenAddress;
    bytes32 public merkleRoot;

    mapping(address => bool) public hasClaimed;

    event AirdropClaimed(address indexed recipient, uint256 amount);
    event BatchAirdropSent(uint256 totalRecipients, uint256 totalTokens);
    event MerkleRootUpdated(bytes32 newRoot);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor(address _tokenAddress, bytes32 _merkleRoot) {
        owner = msg.sender;
        tokenAddress = _tokenAddress;
        merkleRoot = _merkleRoot;
    }

    function setMerkleRoot(bytes32 _merkleRoot) external onlyOwner {
        merkleRoot = _merkleRoot;
        emit MerkleRootUpdated(_merkleRoot);
    }

    function setTokenAddress(address _tokenAddress) external onlyOwner {
        tokenAddress = _tokenAddress;
    }

    // Direct Batch Airdrop execution by admin
    function executeBatchAirdrop(address[] calldata recipients, uint256[] calldata amounts) external onlyOwner {
        require(recipients.length == amounts.length, "Array length mismatch");
        IERC20Airdrop token = IERC20Airdrop(tokenAddress);

        uint256 totalSent = 0;
        for (uint256 i = 0; i < recipients.length; i++) {
            require(recipients[i] != address(0), "Invalid recipient");
            require(token.transfer(recipients[i], amounts[i]), "Transfer failed");
            hasClaimed[recipients[i]] = true;
            totalSent += amounts[i];
            emit AirdropClaimed(recipients[i], amounts[i]);
        }

        emit BatchAirdropSent(recipients.length, totalSent);
    }

    // Merkle Proof Airdrop claim
    function claimMerkleAirdrop(uint256 amount, bytes32[] calldata proof) external {
        require(!hasClaimed[msg.sender], "Already claimed");
        require(merkleRoot != bytes32(0), "Merkle root not set");

        bytes32 leaf = keccak256(abi.encodePacked(msg.sender, amount));
        require(verifyProof(proof, merkleRoot, leaf), "Invalid Merkle proof");

        hasClaimed[msg.sender] = true;
        IERC20Airdrop token = IERC20Airdrop(tokenAddress);
        require(token.transfer(msg.sender, amount), "Claim transfer failed");

        emit AirdropClaimed(msg.sender, amount);
    }

    function verifyProof(bytes32[] memory proof, bytes32 root, bytes32 leaf) internal pure returns (bool) {
        bytes32 computedHash = leaf;
        for (uint256 i = 0; i < proof.length; i++) {
            bytes32 proofElement = proof[i];
            if (computedHash <= proofElement) {
                computedHash = keccak256(abi.encodePacked(computedHash, proofElement));
            } else {
                computedHash = keccak256(abi.encodePacked(proofElement, computedHash));
            }
        }
        return computedHash == root;
    }

    function withdrawRemainingTokens() external onlyOwner {
        IERC20Airdrop token = IERC20Airdrop(tokenAddress);
        uint256 balance = token.balanceOf(address(this));
        require(token.transfer(owner, balance), "Withdrawal failed");
    }
}
