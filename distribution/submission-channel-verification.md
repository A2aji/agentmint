# Submission-Channel Verification — Agent ID Hackathon (Project Awards)

Checked: 24 Nov 2026, ~11:50–12:00 WIB (04:50–05:00 UTC), by text search + page fetch.
Question: where does a project actually submit its name, website, contract addresses, and Agent ID usage description for the Project Awards (Pioneer + Innovation, 58,000 USDC)?

## Verdict

**No public project-submission URL could be found as of 24 Nov 2026.**

The official announcement tells projects to submit those materials during the Submission Period, but publishes no form/portal link for project submission. The only link in the announcement is the **X-promotion survey, which is NOT the project-submission channel** (proven below).

This does NOT mean no channel exists — it means the channel is not recoverable from public text. The most likely explanation is a "Submit Project Now" call-to-action button rendered on the announcement page whose destination URL is not exposed by a text fetch.

## What was checked

### 1. Official announcement (support page) — full text fetched 24 Nov 04:47 UTC
- URL: https://www.binance.com/en/support/announcement/detail/95f5dbe0ea674a48a739b59e046648bf
- Full text read (277 lines). It contains the instruction "Submit your project name, website, contract address(es), Agent ID usage description, and other required materials during the Submission Period. No registration needed." — but **no link, form URL, or portal is given for this step**.
- `browser.find` for "Submit Project Now" on the fetched page: **not found** in the fetched text.
- The ONLY outbound link in the whole announcement text is the "campaign survey" link (see §2). All other links are Terms/Privacy pages.
- The Terms section confirms a submission exists in some form: "Rewards will be sent to the reward receiving address provided during project submission." So a project-submission form is implied, but its URL is not in the text.

### 2. The X-promotion survey link — opened and read
- URL: https://app.binance.com/uni-qr/user-survey/ff6832f8d2984af289068c9450a3c98c
- Page text (fetched 24 Nov 04:49 UTC): "Focusing on projects participating in the Agent ID Hackathon, you can publish original content on X to share your views, project analysis, product experience, or application scenario insights... Make sure to include the designated hashtags: #BinanceWalletHackathon and #AgenticWallet to be eligible. Please log into your Binance account to begin the survey."
- **Conclusion: this survey is exclusively for submitting X-post links for the $2,000 Community Promotion Campaign. It is NOT the project-submission channel.** Do NOT submit project details through it.

### 3. Binance Square post (same announcement) — full text fetched
- URL: https://www.binance.com/en/square/post/389517345917641
- Full text read (334 lines). Same content as the announcement; no submit link; no comments visible in the text fetch (comments are not included in the fetched text, so a pinned comment with a link cannot be ruled out from this check alone).
- A second Square news post (https://www.binance.com/en-JP/square/post/11-18-2026-binance-wallet-and-bnb-chain-to-host-agent-id-hackathon-with-60-000-usdc-in-rewards-389517706162185) is only a news summary — no submit link either.

### 4. Search-index evidence for a "Submit Project Now" button
- Across 4 web searches, the search index consistently shows the text **"Submit Project Now"** appearing in the announcement immediately after the Submission Period lines and before "How to Participate".
- This text does NOT appear in the fetched page text. The consistent placement in the index strongly suggests it is a **rendered-page CTA button** on the announcement page (likely linking to the submission form), whose `href` is stripped by text-only fetching.
- **No search result, in any query, returned the destination URL of that button.**

### 5. Agent OS homepage — fetched
- URL: https://www.binance.com/en/agent-os
- No hackathon content, no submission link. It is a developer-toolkit page (MCP server, APIs, skills).

### 6. Web3 dev docs — attempted
- URL: https://web3.binance.com/en/dev-docs
- Page returned only "Loading..." (JavaScript-rendered); nothing readable, no submit link found.

### 7. Web searches (4 queries, 24 Nov)
- "Binance Agent ID Hackathon submit project form"
- "Binance Agent ID Hackathon how to submit project Binance Wallet"
- "\"Agent ID Hackathon\" submission Binance"
- "\"Submit Project Now\" Binance Agent ID Hackathon"
- "Binance Wallet X Agent ID Hackathon submit project survey app.binance.com"
- **No result in any query gave a project-submission form URL.** Third-party coverage (Tokenearly, Airdroplet, Outposts) only repeats the announcement text. Airdroplet (19 Nov) explicitly notes: "We reviewed public rules without installing software, pairing a wallet or submitting an entry. The survey flow was not tested; follow the link in the official announcement rather than a copied form." Outposts notes the hackathon was announced via Binance Wallet's official X account — but no X post with a submission link surfaced in search.

## What still needs to be done (action for Bos / parent agent)

1. **Live-browser check (highest priority):** open the announcement page (https://www.binance.com/en/support/announcement/detail/95f5dbe0ea674a48a739b59e046648bf) in a real browser, find the "Submit Project Now" button, and record its destination URL. This is the single most likely location of the real channel.
2. **Check the Square post's comments** in the live browser / Binance app — a pinned comment may carry the form link (not visible in text fetch).
3. **Check the Binance App** — the announcement implies in-app surfaces (Agent ID banner in Wallet); a hackathon banner in the app may link to the form.
4. **Ask in an official channel if 1–3 fail:** Binance Wallet's official X account or BNB Chain Discord (discord.gg/bnbchain) — ask where projects submit; do NOT trust any form link from an unofficial source, and never enter credentials/seed phrases anywhere.
5. **Deadline pressure:** do this well before 9 Dec 16:00 WIB — do not discover on the last day that the channel needs a Binance login or an in-app step.

## Sources (all fetched 24 Nov 2026)

- Announcement: https://www.binance.com/en/support/announcement/detail/95f5dbe0ea674a48a739b59e046648bf
- Square post: https://www.binance.com/en/square/post/389517345917641
- X survey (NOT project submit): https://app.binance.com/uni-qr/user-survey/ff6832f8d2984af289068c9450a3c98c
- Agent OS: https://www.binance.com/en/agent-os
- Dev docs: https://web3.binance.com/en/dev-docs
- Airdroplet analysis: https://airdroplet.com/news/229
- Tokenearly mirror: https://tokenearly.com/announcement/6afd58ad469cbda8baf54f30.html
