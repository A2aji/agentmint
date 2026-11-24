# AgentMint — Innovation Award Submission Package (FRAMEWORK)

Status: FRAMEWORK — fill in every [PLACEHOLDER] once the contracts are live and the 30-address threshold is reached. Submit before **9 Dec 2026, 16:00 WIB (08:00 UTC)**.

⚠️ SUBMISSION CHANNEL — UNRESOLVED AS OF 24 NOV 2026 (see `submission-channel-verification.md` in this folder): the official announcement instructs projects to "submit your project name, website, contract address(es), Agent ID usage description, and other required materials during the Submission Period" but publishes **no public project-submission form URL**. The only link in the announcement is the X-promotion survey (app.binance.com), which is for X posts only, NOT for project submission. The search index shows a "Submit Project Now" button on the announcement page — its destination URL could not be recovered from a text fetch. **Before submitting, Bos (or the parent agent with live-browser access) must open the announcement page in a real browser and click "Submit Project Now" to capture its destination.** Do NOT submit project details through the X survey — that is the wrong channel.

---

## 1. Project name

**AgentMint**

- One team = one project. This is the only project submitted by this team.
- The name does not use "Binance" or "BNB" as if it were an official product. It is presented as "built for the Binance Agent ID Hackathon" (participant), not as an official Binance product.

## 2. Website

- Website URL: [PLACEHOLDER — e.g. https://agentmint.[DOMAIN]]
- Must be live at submission time, with the mint page working.
- The site must show: what AgentMint is, how to mint, contract addresses, and the owner-permissions disclosure (Section 7).

## 3. Contract addresses (BNB Chain mainnet, chain ID 56)

Only the addresses listed here are counted for the Pioneer Award — list ALL of them.

| Contract | Address | BscScan link |
|---|---|---|
| Factory (launchpad) | [PLACEHOLDER — 0x...] | https://bscscan.com/address/[PLACEHOLDER] |
| NFT template | [PLACEHOLDER — 0x...] | https://bscscan.com/address/[PLACEHOLDER] |
| Reward token | [PLACEHOLDER — 0x...] | https://bscscan.com/address/[PLACEHOLDER] |

Requirements (all must be true before submitting):
- [ ] Deployed on BNB Chain mainnet (not testnet)
- [ ] Source code verified AND open-source on BscScan for every contract
- [ ] GitHub repo public with the exact verified source: [PLACEHOLDER — GITHUB REPO URL]

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
- Reward receiving address (for prize distribution, per the announcement's Terms): [PLACEHOLDER — confirm with Bos; default = the wallet above unless he says otherwise]
- Contact / X: [PLACEHOLDER — Bos's X handle, only if he wants it listed]
- GitHub: [PLACEHOLDER — repo owner, e.g. A2aji]

## 6. Product description (for the judges)

- **What it is:** a launchpad where Agent ID holders launch free-mint NFT collections, and Agent ID holders mint from them for free, receiving a community reward token in the same transaction.
- **Problem it solves:** launching an Agent ID-gated mint today requires writing and deploying a custom contract; AgentMint makes it a one-click flow, and gives every Agent ID holder a reason to try another holder's collection.
- **Live status:** live since [PLACEHOLDER — DATE], [N] unique Agent ID addresses interacted during the Submission Period (minimum 30 required — see tracker in `recruitment-guide.md`).
- **Demo:** [PLACEHOLDER — link to a short demo video or a step-by-step mint walkthrough, if made]
- **Innovation angle:** first launchpad where the launch + mint gates AND the displayed identity are all the Agent ID itself; the "mint + community reward in one transaction" pattern reuses a model already proven live 11 times by this builder (AgentNOVA, Undead, COSMOS free mints).

## 7. Owner permissions disclosure (required by the hackathon rules)

List every owner-only permission honestly. Fill in after the contracts are written.

| Permission | Who holds it | What it can do | Why it exists |
|---|---|---|---|
| [e.g. pause minting] | [owner address / multisig / none] | [description] | [reason] |
| [e.g. mint reward tokens] | [PLACEHOLDER] | [capped at X total supply / mintable only by minter flow] | [reason] |
| [e.g. withdraw] | [PLACEHOLDER — note: mints are free, so there should be no user funds to withdraw] | [description] | [reason] |
| [e.g. set reward amount] | [PLACEHOLDER] | [description] | [reason] |

Also document: reward token total supply cap [PLACEHOLDER — e.g. 1,000,000, fixed], distribution rule [PLACEHOLDER — e.g. fixed amount per mint, no pre-mine to the team beyond (state it or state zero)], and confirm no hidden approvals / no bundled extra transfers / no unlimited allowances are requested from users.

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

- [ ] Submission channel confirmed (see warning at top) and form opened
- [ ] 30+ eligible Agent ID addresses verified in the tracker
- [ ] All contracts verified + open-source on BscScan
- [ ] Website live, mint tested end-to-end
- [ ] Owner permissions documented (Section 7) and matching the deployed contracts
- [ ] No banned wording on the website or in the submission text
- [ ] One project only — no second submission from this team
- [ ] Copy of the submitted form saved (screenshot + text) in this folder
