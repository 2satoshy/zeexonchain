// CJS script to compile a minimal ERC-20 and output the ABI + bytecode
const solc = require('solc');

const source = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SimpleERC20 {
    string public name;
    string public symbol;
    uint8 public constant decimals = 18;
    uint256 public totalSupply;
    address public owner;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    constructor(string memory _name, string memory _symbol, uint256 _initialSupply, address _owner) {
        name = _name;
        symbol = _symbol;
        owner = _owner;
        totalSupply = _initialSupply;
        balanceOf[_owner] = _initialSupply;
        emit Transfer(address(0), _owner, _initialSupply);
    }

    function transfer(address to, uint256 amount) public returns (bool) {
        require(balanceOf[msg.sender] >= amount, "insufficient balance");
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
        require(balanceOf[from] >= amount, "insufficient balance");
        require(allowance[from][msg.sender] >= amount, "insufficient allowance");
        allowance[from][msg.sender] -= amount;
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        emit Transfer(from, to, amount);
        return true;
    }
}
`;

const input = {
  language: 'Solidity',
  sources: { 'SimpleERC20.sol': { content: source } },
  settings: {
    outputSelection: { '*': { '*': ['abi', 'evm.bytecode'] } },
    optimizer: { enabled: true, runs: 200 }
  }
};

const output = JSON.parse(solc.compile(JSON.stringify(input)));

if (output.errors) {
  const errs = output.errors.filter(e => e.severity === 'error');
  if (errs.length) {
    console.error('Compilation errors:', JSON.stringify(errs, null, 2));
    process.exit(1);
  }
}

const contract = output.contracts['SimpleERC20.sol']['SimpleERC20'];
const abi = JSON.stringify(contract.abi);
const bytecode = '0x' + contract.evm.bytecode.object;

console.log('=== ABI ===');
console.log(abi);
console.log('\n=== BYTECODE ===');
console.log(bytecode);
console.log('\n=== BYTECODE LENGTH ===');
console.log(bytecode.length, 'chars');
