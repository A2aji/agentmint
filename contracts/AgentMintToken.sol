// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/// @title AgentMintToken (AMT)
/// @notice Community utility reward token for the AgentMint launchpad.
/// @dev Minting is restricted to addresses holding MINTER_ROLE. Total supply
/// is capped at 1,000,000,000 AMT and the cap can never be raised. There is
/// no public mint function and no address can mint without the role.
/// The token is a launchpad community reward. It carries no promise of any
/// kind about future value.
contract AgentMintToken is ERC20, ERC20Capped, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant REGISTRAR_ROLE = keccak256("REGISTRAR_ROLE");

    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10 ** 18;

    constructor() ERC20("AgentMint Reward Token", "AMT") ERC20Capped(MAX_SUPPLY) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /// @notice Mint `amount` tokens to `to`. Only addresses with MINTER_ROLE
    /// (the NFT collections created through the factory, or addresses the
    /// admin explicitly approved) can call this. Enforces the supply cap.
    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }

    /// @notice Grant MINTER_ROLE to an NFT collection contract.
    /// Only addresses with REGISTRAR_ROLE (the factory, once the admin
    /// grants it) can call this. Lets the factory register each new
    /// collection without giving the factory full admin rights.
    function registerMinter(address nft) external onlyRole(REGISTRAR_ROLE) {
        _grantRole(MINTER_ROLE, nft);
    }

    function _update(address from, address to, uint256 value) internal override(ERC20, ERC20Capped) {
        super._update(from, to, value);
    }
}
