# AgentMint — Owner Permissions

Required by the hackathon rules: every owner permission (mint, pause,
withdraw, etc.) must be documented. This file is the complete list. There
are no hidden permissions: everything an owner can do is a function below,
and everything else reverts.

## Roles at a glance

| Role | Held by (at deploy) | Can do |
|---|---|---|
| Token admin (`DEFAULT_ADMIN_ROLE`) | Deployer (Bos's wallet) | Grant/revoke `MINTER_ROLE` and `REGISTRAR_ROLE`; nothing else |
| `REGISTRAR_ROLE` on the token | Factory (granted by admin after deploy) | Register new collections as minters |
| `MINTER_ROLE` on the token | Each NFT collection (granted by the factory at launch) | Mint AMT only as a payout for its own mints |
| Factory owner | Deployer (Bos's wallet) | Pause/unpause launching new collections |
| Collection owner | The launcher who called `createCollection` | Pause/unpause minting on their collection; change its base URI |

## AgentMintToken

- **Admin (`DEFAULT_ADMIN_ROLE`), deployer only:**
  - `grantRole` / `revokeRole` for `MINTER_ROLE` and `REGISTRAR_ROLE`.
  - The admin CANNOT mint tokens directly (minting needs `MINTER_ROLE`,
    which the admin does not hold by default), CANNOT change the cap,
    CANNOT change the name/symbol, CANNOT pause transfers, CANNOT freeze
    any holder's balance. There is no pause, no blacklist, no upgrade.
- **`MINTER_ROLE`:** only `mint(to, amount)`, and only up to the
  1,000,000,000 AMT cap. Each collection can only mint as a payout when
  its own `mint()` runs; it cannot mint to arbitrary addresses on demand
  (its `mint()` always pays the caller, and only once per address).
- **`REGISTRAR_ROLE`:** only `registerMinter(nft)`, which grants
  `MINTER_ROLE` to one collection contract. Held by the factory only.
- **Nobody** can mint beyond the cap, change the cap, or mint without a role.

## AgentMintFactory

- **Owner (deployer):**
  - `pause()` / `unpause()` — stops / resumes launching NEW collections.
    Pausing the factory does NOT pause minting on collections that already
    exist, and does NOT touch the token.
  - The owner CANNOT launch a collection without holding an Agent ID
    (the same gate applies to the owner), CANNOT mint from any collection,
    CANNOT change a collection's settings, CANNOT collect any fee (there
    is no fee), and CANNOT upgrade the factory or any collection.
- **Anyone holding an Agent ID:** `createCollection(...)` — launch a
  collection with the name, symbol, max supply, base URI, and payout they
  choose. The launcher becomes that collection's owner.
- **Anyone without an Agent ID:** cannot launch (reverts).

## AgentMintNFT (each collection)

- **Owner (the launcher):**
  - `pause()` / `unpause()` — stops / resumes minting on their collection only.
  - `setBaseURI(uri)` — changes the metadata base URI.
  - The owner CANNOT mint to themselves without holding an Agent ID and
    without respecting the 1-per-address limit, CANNOT mint more than
    `maxSupply`, CANNOT change `maxSupply` or `payoutPerMint` after launch,
    CANNOT mint AMT directly (only the collection contract can, as a payout),
    CANNOT withdraw anything (the contract holds no funds; minting is
    value 0), and CANNOT transfer ownership (no such function).
- **Anyone holding an Agent ID:** `mint()` — one free NFT + fixed AMT
  payout, once per collection. Costs only gas.
- **Anyone without an Agent ID:** cannot mint (reverts).

## Setup step (must run once after deploy)

After `scripts/deploy.js` (which does this automatically), the token admin
must grant `REGISTRAR_ROLE` to the factory address. Without it, the first
`createCollection` call reverts and no collection can launch. The deploy
script performs this grant from the deployer account.

## What the contracts cannot do, by design

- No function moves, holds, or withdraws native currency or any token
  except the fixed AMT payout minted to the minter.
- No unlimited token allowances anywhere (`approve` is never called).
- No function reads or uses a private key, seed phrase, or pairing code.
- No upgrade path: logic cannot be swapped after deploy.
