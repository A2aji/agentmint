# AgentMint — BSC testnet runbook (status 24 Nov 2026: BLOCKED on tBNB)

## Blocker (what happened, exactly)

The testnet deployer wallet has **0 tBNB** and no tBNB could be obtained
from this VM on 24 Nov 2026:

- **Official BNB testnet faucet** (`https://testnet.bnbchain.org/faucet-smart`
  → redirects to `https://www.bnbchain.org/en/testnet-faucet`): the page loads
  (HTTP 200) but claiming requires solving an **hCaptcha**
  (`js.hcaptcha.com/1/api.js`, `hcaptcha.render` / `hcaptcha.execute` in the
  page JS). No API endpoint exists that accepts an address without a captcha
  token — POSTing to the guessed `/faucet-smart/api/claim` returns the HTML
  faucet page, not a claim.
- **Chainstack faucet** (`https://faucet.chainstack.com/bnb-testnet-faucet`):
  page loads (HTTP 200) but requires a Chainstack account login.
- **Chainlink faucet** (`https://faucets.chain.link/bnb-chain-testnet`): page
  loads; claim flow is wallet-connect + captcha in the browser.
- **QuickNode faucet**: requires a QuickNode account (sign-up + login).

None of these can be completed with `curl` from a headless VM. This is the
only blocker: everything else in Fase 3 is built, tested locally, and ready.

## What is ready (no tBNB needed)

- Testnet deployer + 2 test wallets generated locally. Private keys ONLY in
  `~/workspace/agentmint/.env` (mode 600, gitignored). Public addresses in
  `deployments/test-accounts.json`:
  - Deployer: `0x1917eaea3d9092487E8De6a8068A1359C8b2882B`
  - Tester2 (gets a mock Agent ID): `0x9D7cC11dDD293e9133bD1fB90dCFdEBf8742e4Dd`
  - Tester3 (NO mock Agent ID, for the negative test): `0x81645E749e75fC7a42fbCF01AEddfB59004ce619`
- `scripts/deploy-mock.js` — deploys MockAgentID, mints mock IDs to deployer
  + tester2, writes `deployments/<chainId>-mock.json`.
- `scripts/deploy.js` — already parameterized with `AGENT_ID_ADDRESS`.
- `scripts/e2e.js` — the 4 end-to-end checks (a–d), writes
  `deployments/<chainId>-e2e.json`, exit 1 on any failure.
- Full local dry run on Hardhat node (chain 31337): **ALL 4 E2E checks PASS**
  (see `deployments/31337-e2e.json`; createCollection 389,832 gas, mint
  171,548 gas — both inside the ranges in the README).
- BSC testnet RPC that works from this VM:
  `https://data-seed-prebsc-2-s1.binance.org:8545/` (chain 97, gas price
  0.1 gwei). The old `data-seed-prebsc-1-s1` timed out twice; the config now
  points at `2-s1`.

## Estimated tBNB needed (at 0.1 gwei, from the local dry run)

| Step | Gas | tBNB |
|---|---|---|
| Deploy MockAgentID + 2 mock mints | ~1,135,000 | ~0.000114 |
| Deploy token + NFT impl + factory + grant role | ~3,300,000 | ~0.000330 |
| E2E: createCollection + mint + 2 reverting calls | ~600,000 | ~0.000060 |
| **Total** | **~5,000,000** | **~0.0005** |

The official faucet pays **0.5 tBNB** per claim — about 1,000× what this
runbook needs. One claim is enough for deployer + both testers.

## How to unblock (Bos, from his phone — 2 minutes)

1. Open the official faucet in the phone browser:
   `https://testnet.bnbchain.org/faucet-smart` (or
   `https://www.bnbchain.org/en/testnet-faucet`).
2. Paste the deployer address `0x1917eaea3d9092487E8De6a8068A1359C8b2882B`,
   solve the captcha, claim. tBNB has no real value; this address is a
   throwaway testnet-only wallet, NOT Bos's wallet.
3. Tell Muse "tBNB sudah dikirim". Muse then runs the commands below.
   (Alternative: Bos sends the tBNB from his own wallet — same address,
   same result.)

## Runbook — once the deployer holds tBNB

From `~/workspace/agentmint/` (keys already in `.env`, never printed):

```bash
# 0. Confirm the balance arrived (expect >= 0.01 tBNB)
node -e "const {ethers}=require('ethers');(async()=>{const p=new ethers.JsonRpcProvider('https://data-seed-prebsc-2-s1.binance.org:8545/');console.log('deployer tBNB:',ethers.formatEther(await p.getBalance('0x1917eaea3d9092487E8De6a8068A1359C8b2882B')));})();"

# 1. Deploy MockAgentID + mint mock IDs to deployer + tester2
npx hardhat run scripts/deploy-mock.js --network bscTestnet

# 2. Fund the two tester wallets with gas money from the deployer
#    (~0.001 tBNB each is far more than enough; do it with a tiny script
#    or from any wallet — the amounts are testnet-only)
node scripts/fund-testers.js   # TODO: create when tBNB arrives (2 x 0.001 tBNB)

# 3. Deploy token + NFT implementation + factory against the mock
AGENT_ID_ADDRESS=$(node -e "console.log(require('./deployments/97-mock.json').mockAgentId)") \
  npx hardhat run scripts/deploy.js --network bscTestnet

# 4. Run the end-to-end checks (expects 4 x PASS)
npx hardhat run scripts/e2e.js --network bscTestnet

# 5. Fill the frontend config with the real testnet addresses
#    deployments/97.json -> token / nftImplementation / factory
#    deployments/97-mock.json -> mockAgentId
#    then open frontend/index.html (see README "Mint page" section)

# 6. (Optional) verify the testnet contracts on testnet BscScan — see BSCSCAN.md
```

## After testnet passes

- Mainnet deploy is a separate, gated step: `CONFIRM_MAINNET_DEPLOY=yes`
  + Bos's explicit go-ahead, real Agent ID address (the default), real BNB
  for gas (~0.0003–0.0005 BNB at 0.05 gwei). Nothing in this runbook touches
  mainnet.
