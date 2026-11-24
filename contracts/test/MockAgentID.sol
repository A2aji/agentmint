// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

/// @notice Test-only stand-in for the official Agent ID contract.
/// Anyone can mint a mock id to any address, so tests can create holders
/// and non-holders at will. NEVER deploy this to a live network.
contract MockAgentID is ERC721 {
    uint256 private _nextId = 1;

    constructor() ERC721("Mock Agent ID", "MAID") {}

    function mintTo(address to) external returns (uint256 tokenId) {
        tokenId = _nextId;
        _nextId += 1;
        _mint(to, tokenId);
    }
}
