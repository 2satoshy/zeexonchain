# 🚀 ZEEX Smart Contract Onchain Test Report (Base Sepolia)

**Network:** Base Sepolia Testnet (Chain ID: `84532`)  
**Deposit Wallet:** `0x871Cf2D6126fD068133E9F2d8d53CdeC59a98f29`  
**Deployer Address:** `0x96864036945b4F73b475FEf5f3F8b70DE55C9C2c`  
**Explorer:** [https://sepolia.basescan.org](https://sepolia.basescan.org)  

---

## 🛠️ Summary of Contract Bug Fixes Applied

1. **`InvoiceNFT.sol`**:
   - Added full ERC-721 approval methods (`approve`, `getApproved`, `setApprovalForAll`, `isApprovedForAll`).
   - Enabled `transferFrom` to verify `_operatorApprovals[from][msg.sender]` and `_tokenApprovals[tokenId] == msg.sender` so vault contracts can lock NFT collateral seamlessly.

2. **`RevolvingCreditVault.sol`**:
   - Implemented check-effects-interactions pattern inside `drawRevolvingCredit` to check vault balance before state mutation.
   - Added helper methods `getVaultBalance()` and `availableCredit(address)`.

3. **`testOnchain.ts`**:
   - Added 2.5-second RPC state propagation delay between transactions to guarantee state synchronization on Base Sepolia read replicas.
   - Standardized fresh deployment and contract address linking.

---

## 📊 Summary of Test Results

| Contract Suite | Total Tests | Passed | Failed | Skipped | Status |
|---|:---:|:---:|:---:|:---:|:---:|
| **InvoiceNFT** | 3 | 3 | 0 | 0 | ✅ PASS |
| **InvoiceCreditVault** | 5 | 5 | 0 | 0 | ✅ PASS |
| **RWAToken** | 3 | 3 | 0 | 0 | ✅ PASS |
| **AirdropDistributor** | 6 | 6 | 0 | 0 | ✅ PASS |
| **RWATokenFactory** | 2 | 2 | 0 | 0 | ✅ PASS |
| **RevolvingCreditVault** | 6 | 6 | 0 | 0 | ✅ PASS |
| **Asset Deposit Sweeper** | 1 | 1 | 0 | 0 | ✅ PASS |
| **TOTAL** | **26** | **26** | **0** | **0** | **100% SUCCESS** |

---

## 🔗 Deployed Contract Addresses & Onchain Transactions

### 1. InvoiceNFT
**Deployed Address:** [`0x7372d29c061829fa323f8b8de8637c92e60861cb`](https://sepolia.basescan.org/address/0x7372d29c061829fa323f8b8de8637c92e60861cb)

- 🟢 **mintInvoice #1** ($50k Invoice, ID #1): [`0x21bbfd1a9f2c3975db4af6e0457d72440169260751f0cbf10298e9fc69a3fce0`](https://sepolia.basescan.org/tx/0x21bbfd1a9f2c3975db4af6e0457d72440169260751f0cbf10298e9fc69a3fce0)
- 🟢 **transferFrom NFT #1 -> Deposit Wallet**: [`0xfcd9454801a7d95498b9fbfd958accf77c29a001df5a782f8a8bf9ccef143cc3`](https://sepolia.basescan.org/tx/0xfcd9454801a7d95498b9fbfd958accf77c29a001df5a782f8a8bf9ccef143cc3)
- 🟢 **mintInvoice #2** ($100k Invoice, ID #2): [`0x6a446504191f40b8512d05619a6d3f939e618f68e0d6136b64e54e2b9920dcad`](https://sepolia.basescan.org/tx/0x6a446504191f40b8512d05619a6d3f939e618f68e0d6136b64e54e2b9920dcad)

---

### 2. InvoiceCreditVault
**Deployed Address:** [`0xa4167f3192ef5ca29967a36c70e54c5b2f5baba7`](https://sepolia.basescan.org/address/0xa4167f3192ef5ca29967a36c70e54c5b2f5baba7)

- 🟢 **setWhitelisted (Vault on RWAToken)**: [`0xed1176305d89a76965438c3adf21cd9da1f104d98b0b306bcbb98adfc05061fd`](https://sepolia.basescan.org/tx/0xed1176305d89a76965438c3adf21cd9da1f104d98b0b306bcbb98adfc05061fd)
- 🟢 **Fund Vault (10,000 RWA)**: [`0x81567dbb1c6c184251adbc73fb2eca403a82f7a6249d0ea64e6d385f2e794499`](https://sepolia.basescan.org/tx/0x81567dbb1c6c184251adbc73fb2eca403a82f7a6249d0ea64e6d385f2e794499)
- 🟢 **setApprovalForAll (NFT #2 to Vault)**: [`0xdf0e29d8f1c619d30ff8f6c2ac74d5b9966a7a533162bfe8818a6236aada8723`](https://sepolia.basescan.org/tx/0xdf0e29d8f1c619d30ff8f6c2ac74d5b9966a7a533162bfe8818a6236aada8723)
- 🟢 **depositCollateral (Lock NFT #2)**: [`0x0af261cee4b82eae0d96a5133f93f76c63b9c3704d5ad4a2e7de5edd87b7f148`](https://sepolia.basescan.org/tx/0x0af261cee4b82eae0d96a5133f93f76c63b9c3704d5ad4a2e7de5edd87b7f148)
- 🟢 **drawCreditLine (1,000 RWA)**: [`0xeb3be923dc17a424c0d9a11464187bc18dbecbe25554c7cf86775b75e7398b16`](https://sepolia.basescan.org/tx/0xeb3be923dc17a424c0d9a11464187bc18dbecbe25554c7cf86775b75e7398b16)
- 🟢 **repayCreditLine (1,000 RWA, Unlock NFT #2)**: [`0x02ea99592bce539d2ab92897de0e5c562c8acac0e6b0fc5355e34a7c9fcca59f`](https://sepolia.basescan.org/tx/0x02ea99592bce539d2ab92897de0e5c562c8acac0e6b0fc5355e34a7c9fcca59f)

---

### 3. RWAToken
**Deployed Address:** [`0x31edbb923356b5eecf05d7e9bcd2d292acb84517`](https://sepolia.basescan.org/address/0x31edbb923356b5eecf05d7e9bcd2d292acb84517)

- 🟢 **setWhitelisted (Deposit Wallet)**: [`0xfba828c80a78f8bc8a34bfd793717e5e99dcd30057b34656dd81b3362e98544d`](https://sepolia.basescan.org/tx/0xfba828c80a78f8bc8a34bfd793717e5e99dcd30057b34656dd81b3362e98544d)
- 🟢 **transfer (500 RWA -> Deposit Wallet)**: [`0xbcc00c0f981b4ee96a607ab143e84dd82536357f3f047efeba7e06b0a1e04279`](https://sepolia.basescan.org/tx/0xbcc00c0f981b4ee96a607ab143e84dd82536357f3f047efeba7e06b0a1e04279)
- 🟢 **approve (10,000 RWA)**: [`0x74f7fc564a31377d08c8f8d3005787c0a6a029d592681c0505532b667d672c26`](https://sepolia.basescan.org/tx/0x74f7fc564a31377d08c8f8d3005787c0a6a029d592681c0505532b667d672c26)

---

### 4. AirdropDistributor
**Deployed Address:** [`0x0d2439da90f035625f9e1e66bd0b2fadbbd62f1f`](https://sepolia.basescan.org/address/0x0d2439da90f035625f9e1e66bd0b2fadbbd62f1f)

- 🟢 **setTokenAddress (RWAToken)**: [`0x6fcf34a8e0dcf9826529455270cb31f8ebb1fd51586897c641c0691632276e2d`](https://sepolia.basescan.org/tx/0x6fcf34a8e0dcf9826529455270cb31f8ebb1fd51586897c641c0691632276e2d)
- 🟢 **setMerkleRoot (Test Root)**: [`0xf7f80cacee64e52d6b7a21e87dce4ca78fb222c0bb77dd270d860959babf93b7`](https://sepolia.basescan.org/tx/0xf7f80cacee64e52d6b7a21e87dce4ca78fb222c0bb77dd270d860959babf93b7)
- 🟢 **setWhitelisted (AirdropDistributor)**: [`0x7873fb2ef5ec12e78fd4c69c98c66999ab7dde409e4a6026759fe2790fe71bd1`](https://sepolia.basescan.org/tx/0x7873fb2ef5ec12e78fd4c69c98c66999ab7dde409e4a6026759fe2790fe71bd1)
- 🟢 **Fund Airdrop (5,000 RWA)**: [`0xd8a6ec6e3506a25d73771dabff6a80838268dd88d911589c649dc9aa043d57df`](https://sepolia.basescan.org/tx/0xd8a6ec6e3506a25d73771dabff6a80838268dd88d911589c649dc9aa043d57df)
- 🟢 **executeBatchAirdrop (1,000 RWA -> Deposit Wallet)**: [`0xfd25e2fea7f182e9af24d745363ff21dd2ef9c77b80a814c898eb9e642b0310b`](https://sepolia.basescan.org/tx/0xfd25e2fea7f182e9af24d745363ff21dd2ef9c77b80a814c898eb9e642b0310b)
- 🟢 **withdrawRemainingTokens (4,000 RWA back to owner)**: [`0x73fd8026482547faf30a33e3b9d280631af8876653d39b65b283c47764a2cb75`](https://sepolia.basescan.org/tx/0x73fd8026482547faf30a33e3b9d280631af8876653d39b65b283c47764a2cb75)

---

### 5. RWATokenFactory
**Deployed Address:** [`0xb0b2d3693de37eb69369f28744aa8d10f207fab2`](https://sepolia.basescan.org/address/0xb0b2d3693de37eb69369f28744aa8d10f207fab2)

- 🟢 **createRWAToken (Nairobi Solar Farm RWA, 500k supply)**: [`0x3581eb1d2c5e8ae85aa06f422a457df07241ab66da9bb8a81005dea24a1b3b89`](https://sepolia.basescan.org/tx/0x3581eb1d2c5e8ae85aa06f422a457df07241ab66da9bb8a81005dea24a1b3b89)

---

### 6. RevolvingCreditVault
**Deployed Address:** [`0x5167df545a0d2a07f74ef76c905439d2e402fda0`](https://sepolia.basescan.org/address/0x5167df545a0d2a07f74ef76c905439d2e402fda0)

- 🟢 **approveFacility ($50k limit, score 750, 6% APR)**: [`0x130a2ab2a5efb86ff0a6428ab20b89f4ddb89492b13ff3a2409c042dc01a3e80`](https://sepolia.basescan.org/tx/0x130a2ab2a5efb86ff0a6428ab20b89f4ddb89492b13ff3a2409c042dc01a3e80)
- 🟢 **setWhitelisted (RCV on RWAToken)**: [`0x52ce2a61960da75d1d7d526488cd44f0df40fdee875ac4cf890a1d8c38bbc2b5`](https://sepolia.basescan.org/tx/0x52ce2a61960da75d1d7d526488cd44f0df40fdee875ac4cf890a1d8c38bbc2b5)
- 🟢 **Fund RevolvingCreditVault (10,000 RWA)**: [`0x0770829ee2cda3987f0b8736bc8fef32ef6feec2ee434f145536486099bed48d`](https://sepolia.basescan.org/tx/0x0770829ee2cda3987f0b8736bc8fef32ef6feec2ee434f145536486099bed48d)
- 🟢 **drawRevolvingCredit (2,000 RWA)**: [`0x2e431031be1430f55bcc30d60fe254c42d8a1254b70345f67fc00d75946f7e53`](https://sepolia.basescan.org/tx/0x2e431031be1430f55bcc30d60fe254c42d8a1254b70345f67fc00d75946f7e53)
- 🟢 **repayRevolvingCredit (2,000 RWA)**: [`0x3282166903a4f6d92dc7f0117dc5285decf7ce9506c1866095fe907c2e00e924`](https://sepolia.basescan.org/tx/0x3282166903a4f6d92dc7f0117dc5285decf7ce9506c1866095fe907c2e00e924)
- 🟢 **createLoanRFQ ($25k, 90 days, Export Ops)**: [`0x96d7b518acb47259749cb2749fb5eff27c5fa1d106edb93c9abb3e8d58f92fe6`](https://sepolia.basescan.org/tx/0x96d7b518acb47259749cb2749fb5eff27c5fa1d106edb93c9abb3e8d58f92fe6)
- 🟢 **submitRFQBid (5.5% APR, $25k max)**: [`0xf59f9cadf117f2c797189b80696f7c6914f22e94192d5e334bc5d3fa93a2aba7`](https://sepolia.basescan.org/tx/0xf59f9cadf117f2c797189b80696f7c6914f22e94192d5e334bc5d3fa93a2aba7)
- 🟢 **acceptRFQBid (Facility Upgraded from RFQ)**: [`0xc41e6ccd8275387cbdaeb4761b70f1c9c4facce2837b600fcaf682f887feafb8`](https://sepolia.basescan.org/tx/0xc41e6ccd8275387cbdaeb4761b70f1c9c4facce2837b600fcaf682f887feafb8)

---

### 7. Asset Sweeper to Target Wallet
**Target Wallet:** `0x871Cf2D6126fD068133E9F2d8d53CdeC59a98f29`

- 🟢 **Transfer All Remaining RWA Tokens (978,500 RWA)**: [`0x1cbb0a5af661f77576b6269e7aeca440a84551ae882193a4aa24ce032aea1744`](https://sepolia.basescan.org/tx/0x1cbb0a5af661f77576b6269e7aeca440a84551ae882193a4aa24ce032aea1744)
- 🟢 **Transfer InvoiceNFT #1**: [`0xfcd9454801a7d95498b9fbfd958accf77c29a001df5a782f8a8bf9ccef143cc3`](https://sepolia.basescan.org/tx/0xfcd9454801a7d95498b9fbfd958accf77c29a001df5a782f8a8bf9ccef143cc3)
