/**
 * ============================================================
 *  ZEEX ONCHAIN TEST SUITE — Base Sepolia (Chain ID: 84532)
 * ============================================================
 *
 * Tests ALL deployed smart contracts with real onchain transactions:
 *   1. InvoiceNFT          — mintInvoice, transferFrom, approve, setApprovalForAll
 *   2. InvoiceCreditVault  — depositCollateral, drawCreditLine, repayCreditLine
 *   3. AirdropDistributor  — setTokenAddress, setMerkleRoot, executeBatchAirdrop,
 *                            withdrawRemainingTokens
 *   4. RWAToken            — setWhitelisted, transfer, approve
 *   5. RWATokenFactory     — createRWAToken, getDeployedTokens
 *   6. RevolvingCreditVault — approveFacility, drawRevolvingCredit, createLoanRFQ,
 *                             submitRFQBid, acceptRFQBid, repayRevolvingCredit
 *
 * Deposit wallet: 0x871Cf2D6126fD068133E9F2d8d53CdeC59a98f29
 * Network:        Base Sepolia (Chain ID 84532)
 * Explorer:       https://sepolia.basescan.org
 * ============================================================
 */

import {
  createPublicClient,
  createWalletClient,
  http,
  formatEther,
  parseEther,
  encodePacked,
  keccak256,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { baseSepolia } from 'viem/chains';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { compileAllContracts } from './contractsCompiler.js';

// ─── Config ──────────────────────────────────────────────────────────────────

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASESCAN_TX   = (h: string) => `https://sepolia.basescan.org/tx/${h}`;
const BASESCAN_ADDR = (a: string) => `https://sepolia.basescan.org/address/${a}`;

const DEPOSIT_WALLET = '0x871Cf2D6126fD068133E9F2d8d53CdeC59a98f29' as `0x${string}`;
const DEPLOYED_JSON  = path.join(__dirname, 'deployedContracts.json');

function getPrivateKey(): `0x${string}` {
  const env = process.env.DEPLOYER_PRIVATE_KEY;
  if (env?.startsWith('0x')) return env as `0x${string}`;
  const kf = path.join(__dirname, 'deployerKey.json');
  if (fs.existsSync(kf)) {
    const d = JSON.parse(fs.readFileSync(kf, 'utf8'));
    if (d.privateKey) return d.privateKey as `0x${string}`;
  }
  throw new Error('No deployer private key found.');
}

const account = privateKeyToAccount(getPrivateKey());

const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http('https://sepolia.base.org'),
});

const walletClient = createWalletClient({
  account,
  chain: baseSepolia,
  transport: http('https://sepolia.base.org'),
});

// ─── Contract Registry ───────────────────────────────────────────────────────

interface ContractEntry { contractAddress: string; abi: any[]; }

interface Registry {
  InvoiceNFT: ContractEntry;
  InvoiceCreditVault: ContractEntry;
  AirdropDistributor: ContractEntry;
  RWAToken: ContractEntry;
  RWATokenFactory: ContractEntry;
  RevolvingCreditVault: ContractEntry;
}

/**
 * Load or deploy contracts fresh with fully synchronized addresses and initial balances.
 */
async function loadOrDeployContracts(): Promise<Registry> {
  log('[Compiler] Compiling Solidity contracts in server/contracts...');
  const artifacts = compileAllContracts();

  log('Deploying fresh RWAToken...');
  const rwaHash = await walletClient.deployContract({
    account,
    chain: baseSepolia,
    abi: artifacts.RWAToken.abi,
    bytecode: artifacts.RWAToken.bytecode,
    args: [
      'ZEEX RWA Asset Token',
      'ZRWA',
      parseEther('1000000'),
      account.address,
      'Treasury & Real Estate',
      BigInt(10_000_000),
    ],
  } as any);
  const rwaReceipt = await publicClient.waitForTransactionReceipt({ hash: rwaHash, timeout: 90_000 });
  const rwaAddr = rwaReceipt.contractAddress!;
  log(`RWAToken deployed at: ${rwaAddr}`);

  log('Deploying fresh InvoiceNFT...');
  const nftHash = await walletClient.deployContract({
    account,
    chain: baseSepolia,
    abi: artifacts.InvoiceNFT.abi,
    bytecode: artifacts.InvoiceNFT.bytecode,
  } as any);
  const nftReceipt = await publicClient.waitForTransactionReceipt({ hash: nftHash, timeout: 90_000 });
  const invoiceNFTAddr = nftReceipt.contractAddress!;
  log(`InvoiceNFT deployed at: ${invoiceNFTAddr}`);

  log('Deploying fresh InvoiceCreditVault...');
  const icvHash = await walletClient.deployContract({
    account,
    chain: baseSepolia,
    abi: artifacts.InvoiceCreditVault.abi,
    bytecode: artifacts.InvoiceCreditVault.bytecode,
    args: [invoiceNFTAddr, rwaAddr],
  } as any);
  const icvReceipt = await publicClient.waitForTransactionReceipt({ hash: icvHash, timeout: 90_000 });
  const invoiceCreditVaultAddr = icvReceipt.contractAddress!;
  log(`InvoiceCreditVault deployed at: ${invoiceCreditVaultAddr}`);

  log('Deploying fresh AirdropDistributor...');
  const emptyBytes32 = '0x0000000000000000000000000000000000000000000000000000000000000000' as `0x${string}`;
  const adHash = await walletClient.deployContract({
    account,
    chain: baseSepolia,
    abi: artifacts.AirdropDistributor.abi,
    bytecode: artifacts.AirdropDistributor.bytecode,
    args: [rwaAddr, emptyBytes32],
  } as any);
  const adReceipt = await publicClient.waitForTransactionReceipt({ hash: adHash, timeout: 90_000 });
  const airdropDistributorAddr = adReceipt.contractAddress!;
  log(`AirdropDistributor deployed at: ${airdropDistributorAddr}`);

  log('Deploying fresh RWATokenFactory...');
  const rtfHash = await walletClient.deployContract({
    account,
    chain: baseSepolia,
    abi: artifacts.RWATokenFactory.abi,
    bytecode: artifacts.RWATokenFactory.bytecode,
  } as any);
  const rtfReceipt = await publicClient.waitForTransactionReceipt({ hash: rtfHash, timeout: 90_000 });
  const rwaTokenFactoryAddr = rtfReceipt.contractAddress!;
  log(`RWATokenFactory deployed at: ${rwaTokenFactoryAddr}`);

  log('Deploying fresh RevolvingCreditVault...');
  const rcvHash = await walletClient.deployContract({
    account,
    chain: baseSepolia,
    abi: artifacts.RevolvingCreditVault.abi,
    bytecode: artifacts.RevolvingCreditVault.bytecode,
    args: [rwaAddr],
  } as any);
  const rcvReceipt = await publicClient.waitForTransactionReceipt({ hash: rcvHash, timeout: 90_000 });
  const revolvingCreditVaultAddr = rcvReceipt.contractAddress!;
  log(`RevolvingCreditVault deployed at: ${revolvingCreditVaultAddr}`);

  const updatedRegistry: Registry = {
    InvoiceNFT: { contractAddress: invoiceNFTAddr, abi: artifacts.InvoiceNFT.abi },
    InvoiceCreditVault: { contractAddress: invoiceCreditVaultAddr, abi: artifacts.InvoiceCreditVault.abi },
    AirdropDistributor: { contractAddress: airdropDistributorAddr, abi: artifacts.AirdropDistributor.abi },
    RWAToken: { contractAddress: rwaAddr, abi: artifacts.RWAToken.abi },
    RWATokenFactory: { contractAddress: rwaTokenFactoryAddr, abi: artifacts.RWATokenFactory.abi },
    RevolvingCreditVault: { contractAddress: revolvingCreditVaultAddr, abi: artifacts.RevolvingCreditVault.abi },
  };

  fs.writeFileSync(DEPLOYED_JSON, JSON.stringify(updatedRegistry, null, 2));
  log('Persisted fresh contract deployment registry to deployedContracts.json');

  return updatedRegistry;
}

// ─── Result tracking ─────────────────────────────────────────────────────────

interface TestResult {
  suite: string;
  test: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  txHash?: string;
  txUrl?: string;
  error?: string;
  notes?: string;
}

const results: TestResult[] = [];

function log(msg: string) {
  console.log(`[${new Date().toISOString()}] ${msg}`);
}

function pass(suite: string, test: string, txHash: string, notes?: string) {
  const r: TestResult = { suite, test, status: 'PASS', txHash, txUrl: BASESCAN_TX(txHash), notes };
  results.push(r);
  log(`  PASS  ${suite} -> ${test}`);
  log(`         ${r.txUrl}`);
  if (notes) log(`         Note: ${notes}`);
}

function fail(suite: string, test: string, error: string) {
  results.push({ suite, test, status: 'FAIL', error });
  log(`  FAIL  ${suite} -> ${test}: ${error.slice(0, 200)}`);
}

function skip(suite: string, test: string, reason: string) {
  results.push({ suite, test, status: 'SKIP', notes: reason });
  log(`  SKIP  ${suite} -> ${test}: ${reason}`);
}

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

async function sendTx(args: {
  address: `0x${string}`;
  abi: any[];
  functionName: string;
  args?: any[];
}): Promise<`0x${string}`> {
  const hash = await walletClient.writeContract({
    account,
    chain: baseSepolia,
    address: args.address,
    abi: args.abi,
    functionName: args.functionName,
    args: args.args ?? [],
  } as any);
  await publicClient.waitForTransactionReceipt({ hash, timeout: 60_000 });
  await delay(2500); // Allow RPC read replica state to catch up
  return hash;
}

// ─── Suite 1: InvoiceNFT ─────────────────────────────────────────────────────

async function testInvoiceNFT(c: Registry): Promise<number> {
  const SUITE = 'InvoiceNFT';
  const { contractAddress: addr, abi } = c.InvoiceNFT;
  log(`\n${'='.repeat(60)}\nTesting ${SUITE} @ ${BASESCAN_ADDR(addr)}\n${'='.repeat(60)}`);

  let vaultTokenId = 0n;

  // Mint #1 — to be transferred to deposit wallet
  try {
    const due = BigInt(Math.floor(Date.now() / 1000) + 90 * 86400);
    const h = await sendTx({ address: addr as `0x${string}`, abi, functionName: 'mintInvoice',
      args: [account.address, parseEther('50000'), due, 4, 'ipfs://QmZEEXInvoice001'] });
    pass(SUITE, 'mintInvoice #1 ($50k, rating 4, 90-day due)', h, 'Token ID #1 minted to deployer');

    // Transfer #1 to deposit wallet
    try {
      const h2 = await sendTx({ address: addr as `0x${string}`, abi, functionName: 'transferFrom',
        args: [account.address, DEPOSIT_WALLET, 1n] });
      pass(SUITE, 'transferFrom NFT #1 -> deposit wallet', h2);
    } catch (e: any) { fail(SUITE, 'transferFrom #1', e.message ?? String(e)); }
  } catch (e: any) { fail(SUITE, 'mintInvoice #1', e.message ?? String(e)); }

  // Mint #2 — kept for vault collateral
  try {
    const due = BigInt(Math.floor(Date.now() / 1000) + 180 * 86400);
    const h = await sendTx({ address: addr as `0x${string}`, abi, functionName: 'mintInvoice',
      args: [account.address, parseEther('100000'), due, 5, 'ipfs://QmZEEXInvoice002'] });
    vaultTokenId = 2n;
    pass(SUITE, 'mintInvoice #2 ($100k, rating 5, 180-day due)', h, 'Token ID #2 for vault collateral');
  } catch (e: any) { fail(SUITE, 'mintInvoice #2', e.message ?? String(e)); }

  return Number(vaultTokenId);
}

// ─── Suite 2: InvoiceCreditVault ─────────────────────────────────────────────

async function testInvoiceCreditVault(c: Registry, tokenId: number) {
  const SUITE = 'InvoiceCreditVault';
  const { contractAddress: vAddr, abi: vAbi } = c.InvoiceCreditVault;
  const { contractAddress: nAddr, abi: nAbi } = c.InvoiceNFT;
  const { contractAddress: rAddr, abi: rAbi } = c.RWAToken;
  log(`\n${'='.repeat(60)}\nTesting ${SUITE} @ ${BASESCAN_ADDR(vAddr)}\n${'='.repeat(60)}`);

  if (!tokenId) { skip(SUITE, 'All', 'No invoice token available'); return; }

  // Whitelist vault on RWAToken
  try {
    const h = await sendTx({ address: rAddr as `0x${string}`, abi: rAbi, functionName: 'setWhitelisted', args: [vAddr as `0x${string}`, true] });
    pass(SUITE, 'setWhitelisted vault on RWAToken', h);
  } catch (e: any) { fail(SUITE, 'setWhitelisted vault', e.message ?? String(e)); }

  // Fund vault with RWA stablecoins for borrowing
  try {
    const fh = await sendTx({ address: rAddr as `0x${string}`, abi: rAbi, functionName: 'transfer', args: [vAddr as `0x${string}`, parseEther('10000')] });
    pass(SUITE, 'fund InvoiceCreditVault with 10000 RWA liquidity', fh);
  } catch (e: any) { fail(SUITE, 'fund InvoiceCreditVault', e.message ?? String(e)); }

  // Grant operator approval for vault to manage all NFTs owned by deployer
  try {
    const ah = await sendTx({ address: nAddr as `0x${string}`, abi: nAbi, functionName: 'setApprovalForAll', args: [vAddr as `0x${string}`, true] });
    pass(SUITE, 'setApprovalForAll on InvoiceNFT for vault', ah);
  } catch (e: any) { fail(SUITE, 'setApprovalForAll InvoiceNFT', e.message ?? String(e)); }

  // depositCollateral
  try {
    const h = await sendTx({ address: vAddr as `0x${string}`, abi: vAbi, functionName: 'depositCollateral', args: [BigInt(tokenId)] });
    pass(SUITE, `depositCollateral NFT #${tokenId}`, h, '75% LTV => $75k max borrow');
  } catch (e: any) {
    fail(SUITE, 'depositCollateral', e.message ?? String(e));
    skip(SUITE, 'drawCreditLine', 'depositCollateral failed');
    skip(SUITE, 'repayCreditLine', 'depositCollateral failed');
    return;
  }

  // drawCreditLine
  try {
    const h = await sendTx({ address: vAddr as `0x${string}`, abi: vAbi, functionName: 'drawCreditLine', args: [BigInt(tokenId), parseEther('1000')] });
    pass(SUITE, 'drawCreditLine 1000 tokens against NFT collateral', h);

    // repayCreditLine
    try {
      // Whitelist the deployer explicitly so transferFrom whitelist check passes
      try { await sendTx({ address: rAddr as `0x${string}`, abi: rAbi, functionName: 'setWhitelisted', args: [account.address, true] }); } catch {}
      const ah = await sendTx({ address: rAddr as `0x${string}`, abi: rAbi, functionName: 'approve', args: [vAddr as `0x${string}`, parseEther('5000')] });
      pass(SUITE, 'approve RWAToken (5000) for repay', ah);
      const rh = await sendTx({ address: vAddr as `0x${string}`, abi: vAbi, functionName: 'repayCreditLine', args: [BigInt(tokenId), parseEther('1000')] });
      pass(SUITE, 'repayCreditLine 1000 tokens (NFT returned)', rh);
    } catch (e: any) { fail(SUITE, 'repayCreditLine', e.message ?? String(e)); }
  } catch (e: any) { fail(SUITE, 'drawCreditLine', e.message ?? String(e)); }
}

// ─── Suite 3: RWAToken ───────────────────────────────────────────────────────

async function testRWAToken(c: Registry) {
  const SUITE = 'RWAToken';
  const { contractAddress: addr, abi } = c.RWAToken;
  log(`\n${'='.repeat(60)}\nTesting ${SUITE} @ ${BASESCAN_ADDR(addr)}\n${'='.repeat(60)}`);

  try {
    const h = await sendTx({ address: addr as `0x${string}`, abi, functionName: 'setWhitelisted', args: [DEPOSIT_WALLET, true] });
    pass(SUITE, 'setWhitelisted deposit wallet', h);
  } catch (e: any) { fail(SUITE, 'setWhitelisted', e.message ?? String(e)); }

  try {
    const h = await sendTx({ address: addr as `0x${string}`, abi, functionName: 'transfer', args: [DEPOSIT_WALLET, parseEther('500')] });
    pass(SUITE, 'transfer 500 RWA -> deposit wallet', h);
  } catch (e: any) { fail(SUITE, 'transfer', e.message ?? String(e)); }

  try {
    const h = await sendTx({ address: addr as `0x${string}`, abi, functionName: 'approve', args: [account.address, parseEther('10000')] });
    pass(SUITE, 'approve 10000 RWA (self-approval test)', h);
  } catch (e: any) { fail(SUITE, 'approve', e.message ?? String(e)); }
}

// ─── Suite 4: AirdropDistributor ─────────────────────────────────────────────

async function testAirdropDistributor(c: Registry) {
  const SUITE = 'AirdropDistributor';
  const { contractAddress: aAddr, abi: aAbi } = c.AirdropDistributor;
  const { contractAddress: rAddr, abi: rAbi } = c.RWAToken;
  log(`\n${'='.repeat(60)}\nTesting ${SUITE} @ ${BASESCAN_ADDR(aAddr)}\n${'='.repeat(60)}`);

  try {
    const h = await sendTx({ address: aAddr as `0x${string}`, abi: aAbi, functionName: 'setTokenAddress', args: [rAddr as `0x${string}`] });
    pass(SUITE, 'setTokenAddress (RWAToken)', h);
  } catch (e: any) { fail(SUITE, 'setTokenAddress', e.message ?? String(e)); }

  try {
    const root = keccak256(encodePacked(['string'], ['zeex-airdrop-test-v1']));
    const h = await sendTx({ address: aAddr as `0x${string}`, abi: aAbi, functionName: 'setMerkleRoot', args: [root] });
    pass(SUITE, 'setMerkleRoot (test root)', h, `root: ${root}`);
  } catch (e: any) { fail(SUITE, 'setMerkleRoot', e.message ?? String(e)); }

  for (const addr of [aAddr, DEPOSIT_WALLET] as `0x${string}`[]) {
    try {
      const h = await sendTx({ address: rAddr as `0x${string}`, abi: rAbi, functionName: 'setWhitelisted', args: [addr, true] });
      pass(SUITE, `setWhitelisted ${addr === aAddr ? 'AirdropDistributor' : 'deposit wallet'} on RWAToken`, h);
    } catch (e: any) { fail(SUITE, `whitelist ${addr}`, e.message ?? String(e)); }
  }

  try {
    const fh = await sendTx({ address: rAddr as `0x${string}`, abi: rAbi, functionName: 'transfer', args: [aAddr as `0x${string}`, parseEther('5000')] });
    pass(SUITE, 'fund AirdropDistributor with 5000 RWA', fh);

    // Read airdrop contract balance for diagnostics
    const airdropBal = await publicClient.readContract({ address: rAddr as `0x${string}`, abi: rAbi, functionName: 'balanceOf', args: [aAddr as `0x${string}`] }) as bigint;
    log(`  AirdropDistributor RWA balance: ${formatEther(airdropBal)}`);

    try {
      const h = await sendTx({ address: aAddr as `0x${string}`, abi: aAbi, functionName: 'executeBatchAirdrop', args: [[DEPOSIT_WALLET], [parseEther('1000')]] });
      pass(SUITE, 'executeBatchAirdrop 1000 RWA -> deposit wallet', h);
    } catch (e: any) { fail(SUITE, 'executeBatchAirdrop', e.message ?? String(e)); }

    try {
      const h = await sendTx({ address: aAddr as `0x${string}`, abi: aAbi, functionName: 'withdrawRemainingTokens', args: [] });
      pass(SUITE, 'withdrawRemainingTokens (4000 RWA back to owner)', h);
    } catch (e: any) { fail(SUITE, 'withdrawRemainingTokens', e.message ?? String(e)); }
  } catch (e: any) { fail(SUITE, 'fund AirdropDistributor', e.message ?? String(e)); }
}

// ─── Suite 5: RWATokenFactory ────────────────────────────────────────────────

async function testRWATokenFactory(c: Registry) {
  const SUITE = 'RWATokenFactory';
  const { contractAddress: addr, abi } = c.RWATokenFactory;
  log(`\n${'='.repeat(60)}\nTesting ${SUITE} @ ${BASESCAN_ADDR(addr)}\n${'='.repeat(60)}`);

  try {
    const h = await sendTx({ address: addr as `0x${string}`, abi, functionName: 'createRWAToken',
      args: ['Nairobi Solar Farm RWA', 'NSF-RWA', parseEther('500000'), 'Clean Energy', BigInt(3_000_000)] });
    pass(SUITE, 'createRWAToken (Nairobi Solar Farm RWA, 500k supply, $3M valuation)', h);
  } catch (e: any) { fail(SUITE, 'createRWAToken', e.message ?? String(e)); }

  try {
    const tokens = await publicClient.readContract({ address: addr as `0x${string}`, abi, functionName: 'getDeployedTokens' }) as string[];
    results.push({ suite: SUITE, test: 'getDeployedTokens (view)', status: 'PASS', notes: `${tokens.length} tokens` });
    log(`  PASS  RWATokenFactory -> getDeployedTokens: ${tokens.length} token(s)`);
  } catch (e: any) { fail(SUITE, 'getDeployedTokens', e.message ?? String(e)); }
}

// ─── Suite 6: RevolvingCreditVault ───────────────────────────────────────────

async function testRevolvingCreditVault(c: Registry) {
  const SUITE = 'RevolvingCreditVault';
  const { contractAddress: rcvAddr, abi: rcvAbi } = c.RevolvingCreditVault;
  const { contractAddress: rAddr,   abi: rAbi   } = c.RWAToken;
  log(`\n${'='.repeat(60)}\nTesting ${SUITE} @ ${BASESCAN_ADDR(rcvAddr)}\n${'='.repeat(60)}`);

  // approveFacility
  try {
    const h = await sendTx({ address: rcvAddr as `0x${string}`, abi: rcvAbi, functionName: 'approveFacility',
      args: [account.address, parseEther('50000'), 750n, 600n] });
    pass(SUITE, 'approveFacility ($50k limit, score 750, 6% APR)', h);
  } catch (e: any) { fail(SUITE, 'approveFacility', e.message ?? String(e)); }

  // Whitelist & fund vault
  try {
    const h = await sendTx({ address: rAddr as `0x${string}`, abi: rAbi, functionName: 'setWhitelisted', args: [rcvAddr as `0x${string}`, true] });
    pass(SUITE, 'setWhitelisted RevolvingCreditVault on RWAToken', h);
  } catch (e: any) { fail(SUITE, 'whitelist RCV', e.message ?? String(e)); }

  try {
    const fh = await sendTx({ address: rAddr as `0x${string}`, abi: rAbi, functionName: 'transfer', args: [rcvAddr as `0x${string}`, parseEther('10000')] });
    pass(SUITE, 'fund RevolvingCreditVault 10000 RWA', fh);

    // Diagnostic reads before draw
    const stablecoinAddr = await publicClient.readContract({ address: rcvAddr as `0x${string}`, abi: rcvAbi, functionName: 'stablecoinAddress' }) as string;
    const vaultBal       = await publicClient.readContract({ address: rcvAddr as `0x${string}`, abi: rcvAbi, functionName: 'getVaultBalance' }) as bigint;
    const directBal      = await publicClient.readContract({ address: rAddr as `0x${string}`, abi: rAbi, functionName: 'balanceOf', args: [rcvAddr as `0x${string}`] }) as bigint;
    log(`  RCV stablecoin: ${stablecoinAddr}  (RWAToken: ${rAddr})`);
    log(`  RCV getVaultBalance(): ${formatEther(vaultBal)}`);
    log(`  RWAToken.balanceOf(RCV): ${formatEther(directBal)}`);

    // drawRevolvingCredit
    try {
      const dh = await sendTx({ address: rcvAddr as `0x${string}`, abi: rcvAbi, functionName: 'drawRevolvingCredit', args: [parseEther('2000')] });
      pass(SUITE, 'drawRevolvingCredit 2000 tokens', dh);

      // repayRevolvingCredit
      try {
        const ah = await sendTx({ address: rAddr as `0x${string}`, abi: rAbi, functionName: 'approve', args: [rcvAddr as `0x${string}`, parseEther('2000')] });
        pass(SUITE, 'approve RWAToken for RCV repay', ah);
        const rh = await sendTx({ address: rcvAddr as `0x${string}`, abi: rcvAbi, functionName: 'repayRevolvingCredit', args: [parseEther('2000')] });
        pass(SUITE, 'repayRevolvingCredit 2000 tokens', rh);
      } catch (e: any) { fail(SUITE, 'repayRevolvingCredit', e.message ?? String(e)); }
    } catch (e: any) { fail(SUITE, 'drawRevolvingCredit', e.message ?? String(e)); }
  } catch (e: any) { fail(SUITE, 'fund RevolvingCreditVault', e.message ?? String(e)); }

  // createLoanRFQ
  let rfqId = 0n;
  try {
    const h = await sendTx({ address: rcvAddr as `0x${string}`, abi: rcvAbi, functionName: 'createLoanRFQ',
      args: [parseEther('25000'), 90n, 'Working capital for Q4 export operations'] });
    rfqId = 1n;
    pass(SUITE, 'createLoanRFQ $25k, 90 days, export operations', h);

    // Diagnostic: read RFQ state to verify it was created open
    const rfqState = await publicClient.readContract({ address: rcvAddr as `0x${string}`, abi: rcvAbi, functionName: 'rfqRequests', args: [rfqId] }) as any[];
    log(`  RFQ[${rfqId}] isOpen: ${rfqState[5]} borrower: ${rfqState[1]}`);
  } catch (e: any) { fail(SUITE, 'createLoanRFQ', e.message ?? String(e)); }

  // submitRFQBid
  let bidSubmitted = false;
  if (rfqId > 0n) {
    try {
      const h = await sendTx({ address: rcvAddr as `0x${string}`, abi: rcvAbi, functionName: 'submitRFQBid',
        args: [rfqId, 'ZEEX Invoice Vault', 550n, parseEther('25000')] });
      bidSubmitted = true;
      pass(SUITE, 'submitRFQBid 5.5% APR, $25k max — ZEEX Invoice Vault', h);
    } catch (e: any) { fail(SUITE, 'submitRFQBid', e.message ?? String(e)); }
  } else { skip(SUITE, 'submitRFQBid', 'no RFQ created'); }

  // acceptRFQBid
  if (rfqId > 0n && bidSubmitted) {
    try {
      const h = await sendTx({ address: rcvAddr as `0x${string}`, abi: rcvAbi, functionName: 'acceptRFQBid', args: [rfqId, 0n] });
      pass(SUITE, 'acceptRFQBid (bid index 0, facility upgraded from RFQ)', h);
    } catch (e: any) { fail(SUITE, 'acceptRFQBid', e.message ?? String(e)); }
  } else { skip(SUITE, 'acceptRFQBid', 'no bid submitted'); }
}

// ─── Final deposit ───────────────────────────────────────────────────────────

async function depositSurplus(c: Registry) {
  const SUITE = 'Asset Deposit';
  const { contractAddress: rAddr, abi: rAbi } = c.RWAToken;
  log(`\n${'='.repeat(60)}\nDepositing surplus RWA to ${DEPOSIT_WALLET}\n${'='.repeat(60)}`);

  try {
    const bal = await publicClient.readContract({ address: rAddr as `0x${string}`, abi: rAbi, functionName: 'balanceOf', args: [account.address] }) as bigint;
    if (bal > 0n) {
      const h = await sendTx({ address: rAddr as `0x${string}`, abi: rAbi, functionName: 'transfer', args: [DEPOSIT_WALLET, bal] });
      pass(SUITE, `Transfer all remaining ${formatEther(bal)} RWA to deposit wallet`, h);
    } else {
      skip(SUITE, 'Transfer RWA', 'No remaining balance');
    }
  } catch (e: any) { fail(SUITE, 'Transfer surplus RWA', e.message ?? String(e)); }
}

// ─── Report ──────────────────────────────────────────────────────────────────

function generateReport(deployer: string) {
  const total   = results.length;
  const passed  = results.filter(r => r.status === 'PASS').length;
  const failed  = results.filter(r => r.status === 'FAIL').length;
  const skipped = results.filter(r => r.status === 'SKIP').length;
  const rate    = total - skipped > 0 ? ((passed / (total - skipped)) * 100).toFixed(1) : '0';
  const L = '='.repeat(70);

  console.log(`\n${L}`);
  console.log(`  ZEEX ONCHAIN TEST REPORT`);
  console.log(`  Network:        Base Sepolia (Chain ID: 84532)`);
  console.log(`  Timestamp:      ${new Date().toISOString()}`);
  console.log(L);
  console.log(`  Deployer:       ${deployer}`);
  console.log(`  Deposit Wallet: ${DEPOSIT_WALLET}`);
  console.log(`  Explorer:       https://sepolia.basescan.org`);
  console.log(L);
  console.log(`  Total:    ${total}   |   PASS: ${passed}   FAIL: ${failed}   SKIP: ${skipped}`);
  console.log(`  Pass Rate: ${rate}%`);
  console.log(L);

  for (const suite of [...new Set(results.map(r => r.suite))]) {
    const sr = results.filter(r => r.suite === suite);
    const sp = sr.filter(r => r.status === 'PASS').length;
    const sf = sr.filter(r => r.status === 'FAIL').length;
    const ss = sr.filter(r => r.status === 'SKIP').length;
    console.log(`\n  ${suite}  [${sp} PASS / ${sf} FAIL / ${ss} SKIP]`);
    for (const r of sr) {
      const icon = r.status === 'PASS' ? 'PASS' : r.status === 'FAIL' ? 'FAIL' : 'SKIP';
      console.log(`    [${icon}] ${r.test}`);
      if (r.txUrl)  console.log(`           ${r.txUrl}`);
      if (r.error)  console.log(`           ERROR: ${r.error.slice(0, 180)}`);
      if (r.notes && r.status !== 'FAIL') console.log(`           Note: ${r.notes}`);
    }
  }

  console.log(`\n${L}`);
  console.log('  ALL BASESCAN TRANSACTION LINKS');
  console.log(L);
  for (const r of results.filter(r => r.txHash)) {
    console.log(`  [${r.suite}] ${r.test}`);
    console.log(`  ${r.txUrl}`);
  }
  console.log(`\n${L}\n`);

  // Save JSON
  const reportPath = path.join(__dirname, 'testReport.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    network: 'base-sepolia',
    chainId: 84532,
    deployerAddress: deployer,
    depositWallet: DEPOSIT_WALLET,
    summary: { total, passed, failed, skipped, passRate: `${rate}%` },
    results,
  }, null, 2));
  console.log(`  JSON report: ${reportPath}\n`);
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n${'='.repeat(70)}\n  ZEEX ONCHAIN TEST SUITE - Base Sepolia\n${'='.repeat(70)}`);

  const balWei = await publicClient.getBalance({ address: account.address });
  const balEth = formatEther(balWei);
  log(`Deployer: ${account.address}`);
  log(`Balance:  ${balEth} ETH on Base Sepolia`);

  if (parseFloat(balEth) < 0.001) {
    console.error('\nFATAL: Insufficient ETH for gas.');
    process.exit(1);
  }

  const contracts = await loadOrDeployContracts();

  log('\nContracts:');
  for (const [k, v] of Object.entries(contracts)) {
    log(`  ${k.padEnd(22)} ${(v as ContractEntry).contractAddress}`);
  }

  const invoiceTokenId = await testInvoiceNFT(contracts);
  await testInvoiceCreditVault(contracts, invoiceTokenId);
  await testRWAToken(contracts);
  await testAirdropDistributor(contracts);
  await testRWATokenFactory(contracts);
  await testRevolvingCreditVault(contracts);
  await depositSurplus(contracts);

  generateReport(account.address);
}

main().catch(err => {
  console.error('\nUnhandled error:', err);
  process.exit(1);
});
