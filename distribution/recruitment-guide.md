# AgentMint — Recruitment Guide: 30+ Agent ID Addresses

Goal: at least **30 unique addresses that hold an Agent ID** interact with the AgentMint contract(s) during the Submission Period (18 Nov – 9 Dec 2026, 08:00 UTC / 16:00 WIB 9 Dec). This is the minimum eligibility threshold for the Innovation Award, and the core metric for the Pioneer Award. Only interactions inside the period count.

Status: DRAFT — update the contract addresses and website URL once live. Nothing here is posted or sent on Bos's behalf.

---

## 1. Where Agent ID holders actually gather (verified 24 Nov 2026)

Do NOT invent or join random "Agent ID" groups — no dedicated Agent ID holders Telegram/Discord group could be verified as of 24 Nov 2026 (one airdrop guide explicitly lists the campaign Telegram/Discord as "not verified"). Use only the channels below, all confirmed to exist:

| Channel | What it is | Link / handle (verified) |
|---|---|---|
| Binance Square — official hackathon announcement post | The announcement itself; its replies are where participants discuss the hackathon | https://www.binance.com/en/square/post/389517345917641 |
| Binance Square — Agent ID topic / search | Post the Square announcement draft here; search "Agent ID" on Square for active threads | binance.com/en/square (search: Agent ID) |
| X — hashtags | #BinanceWalletHackathon and #AgenticWallet; also follow @BNBCHAIN and Binance Wallet's official X account, which announced the hackathon | x.com — search the two hashtags |
| BNB Chain Discord | Official server, ~306k members | discord.gg/bnbchain |
| BNB Chain Telegram (English community chat) | Official community chat | t.me/BNBchaincommunity |
| BNB Chain Telegram (Bahasa Indonesia) | Official Indonesian community chat — Bos's home audience | t.me/BNBChain_Indonesia |
| Binance official Discord | ~308k members; general Binance community | discord.gg/bnb |
| SPACE ID Discord | Agent ID runs on SPACE ID infrastructure; ~384k members | Search "SPACE ID" on Discord (official server) |
| SPACE ID Telegram news channel | One-way announcements channel, ~29.5k subscribers — read-only, do NOT spam it | @spaceid_news on Telegram |
| Binance App — in-app community | Binance Chat / Square inside the app; Agent ID banner is in Wallet | In-app only |

Rules for every channel: read the room first, follow each community's rules, post once per channel per announcement (no repeated spam), never DM people unsolicited, never ask anyone for a seed phrase / private key / password, never promise token value.

## 2. What to say to them (message templates)

Keep every message short, factual, and in the channel's language. Never use "passive income", "return", "earn money", or any promise of token value. The draw is: **free mint + community reward token in the same transaction, only for Agent ID holders**.

**Short version (X / Telegram / Discord):**

> AgentMint is live — a free-mint NFT launchpad for Agent ID holders on BNB Chain. Hold a .ai name? Mint free (gas only) and get a community reward token in the same tx. Try it: [WEBSITE URL]

**Longer version (Square / Discord #showcase):**

> Built for the Binance Agent ID Hackathon: AgentMint lets any Agent ID holder launch a free-mint NFT collection, and any Agent ID holder mint from it for free. Every mint also sends a community reward token in the same transaction. Contracts verified on BscScan: [ADDRESSES]. Your .ai name shows as the minter. Feedback welcome — what would you launch?

**Reply template (when someone asks "what do I get?"):**

> The mint is free — you only pay gas. You get the NFT plus a community reward token in the same transaction. The token is a community utility reward, not an investment, and there's no promise of value. If you hold a .ai Agent ID, you can try it here: [WEBSITE URL]

**What NEVER to say:** anything about profit, price, "free money", "guaranteed reward value", or asking people to create extra wallets / register multiple accounts. All interactions must be organic, from real Agent ID holders — mass registration or volume manipulation means immediate disqualification.

## 3. Day-by-day action plan (24 Nov – 9 Dec 2026)

Build is ~5–7 days, so distribution starts the day the site is live. Dates below assume launch ~30 Nov–1 Dec; shift forward if launch is earlier — earlier is strictly better.

**Week 1 — 24–30 Nov (prepare + soft launch)**
- 24 Nov: finish contract design; set up this tracking sheet (Section 4).
- 25–27 Nov: build + testnet deploy. Post NOTHING public yet.
- 28–29 Nov: mainnet deploy + BscScan verification. Test-mint from Bos's own wallet; confirm the NFT + reward token land in one tx.
- 30 Nov: LAUNCH DAY. Bos posts the X thread from his phone + the Square post. Post the short version in BNB Chain Telegram EN + ID, BNB Chain Discord, Binance Discord (only in channels where self-promo is allowed — check rules first). **Week-1 target: 10 unique Agent ID addresses.**

**Week 2 — 1–7 Dec (push + second wave)**
- 1 Dec: check the count (Section 4). If <10, post a follow-up on Square replying to the hackathon announcement thread with a mint screenshot/proof.
- 2–3 Dec: second X post (main announcement post if the thread went first, or vice versa). Share in SPACE ID Discord. Ask the first minters (in public replies, never DM spam) what collection they would launch — engagement brings visibility.
- 4 Dec: mid-week count check. If <20, add one more angle: post in the Indonesian BNB Chain Telegram group with an Indonesian-language version of the short message.
- 5–6 Dec: weekend push — most holders are online. Repost the Square post once with an update ("X Agent ID holders have minted so far").
- 7 Dec: count check. **Week-2 target: cumulative 25 unique Agent ID addresses.**

**Final stretch — 8–9 Dec (close the gap, submit)**
- 8 Dec: final count. If below 30, one last round: X + Telegram EN/ID + Discord, all with the updated count ("27/30 Agent ID holders in — 3 more to reach the threshold").
- 9 Dec before 16:00 WIB: FINAL count, screenshot the tracker, submit the project (see `innovation-submission-package.md`). **Final target: 30+ unique Agent ID addresses, and as many transactions as honestly earned.**

## 4. How to track unique interacting Agent ID addresses

The metric that counts: **distinct wallet addresses that (a) hold an Agent ID and (b) sent a transaction to one of the submitted AgentMint contract addresses between 18 Nov 08:00 UTC and 9 Dec 08:00 UTC.**

**Method A — manual, via BscScan (no tools needed):**
1. Open each submitted contract on BscScan: `bscscan.com/address/[CONTRACT ADDRESS]`.
2. Open the **Transactions** tab (and **Token Transfers** for the reward token) and list every interacting `from` address.
3. Deduplicate the addresses across all three contracts (factory, NFT template, reward token).
4. For each address, verify it holds an Agent ID: on BscScan open the Agent ID contract `0x60b9262456de011f7d15a54cdd8c48baaa8b022f` → **Read Contract** → `balanceOf` → paste the address → result must be `> 0`.
5. Record the result in the tracker table below. Count only addresses that pass step 4 AND whose first interaction is inside the Submission Period.

**Method B — semi-automatic (coordinator, once contracts are live):**
Use the BscScan API (free tier) to pull the transaction list per contract, deduplicate `from` addresses, then batch-check `balanceOf` on the Agent ID contract. Keep the script and its output in `~/workspace/agentmint/distribution/` as `tracker-output-YYYY-MM-DD.md` so the count is auditable.

**Tracker table (update at every count check):**

| Date (WIB) | Unique interacting addresses (raw) | Of those, hold Agent ID | Cumulative eligible | Notes |
|---|---|---|---|---|
| [DATE] | [N] | [N] | [N] | [e.g. launch day] |
| 30 Nov | | | | |
| 4 Dec | | | | |
| 7 Dec | | | | |
| 9 Dec (final) | | | | Submit day |

**Do NOT count:** Bos's own wallet (it is one address, and it is the deployer — it counts as an interacting address only if it also mints as a holder, but never inflate the number with it), repeat transactions from the same address, or any address that does not hold an Agent ID.

## 5. Weekly targets

| Milestone | Date | Target (cumulative eligible addresses) |
|---|---|---|
| Launch | ~30 Nov | 0 → first minters |
| Week 1 | 30 Nov | 10 |
| Week 2 | 7 Dec | 25 |
| Submit | 9 Dec 16:00 WIB | **30+** |

If the count is behind target by more than 5 at any check, the fix is more visibility (one more honest post in a channel not yet used, a reply in the Square announcement thread), never incentives that look like paid interaction or mass registration.

## 6. Red lines (apply to all recruitment)

- No "passive income" / "return" / "earn money" / promises of token value anywhere.
- No asking anyone to create extra wallets or accounts; no volume manipulation.
- No seed phrases, private keys, passwords, or pairing codes — never ask, never accept.
- No QR-code login on the AgentMint website (wallet connect via standard WalletConnect / injected wallet only, user confirms every transaction themselves).
- Project is presented as a hackathon participant ("built for the Binance Agent ID Hackathon"), never as an official Binance product; never use "Binance"/"BNB" in the project name as if official.
