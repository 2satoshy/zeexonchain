import solc from 'solc';
import fs from 'fs';
import path from 'path';

export interface CompiledContract {
  abi: any[];
  bytecode: `0x${string}`;
}

export interface ContractArtifacts {
  InvoiceNFT: CompiledContract;
  InvoiceCreditVault: CompiledContract;
  AirdropDistributor: CompiledContract;
  RWAToken: CompiledContract;
  RWATokenFactory: CompiledContract;
  RevolvingCreditVault: CompiledContract;
}

const CONTRACTS_DIR = path.join(process.cwd(), 'server', 'contracts');

function readContractSource(fileName: string): string {
  const filePath = path.join(CONTRACTS_DIR, fileName);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Contract file not found at ${filePath}`);
  }
  return fs.readFileSync(filePath, 'utf8');
}

export function compileAllContracts(): ContractArtifacts {
  console.log('[Compiler] Compiling Solidity contracts in server/contracts...');

  const sources: Record<string, { content: string }> = {
    'InvoiceNFT.sol': { content: readContractSource('InvoiceNFT.sol') },
    'InvoiceCreditVault.sol': { content: readContractSource('InvoiceCreditVault.sol') },
    'AirdropDistributor.sol': { content: readContractSource('AirdropDistributor.sol') },
    'RWAToken.sol': { content: readContractSource('RWAToken.sol') },
    'RWATokenFactory.sol': { content: readContractSource('RWATokenFactory.sol') },
    'RevolvingCreditVault.sol': { content: readContractSource('RevolvingCreditVault.sol') },
  };

  const input = {
    language: 'Solidity',
    sources,
    settings: {
      outputSelection: {
        '*': {
          '*': ['abi', 'evm.bytecode'],
        },
      },
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  };

  const output = JSON.parse(solc.compile(JSON.stringify(input)));

  if (output.errors) {
    const errors = output.errors.filter((e: any) => e.severity === 'error');
    if (errors.length > 0) {
      console.error('[Compiler] Compilation errors:', JSON.stringify(errors, null, 2));
      throw new Error(`Solidity compilation failed: ${errors[0].formattedMessage}`);
    }
  }

  const getContract = (fileName: string, contractName: string): CompiledContract => {
    const contractData = output.contracts[fileName]?.[contractName];
    if (!contractData) {
      throw new Error(`Could not find contract ${contractName} in compilation output for ${fileName}`);
    }
    return {
      abi: contractData.abi,
      bytecode: (`0x` + contractData.evm.bytecode.object) as `0x${string}`,
    };
  };

  const artifacts: ContractArtifacts = {
    InvoiceNFT: getContract('InvoiceNFT.sol', 'InvoiceNFT'),
    InvoiceCreditVault: getContract('InvoiceCreditVault.sol', 'InvoiceCreditVault'),
    AirdropDistributor: getContract('AirdropDistributor.sol', 'AirdropDistributor'),
    RWAToken: getContract('RWAToken.sol', 'RWAToken'),
    RWATokenFactory: getContract('RWATokenFactory.sol', 'RWATokenFactory'),
    RevolvingCreditVault: getContract('RevolvingCreditVault.sol', 'RevolvingCreditVault'),
  };

  console.log('[Compiler] Successfully compiled all 5 Solidity contracts!');
  return artifacts;
}
