import solc from 'solc';
import { createPublicClient, createWalletClient, http, parseEther, formatEther, formatUnits } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { baseSepolia } from 'viem/chains';
import { getMongoCollection } from './db/mongodb';

const ERC20_SOLIDITY_SOURCE = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ZeexToken {
    string public name;
    string public symbol;
    uint8 public constant decimals = 18;
    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    constructor(string memory _name, string memory _symbol, uint256 _initialSupply, address _owner) {
        name = _name;
        symbol = _symbol;
        totalSupply = _initialSupply;
        balanceOf[_owner] = _initialSupply;
        emit Transfer(address(0), _owner, _initialSupply);
    }

    function transfer(address _to, uint256 _amount) public returns (bool) {
        require(balanceOf[msg.sender] >= _amount, "Insufficient balance");
        balanceOf[msg.sender] -= _amount;
        balanceOf[_to] += _amount;
        emit Transfer(msg.sender, _to, _amount);
        return true;
    }

    function approve(address _spender, uint256 _amount) public returns (bool) {
        allowance[msg.sender][_spender] = _amount;
        emit Approval(msg.sender, _spender, _amount);
        return true;
    }

    function transferFrom(address _from, address _to, uint256 _amount) public returns (bool) {
        require(balanceOf[_from] >= _amount, "Insufficient balance");
        if (allowance[_from][msg.sender] != type(uint256).max) {
            require(allowance[_from][msg.sender] >= _amount, "Insufficient allowance");
            allowance[_from][msg.sender] -= _amount;
        }
        balanceOf[_from] -= _amount;
        balanceOf[_to] += _amount;
        emit Transfer(_from, _to, _amount);
        return true;
    }
}
`;

function compileContract() {
  const input = {
    language: 'Solidity',
    sources: {
      'ZeexToken.sol': {
        content: ERC20_SOLIDITY_SOURCE,
      },
    },
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      outputSelection: {
        '*': {
          '*': ['abi', 'evm.bytecode.object'],
        },
      },
    },
  };

  const output = JSON.parse(solc.compile(JSON.stringify(input)));
  if (output.errors) {
    for (const error of output.errors) {
      console.log(error.formattedMessage);
      if (error.severity === 'error') {
        throw new Error('Compilation failed');
      }
    }
  }

  const contract = output.contracts['ZeexToken.sol']['ZeexToken'];
  const abi = contract.abi;
  const bytecode = ('0x' + contract.evm.bytecode.object) as `0x${string}`;

  return { abi, bytecode };
}

async function main() {
  console.log('=== COMPILING GAS-OPTIMIZED ERC-20 TOKEN ===');
  const { abi, bytecode } = compileContract();
  console.log(`✅ Compiled! Bytecode length: ${bytecode.length} chars`);

  const privateKey = '0x59b29ff272ed49d1955b972ee2a2fa719d304ec361129ef457e851a51a3dde34';
  const deployerAccount = privateKeyToAccount(privateKey);

  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http('https://sepolia.base.org'),
  });

  const walletClient = createWalletClient({
    account: deployerAccount,
    chain: baseSepolia,
    transport: http('https://sepolia.base.org'),
  });

  console.log('\n=== STARTING ONCHAIN DEPLOYMENT ON BASE SEPOLIA ===');
  console.log('Deployer Address:', deployerAccount.address);

  const balanceWei = await publicClient.getBalance({ address: deployerAccount.address });
  console.log(`Deployer ETH Balance: ${formatEther(balanceWei)} ETH`);

  const TOKENS_TO_DEPLOY = [
    {
      symbol: 'ZIG',
      name: 'Zimbabwe Gold Stablecoin',
      stockTicker: 'ZIG',
      initialSupply: '10000000',
    },
    {
      symbol: 'BAMBA',
      name: 'Bamba Cold Chain Logistics',
      stockTicker: 'BAMBA',
      initialSupply: '1000000',
    },
    {
      symbol: 'SIMBA',
      name: 'Simba Solar Micro-Grids',
      stockTicker: 'SIMBA',
      initialSupply: '1000000',
    },
    {
      symbol: 'TEA',
      name: 'Nyanga Specialty Tea Equity',
      stockTicker: 'NYTEA',
      initialSupply: '1000000',
    },
    {
      symbol: 'MUKURU',
      name: 'Mukuru Macadamia & Avocado Exporters',
      stockTicker: 'MUKURU',
      initialSupply: '1000000',
    },
  ];

  const deployedResults: Record<string, { address: string; txHash: string; symbol: string; name: string; supply: string }> = {};

  for (const token of TOKENS_TO_DEPLOY) {
    console.log(`\n--- Deploying ${token.symbol} (${token.name}) ---`);
    const supplyWei = parseEther(token.initialSupply);

    const txHash = await walletClient.deployContract({
      account: deployerAccount,
      chain: baseSepolia,
      abi,
      bytecode,
      args: [token.name, token.symbol, supplyWei, deployerAccount.address],
    } as any);

    console.log(`Tx broadcasted: ${txHash}`);
    console.log('Waiting for receipt on Base Sepolia...');

    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
    const contractAddress = receipt.contractAddress;

    if (!contractAddress) {
      throw new Error(`Failed to get contract address for ${token.symbol}`);
    }

    console.log(`✅ ${token.symbol} deployed at: ${contractAddress}`);
    console.log(`Gas used: ${receipt.gasUsed.toString()} | Status: ${receipt.status}`);
    console.log(`Basescan: https://sepolia.basescan.org/token/${contractAddress}`);

    deployedResults[token.symbol] = {
      address: contractAddress,
      txHash,
      symbol: token.symbol,
      name: token.name,
      supply: token.initialSupply,
    };
  }

  console.log('\n=== ALL 5 CONTRACTS DEPLOYED ON BASE SEPOLIA ===');
  console.log(JSON.stringify(deployedResults, null, 2));

  // Update MongoDB
  try {
    const tokensCol = await getMongoCollection('deployed_tokens');
    if (tokensCol) {
      for (const [symbol, info] of Object.entries(deployedResults)) {
        await tokensCol.updateOne(
          { symbol },
          {
            $set: {
              symbol,
              name: info.name,
              stockTicker: symbol === 'TEA' ? 'NYTEA' : symbol,
              contractAddress: info.address,
              totalSupply: Number(info.supply),
              decimals: 18,
              deployedAt: new Date().toISOString(),
              txHash: info.txHash,
              deployerAddress: deployerAccount.address,
            },
          },
          { upsert: true }
        );
      }
      console.log('✅ MongoDB deployed_tokens collection updated');
    }

    const zigCol = await getMongoCollection('zig_stablecoin');
    if (zigCol && deployedResults['ZIG']) {
      await zigCol.updateOne(
        { symbol: 'ZIG' },
        {
          $set: {
            symbol: 'ZIG',
            name: 'Zimbabwe Gold Stablecoin',
            contractAddress: deployedResults['ZIG'].address,
            factoryAddress: '0xB20f000000000000000000000000000000000000',
            standard: 'Base B20 (ERC-20 Superset with RBAC, Memos & Compliance)',
            decimals: 18,
            initialSupplyMinted: 10000000,
            totalCirculatingSupply: 10000000,
            treasuryBalance: 10000000,
            adminAddress: deployerAccount.address,
            minterAddress: deployerAccount.address,
            burnerAddress: deployerAccount.address,
            deployedAt: new Date().toISOString(),
            txHash: deployedResults['ZIG'].txHash,
            network: 'Base Sepolia Testnet',
            chainId: 84532,
            explorerUrl: `https://sepolia.basescan.org/token/${deployedResults['ZIG'].address}`,
          },
        },
        { upsert: true }
      );
      console.log('✅ MongoDB zig_stablecoin collection updated');
    }
  } catch (e: any) {
    console.warn('MongoDB sync note:', e.message);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error('Error during deployment:', err);
  process.exit(1);
});
