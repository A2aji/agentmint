# AgentMint — Innovation Award Submission Package

Status: CONTRACTS LIVE — most placeholders filled 24 Nov 2026. Remaining: 30-address threshold (currently 1), reward receiving address (Bos's call), demo video (optional), and the final submit. Submit before **9 Dec 2026, 16:00 WIB (08:00 UTC)**.

✅ SUBMISSION CHANNEL — RESOLVED 24 Nov 2026: the announcement's "Submit Project Now" button leads to the **"Agent ID Hackathon Project Submission Form"** at **https://www.binance.com/en/survey/fb26d2bd25e04329b1ba77c7b3811d23** (co-hosted Binance Wallet + BNB Chain; deadline 9 Dec 2026 08:00 UTC; requires product live + ≥30 Agent ID addresses interacting). The form needs a Binance login to start. Do NOT submit project details through the X-promotion survey (ff6832f8d2984af289068c9450a3c98c) — that is for X posts only.

---

## 1. Project name

**AgentMint**

- One team = one project. This is the only project submitted by this team.
- The name does not use "Binance" or "BNB" as if it were an official product. It is presented as "built for the Binance Agent ID Hackathon" (participant), not as an official Binance product.

## 2. Website

- Website URL: https://a2aji.github.io/agentmint/
- Live since 24 Nov 2026, with the mint page working (Genesis collection live; first mint verified end-to-end 24 Nov).
- The site must show: what AgentMint is, how to mint, contract addresses, and the owner-permissions disclosure (Section 7).

## 3. Contract addresses (BNB Chain mainnet, chain ID 56)

Only the addresses listed here are counted for the Pioneer Award — list ALL of them.

| Contract | Address | BscScan link |
|---|---|---|
| Factory (launchpad) | 0xFF6A1F2070f395Be9cA150Be4eBbd44d6b92267C | https://bscscan.com/address/0xFF6A1F2070f395Be9cA150Be4eBbd44d6b92267C |
| NFT template | 0x1a3b457Af5fF36283d2444C47F65622c123AC979 | https://bscscan.com/address/0x1a3b457Af5fF36283d2444C47F65622c123AC979 |
| Reward token | 0x608112c648C48Df948cebEFcfE39871fC9DB6085 | https://bscscan.com/address/0x608112c648C48Df948cebEFcfE39871fC9DB6085 |
| Genesis collection (first, live) | 0x167E161F3882159c9110D8319c9943aC56a20d4d | https://bscscan.com/address/0x167E161F3882159c9110D8319c9943aC56a20d4d |

Requirements (all must be true before submitting):
- [x] Deployed on BNB Chain mainnet (not testnet)
- [x] Source code verified AND open-source on BscScan for every contract (confirmed via BscScan screenshots 24 Nov; all 4 addresses incl. Genesis show the Source Code badge + green check)
- [x] GitHub repo public with the exact verified source: https://github.com/A2aji/agentmint

## 4. Agent ID usage description

(Copy-ready text for the submission form — adapt to the form's field length.)

> AgentMint is a free-mint NFT launchpad where Agent ID is the access control and identity layer, enforced on-chain, not just in the frontend.
>
> 1. **Access control (mint gate):** the mint function checks `balanceOf` on the Agent ID contract (`0x60b9262456de011f7d15a54cdd8c48baaa8b022f`) and reverts for any caller without an Agent ID. Only Agent ID holders can mint.
> 2. **Access control (launch gate):** only Agent ID holders can launch a new collection through the factory contract — same on-chain check.
> 3. **Identity:** the minter's and launcher's `.ai` name is resolved and displayed on the collection page, so every NFT is visibly tied to an Agent ID identity.
> 4. **Reward:** every mint sends a fixed amount of the community reward token to the minter in the same transaction. The token is a community utility reward for participating; it is not an investment and no value is promised.
>
> Agent ID is therefore core to the product's functionality and business flow (30% of the Innovation score), not a cosmetic add-on.

## 5. Team / contact

- Builder: Aji — Agent ID `jiazi22.ai`
- Wallet (BSC): `0xaD50d4C370e1a55d7517215E33b0176472260720`
- Reward receiving address (for prize distribution, per the announcement's Terms): [PLACEHOLDER — Bos to confirm; default = the Agentic wallet 0xaD50d4C370e1a55d7517215E33b0176472260720 unless he says otherwise]
- Contact / X: [PLACEHOLDER — Bos's X handle, only if he wants it listed]
- GitHub: A2aji — https://github.com/A2aji/agentmint

## 6. Product description (for the judges)

- **What it is:** a launchpad where Agent ID holders launch free-mint NFT collections, and Agent ID holders mint from them for free, receiving a community reward token in the same transaction.
- **Problem it solves:** launching an Agent ID-gated mint today requires writing and deploying a custom contract; AgentMint makes it a one-click flow, and gives every Agent ID holder a reason to try another holder's collection.
- **Live status:** live since 24 Nov 2026; **1 unique Agent ID address interacted so far** (the Agentic wallet's own test mint, Genesis NFT #1 + 1,000 AMT) — minimum 30 required before submitting (see tracker in `recruitment-guide.md`).
- **Demo:** [PLACEHOLDER — link to a short demo video or a step-by-step mint walkthrough, if made]
- **Innovation angle:** first launchpad where the launch + mint gates AND the displayed identity are all the Agent ID itself; the "mint + community reward in one transaction" pattern reuses a model already proven live 11 times by this builder (AgentNOVA, Undead, COSMOS free mints).

## 7. Owner permissions disclosure (required by the hackathon rules)

List every owner-only permission honestly. Filled in from the deployed contracts (24 Nov 2026).

| Permission | Who holds it | What it can do | Why it exists |
|---|---|---|---|
| Token DEFAULT_ADMIN_ROLE (grant/revoke roles) | Main wallet 0xC7ad79B7571b2202D1Af7DF5f297aE111B39bc37 (deployer) | Grant/revoke REGISTRAR_ROLE and MINTER_ROLE on the reward token | Administering which collections may mint rewards |
| Token mint(to, amount) — onlyRole(MINTER_ROLE) | Only NFT collections registered as minters (each collection clone, e.g. Genesis) | Mint AMT to a minter, capped at 1,000,000,000 AMT total supply (cap can never be raised) | The reward payout in the mint flow; no pre-mine (totalSupply was 0 at deploy) |
| Token registerMinter(nft) — onlyRole(REGISTRAR_ROLE) | Factory 0xFF6A1F2070f395Be9cA150Be4eBbd44d6b92267C (holds REGISTRAR_ROLE) | Grant MINTER_ROLE to a newly created collection clone | Wiring each new collection to the reward token |
| Factory pause()/unpause() — onlyOwner | Main wallet 0xC7ad79B7571b2202D1Af7DF5f297aE111B39bc37 (Factory owner) | Pause creating new collections (existing collections and mints unaffected) | Emergency stop for new launches |
| Collection pause()/unpause() — onlyOwner | The collection's launcher (for Genesis: Agentic wallet 0xaD50d4C370e1a55d7517215E33b0176472260720) | Pause minting for that one collection | Emergency stop per collection |
| Collection setBaseURI() — onlyOwner | The collection's launcher | Change the metadata base URI for that collection | Updating artwork/metadata |
| Withdraw | None — no withdraw function exists anywhere | N/A | Mints and collection creation are free (value 0), so the contracts never hold user funds |
| Set reward amount | None — payoutPerMint is fixed at collection creation and cannot be changed after | N/A | The reward is fixed per collection by design |

Also documented: reward token total supply cap **1,000,000,000 AMT, fixed, never raisable**; distribution rule **fixed amount per mint (1,000 AMT for Genesis), no pre-mine to the team** (deployer holds 0 AMT; the only AMT in existence is the 1,000 AMT from the test mint); and confirmed **no hidden approvals / no bundled extra transfers / no unlimited allowances** are requested from users (mint is value 0, no token approval is ever asked for).

## 8. Other materials the announcement asks for

- [ ] Project name (Section 1)
- [ ] Website (Section 2)
- [ ] Contract address(es) (Section 3)
- [ ] Agent ID usage description (Section 4)
- [ ] Reward receiving address (Section 5)
- [ ] GitHub repo (public, exact verified source)
- [ ] Demo / walkthrough link (if the form asks for one)
- [ ] Any other field the submission form shows — **record the form's actual fields here once the channel is found**, and fill them in; do not guess fields in advance.

## 9. Submission checklist (day of submit, 9 Dec before 16:00 WIB)

- [x] Submission channel confirmed (see warning at top) and form opened
- [ ] 30+ eligible Agent ID addresses verified in the tracker
- [x] All contracts verified + open-source on BscScan
- [x] Website live, mint tested end-to-end
- [x] Owner permissions documented (Section 7) and matching the deployed contracts
- [ ] No banned wording on the website or in the submission text
- [ ] One project only — no second submission from this team
- [ ] Copy of the submitted form saved (screenshot + text) in this folder
