# AgentMint

Free-mint NFT launchpad gated by Agent ID, with an instant community reward
token payout in the same transaction. Built for the Agent ID Hackathon
(submit window 18 Nov – 9 Dec 2026).

- Any Agent ID holder can launch a free-mint NFT collection.
- Any Agent ID holder can mint from a collection, for free (value 0, gas only).
- Every successful mint also mints a fixed amount of AMT reward tokens to
  the minter, in the same transaction.
- One NFT per address per collection. Supply per collection is capped at
  launch. The reward token supply is capped at 1,000,000,000 AMT and the
  cap can never be raised.

AMT is a community utility reward token for the launchpad. It is not a
promise of anything about future value, and this project makes no such
promise anywhere — in code, comments, or docs. (One language note: Solidity
requires a keyword for a function's declared output values; where that
keyword appears in `.sol` files it is syntax, not a statement about the
token.)

## Contracts

| Contract | File | What it does |
|---|---|---|
| `AgentMintToken` | `contracts/AgentMintToken.sol` | ERC-20 reward token "AgentMint Reward Token" (AMT), 18 decimals, capped at 1,000,000,000. Minting only via `MINTER_ROLE`. |
| `AgentMintNFT` | `contracts/AgentMintNFT.sol` | ERC-721 free-mint collection template. Agent ID gate, 1 NFT per address, max supply, fixed AMT payout per mint, pausable, reentrancy-guarded. Deployed as EIP-1167 clones. |
| `AgentMintFactory` | `contracts/AgentMintFactory.sol` | Lets any Agent ID holder launch a new collection. Records every collection, emits `CollectionCreated`. Pausable by its owner. |

### Agent ID gate

Both launching and minting check the official Agent ID contract:

- Address: `0x60b9262456de011f7d15a54cdd8c48baaa8b022f`
- Source: official Agent ID Hackathon announcement,
  https://www.binance.com/en/support/announcement/detail/95f5dbe0ea674a48a739b59e046648bf
  ("Agent ID Contract (BNB Chain) … Contract name: SPACE ID Agent ID,
  Symbol: AI, Standard: ERC-721, Non-transferable"). Re-verified live
  24 Nov 2026.
- Check: `balanceOf(address) > 0` means the address holds an Agent ID.
- The address is passed as a constructor / initialize parameter (not
  hardcoded) so tests can use a mock and a future official change does not
  need a new implementation contract.

### Why EIP-1167 clones (not full deploys per collection)

- **Gas:** launching a collection as a clone costs ~362k–410k gas, vs
  ~1,773,188 gas for a full `AgentMintNFT` deploy. Every launcher saves
  ~1.36M gas.
- **Verification:** minimal proxies are a standard pattern BscScan
  verifies (proxy + implementation). The implementation is deployed and
  verified once; each clone points at it.
- **Trade-off:** clones share implementation logic, so a bug fix needs a
  new implementation + new factory. That is acceptable here: collections
  are short-lived free mints, and the implementation is frozen after audit.

### What is NOT in the contracts

- No `approve()` call anywhere, no unlimited allowance. Minting needs no
  token approval from the minter.
- No public/free mint function on the token. No owner mint.
- No fee, no treasury cut, no withdraw function. Minting is value 0.
- No upgrade proxy. The factory and token are not upgradeable.

## Install (fresh machine / after a VM replacement)

Requirements: Node.js 20+ and npm (tested with Node v24.22.1, npm 10.9.4).

```bash
git clone https://github.com/A2aji/agentmint.git
cd agentmint
npm install
npx hardhat compile
npx hardhat test
```

Exact install (what this repo was built with):

```bash
npm install --save-dev hardhat@^2.26.0 @nomicfoundation/hardhat-toolbox@hh2 dotenv
npm install --save @openzeppelin/contracts @openzeppelin/contracts-upgradeable
```

Notes:

- Install locally inside the repo, never global (`npm install -g` does not
  survive a VM replacement).
- Do NOT install `@nomicfoundation/hardhat-toolbox@latest` (v7.0.0): that
  version is a placeholder shim that works with neither Hardhat 2 nor 3.
  This repo pins Hardhat 2.29.2 + toolbox 6.1.2 (`@hh2` tag).
- Solidity 0.8.24, optimizer on (200 runs), EVM target Cancun (required:
  OpenZeppelin 5.6 uses the `mcopy` builtin).
- OpenZeppelin 5.6.1 no longer ships `ReentrancyGuardUpgradeable`, and the
  plain `ReentrancyGuard` relies on a constructor that never runs on a
  clone. `AgentMintNFT` therefore uses its own storage-based mint guard
  (`nonReentrantMint` modifier) — see the contract comments.

## Tests

```bash
npx hardhat test
```

24 tests, all passing (24 Nov 2026). Coverage:

- Agent ID gate: non-holder mint/launch reverts; holder succeeds.
- Exact payout: AMT per mint equals `payoutPerMint`; minter balance grows
  by exactly that amount.
- Token cap: minting up to exactly 1,000,000,000 AMT works; 1 unit more
  reverts (`ERC20ExceededCap`).
- Factory: launch records the collection + event; only holders can launch.
- Limits: 1 NFT per address per collection; collection max supply enforced.
- Pause: mint/launch revert while paused; only the owner can pause/unpause.
- Owner-only functions revert for non-owners.
- No unlimited approvals: automated check that no contract calls
  `approve()` or uses `type(uint256).max`.
- Reentrancy: a hostile token that re-enters `mint()` mid-mint (even while
  holding an Agent ID itself) gets nothing; the minter still gets exactly 1 NFT.
- A failed reward payout reverts the whole mint (no free NFT).

## Gas (Hardhat, optimizer 200 runs, Solidity 0.8.24)

| Action | Gas |
|---|---|
| Deploy `AgentMintToken` | 829,068 |
| Deploy `AgentMintNFT` implementation (once) | 1,773,188 |
| Deploy `AgentMintFactory` | 658,836 |
| All three deploys, total | 3,261,092 |
| `createCollection` (clone) | 362,496 – 410,178 (avg ~405,599 in tests) |
| `mint` (NFT + AMT payout) | 128,787 – 171,548 (avg ~163,710 in tests) |

At 0.05 gwei, all three deploys cost ~0.000163 native token; a clone
launch ~0.00002; a mint ~0.000008. (Mainnet deploy cost must be re-checked
with the live gas price at deploy time.)

## Deploy

```bash
cp .env.example .env
# edit .env: DEPLOYER_PRIVATE_KEY (never commit .env, never paste the key in chat)
npx hardhat run scripts/deploy.js --network bscTestnet
```

The script deploys token → NFT implementation → factory, grants the factory
`REGISTRAR_ROLE` on the token (required before the first collection can be
launched), and writes the addresses + gas used to `deployments/<chainId>.json`.

### Testnet (chain 97) — mock Agent ID first

The official Agent ID contract does not exist on BSC testnet, so testnet
deploys point at `MockAgentID` instead. Full status + runbook:
[TESTNET.md](TESTNET.md). Short version:

```bash
npx hardhat run scripts/deploy-mock.js --network bscTestnet
AGENT_ID_ADDRESS=$(node -e "console.log(require('./deployments/97-mock.json').mockAgentId)") \
  npx hardhat run scripts/deploy.js --network bscTestnet
npx hardhat run scripts/e2e.js --network bscTestnet   # 4 checks, exit 1 on failure
```

Status 24 Nov 2026: **blocked on tBNB** — the deployer wallet holds 0 tBNB
and every tBNB faucet needs an interactive captcha or an account login (see
TESTNET.md). The whole flow was dry-run on a local Hardhat node instead:
all 4 E2E checks pass (`deployments/31337-e2e.json`).

### Mint page

Static page in `frontend/` (`index.html` + `config.js` + `app.js`, ethers.js
v6 via CDN, no build step). Connects through the browser's injected wallet
(e.g. MetaMask) — no QR code, no pairing code, no seed phrase. It checks the
wallet's Agent ID balance, lists collections from the factory, mints free
(value 0, gas only), and shows NFT + AMT balances. Fill `frontend/config.js`
from `deployments/<chainId>.json` after deploy (testnet addresses are still
empty until the testnet deploy lands).

Open it locally:

```bash
cd frontend && python3 -m http.server 8000
# open http://localhost:8000/ (file:// also works, but a local server avoids
# browser quirks with ES modules / CDN fetches)
```

Publish it with GitHub Pages once the repo exists (no push has been made yet):

```bash
# from the repo root, after the GitHub repo is created (do NOT run before):
git add frontend && git commit -m "AgentMint: static mint page" && git push
# GitHub repo → Settings → Pages → Source: Deploy from a branch →
# Branch: main, Folder: /frontend → Save.
# Page goes live at https://<user>.github.io/<repo>/ (a few minutes).
```

`frontend/` is a plain static folder on purpose: Pages serves it with no
build step, and the same files work on any static host.

Mainnet (chain 56) is guarded: the script refuses unless
`CONFIRM_MAINNET_DEPLOY=yes` is set, and mainnet deploy happens only with
an explicit go-ahead. After deploy, verify all three contracts on BscScan
(source must be public and verified for the hackathon).

Optional first collection at deploy time:

```bash
CREATE_GENESIS=true GENESIS_NAME="AgentMint Genesis" GENESIS_SYMBOL=AMG \
  GENESIS_MAX_SUPPLY=10000 GENESIS_PAYOUT_PER_MINT=1000 \
  npx hardhat run scripts/deploy.js --network bscTestnet
```

(The deployer must hold an Agent ID for the genesis launch to succeed.)

### Deploy path note — the Binance Agentic Wallet CLI cannot deploy

Tested 24 Nov 2026 with `baw` v1.12.0 (wallet CONNECTED, Developer Mode on):

- `baw contract-call preview --binanceChainId 97 ... --inputData <token creation bytecode>`
  (no `--to`, preview only) → backend error `351721 SERVICE_ERROR`:
  "No wallet address found for the selected network. Please ensure the
  wallet has been set up for this network before transferring."
  The wallet has no testnet (97) address, so the testnet path is blocked
  at the account level.
- Same preview on chain 56 → backend error `code 2 SERVICE_ERROR`:
  "to is required for EVM contract-call". The backend requires `--to`,
  so a contract-creation transaction (no `to`) cannot go through
  `baw contract-call` at all.

Conclusion: **deployment cannot go through `baw`**. Deploy with the
Hardhat script above from a signer the deployer controls
(`DEPLOYER_PRIVATE_KEY` from the environment), or another deploy path the
project owner chooses. `scripts/creation-data.js` prints the full creation
bytecode for any contract if another signing path needs it:

```bash
npx hardhat run scripts/creation-data.js
CONTRACT=AgentMintFactory TOKEN_ADDRESS=0x... IMPL_ADDRESS=0x... \
  npx hardhat run scripts/creation-data.js
```

## Owner permissions

See [PERMISSIONS.md](PERMISSIONS.md) — who can do what on each contract
(token admin, factory owner, collection owner/launcher), what each role
cannot do, and the exact setup step (grant `REGISTRAR_ROLE` to the factory).

## Project layout

```
contracts/
  AgentMintToken.sol        ERC-20 reward token, capped, role-gated mint
  AgentMintNFT.sol          ERC-721 free-mint collection (clone template)
  AgentMintFactory.sol      Collection launcher (EIP-1167 clones)
  test/
    MockAgentID.sol         test-only Agent ID stand-in (never deploy live)
    MaliciousToken.sol      test-only reentrancy attacker (never deploy live)
test/
  AgentMint.test.js         24 tests
scripts/
  deploy.js                 testnet/mainnet deploy (parameterized, key via env)
  deploy-mock.js            testnet only: deploy MockAgentID + mint mock IDs
  e2e.js                    end-to-end checks a–d against a live deployment
  verify-args.js            write factory constructor-args file for BscScan verify
  creation-data.js          creation bytecode for external signing paths
frontend/
  index.html + config.js + app.js   static mint page (ethers.js via CDN)
deployments/
  31337.json                local-network deploy record (example)
TESTNET.md                  testnet blocker (tBNB faucet) + runbook
BSCSCAN.md                  exact BscScan verification recipe per contract
hardhat.config.js           networks 97 (testnet) + 56 (mainnet), gas reporter
PERMISSIONS.md              owner-permission documentation
.env.example                env template (no secrets)
```
