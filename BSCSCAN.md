# AgentMint — BscScan verification guide

Do NOT submit any verification from here until the mainnet deploy exists
(mainnet deploy happens only with an explicit go-ahead). This file is the
exact recipe, so verification is one command per contract when the time comes.
Testnet verification (chain 97) uses the same recipe with `--network bscTestnet`
and is safe to do as soon as the testnet deploy lands.

## Settings (identical for every contract)

| Setting | Value |
|---|---|
| Compiler | Solidity **0.8.24** |
| Optimizer | Enabled, **200 runs** |
| EVM version | **Cancun** (required: OpenZeppelin 5.6 uses the `mcopy` builtin) |
| License | MIT |
| Runs / other | defaults |

Source is multi-file (OpenZeppelin imports). Use the Hardhat verify plugin
below — it uploads the Standard JSON input, so no flattening is needed.
Flattened source (`npx hardhat flatten contracts/<Contract>.sol`) is the
manual fallback on the BscScan "Verify & Publish" page with the same settings.

## 0. One-time setup

Get a free BscScan API key (testnet: testnet.bscscan.com, mainnet:
bscscan.com) and export it — never commit it:

```bash
export BSCSCAN_API_KEY=<key>
```

## 1. AgentMintToken (ERC-20 reward token)

- Constructor args: **none**.
- Verify:

```bash
npx hardhat verify --network bsc <token-address>
# testnet:
npx hardhat verify --network bscTestnet <token-address>
```

## 2. AgentMintNFT implementation

- Constructor args: **none** (the constructor only calls
  `_disableInitializers()`; per-collection settings go through
  `initialize()`, not the constructor).
- Verify:

```bash
npx hardhat verify --network bsc <implementation-address>
```

## 3. AgentMintFactory

- Constructor args: `(implementation, rewardToken, agentId)` — three addresses.
  Generate the args file from the deployment record:

```bash
node scripts/verify-args.js 56        # mainnet (or 97 for testnet)
npx hardhat verify --network bsc \
  --constructor-args deployments/verify-args-56-factory.js <factory-address>
```

## 4. MockAgentID (TESTNET ONLY)

- Constructor args: **none**.
- Verify on testnet only. This contract must NEVER be deployed or verified
  on mainnet.

```bash
npx hardhat verify --network bscTestnet <mock-address>
```

## 5. Collection clones (EIP-1167 minimal proxies)

Each collection created through the factory is a minimal-proxy clone of the
implementation. Clones are NOT verified individually:

1. Verify the implementation once (step 2 above).
2. On the clone's BscScan page, use **"Verify as Proxy"** (or "More Options →
   Is this a proxy?") — BscScan reads the implementation address from the
   proxy bytecode and links it automatically.
3. The clone's `initialize()` arguments are call data, not constructor
   arguments — nothing extra to supply.

## Checklist before submitting to the hackathon

- [ ] Token verified + open-source on BscScan (mainnet).
- [ ] NFT implementation verified + open-source on BscScan (mainnet).
- [ ] Factory verified + open-source on BscScan (mainnet).
- [ ] At least one collection clone shows as a verified proxy.
- [ ] The verified source matches the deployed bytecode (BscScan shows the
      green checkmark; re-check after any redeploy — addresses change).
