// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Test-only hostile stand-in for the reward token.
/// Its mint() tries to re-enter AgentMintNFT.mint() before doing anything.
/// Used to prove the NFT payout cannot be claimed twice in one call.
/// NEVER deploy this to a live network.
contract MaliciousToken {
    address public nft;
    bool public attacked;

    constructor(address nft_) {
        nft = nft_;
    }

    /// @notice Test setup helper: point the token at the collection clone
    /// once the factory has created it.
    function setNft(address nft_) external {
        nft = nft_;
    }

    function mint(address /* to */, uint256 /* amount */) external {
        if (!attacked) {
            attacked = true;
            // Try to re-enter the NFT mint. Expected: reverts (nonReentrant
            // + hasMinted already set). The low-level call result is
            // intentionally ignored: the attacker's own call must fail.
            (bool ok, ) = nft.call(abi.encodeWithSignature("mint()"));
            ok; // silence unused warning; the outcome is checked via state
        }
    }

    /// @notice No-op so the factory can call registerMinter on this token.
    function registerMinter(address /* nft */) external {}
}
