// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "./AgentMintNFT.sol";

/// @notice Minimal interface of the reward token used by the factory.
interface IFactoryToken {
    function registerMinter(address nft) external;
}

/// @title AgentMintFactory
/// @notice Lets any Agent ID holder launch a new free-mint NFT collection.
/// @dev New collections are EIP-1167 minimal-proxy clones of the NFT
/// implementation contract (see README for the gas + verification reasoning).
/// The factory holds REGISTRAR_ROLE on the reward token (granted by the token
/// admin at setup) so each new collection is registered as a minter without
/// the factory holding full admin rights over the token.
contract AgentMintFactory is Ownable, Pausable {
    address public immutable implementation;
    address public immutable rewardToken;
    address public immutable agentId;

    address[] public collections;
    mapping(address => bool) public isCollection;

    event CollectionCreated(
        address indexed launcher,
        address indexed collection,
        string name,
        string symbol,
        uint256 maxSupply,
        uint256 payoutPerMint
    );

    constructor(address implementation_, address rewardToken_, address agentId_) Ownable(msg.sender) {
        require(implementation_ != address(0), "AgentMintFactory: implementation is zero address");
        require(rewardToken_ != address(0), "AgentMintFactory: token is zero address");
        require(agentId_ != address(0), "AgentMintFactory: agent id is zero address");
        implementation = implementation_;
        rewardToken = rewardToken_;
        agentId = agentId_;
    }

    /// @notice Launch a new free-mint collection. Caller must hold an Agent ID.
    /// @param name_ Collection name. @param symbol_ Collection symbol.
    /// @param maxSupply_ Maximum NFTs the collection can mint.
    /// @param baseURI_ Metadata base URI for the collection.
    /// @param payoutPerMint_ Fixed AMT reward per successful mint.
    function createCollection(
        string memory name_,
        string memory symbol_,
        uint256 maxSupply_,
        string memory baseURI_,
        uint256 payoutPerMint_
    ) external whenNotPaused returns (address collection) {
        require(IERC721(agentId).balanceOf(msg.sender) > 0, "AgentMintFactory: caller holds no Agent ID");
        collection = Clones.clone(implementation);
        AgentMintNFT(collection).initialize(
            name_,
            symbol_,
            maxSupply_,
            baseURI_,
            payoutPerMint_,
            rewardToken,
            agentId,
            msg.sender
        );
        collections.push(collection);
        isCollection[collection] = true;
        IFactoryToken(rewardToken).registerMinter(collection);
        emit CollectionCreated(msg.sender, collection, name_, symbol_, maxSupply_, payoutPerMint_);
    }

    /// @notice Number of collections created through this factory.
    function collectionCount() external view returns (uint256) {
        return collections.length;
    }

    /// @notice Pause launching new collections. Factory owner only.
    /// Pausing the factory does NOT pause minting on existing collections.
    function pause() external onlyOwner {
        _pause();
    }

    /// @notice Resume launching new collections. Factory owner only.
    function unpause() external onlyOwner {
        _unpause();
    }
}
