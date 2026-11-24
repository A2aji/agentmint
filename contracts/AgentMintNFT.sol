// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

/// @notice Minimal interface of the reward token: only the mint entry point
/// the NFT contract needs.
interface IAgentMintToken {
    function mint(address to, uint256 amount) external;
}

/// @title AgentMintNFT
/// @notice One free-mint NFT collection on the AgentMint launchpad.
/// @dev Deployed as an EIP-1167 minimal-proxy clone of the implementation
/// contract by AgentMintFactory (see README for why clones were chosen).
/// Because clones delegatecall, this contract is initializable instead of
/// using a constructor for its per-collection settings.
/// Gate: only addresses holding an Agent ID (balanceOf > 0 on the official
/// Agent ID contract) can mint. One NFT per address per collection.
/// Every successful mint also mints a fixed amount of AMT reward tokens to
/// the minter, in the same transaction. Minting costs the minter nothing
/// except gas (value is always 0).
/// (No OpenZeppelin ReentrancyGuard is inherited on purpose: the
/// upgradeable package no longer ships one, and this contract is deployed
/// as a clone, so its constructor never runs. The guard below uses plain
/// contract storage instead, which clones initialize normally.)
contract AgentMintNFT is Initializable, ERC721Upgradeable, OwnableUpgradeable, PausableUpgradeable {
    /// Official Agent ID contract (ERC-721, non-transferable).
    /// Address verified from the official Agent ID Hackathon announcement:
    /// 0x60b9262456de011f7d15a54cdd8c48baaa8b022f
    /// The address is a per-collection setting (not a hardcoded constant)
    /// so tests can use a mock and a future official address change does
    /// not require redeploying the implementation.
    IERC721 public agentId;

    IAgentMintToken public rewardToken;

    /// Maximum number of NFTs this collection can ever mint.
    uint256 public maxSupply;

    /// Fixed AMT reward minted to the minter on every successful mint.
    uint256 public payoutPerMint;

    string private baseTokenURI;

    /// Next token id to mint (starts at 1).
    uint256 private _nextTokenId;

    /// True once an address has minted from this collection (max 1 each).
    mapping(address => bool) public hasMinted;

    /// Reentrancy lock for mint(). Plain storage (not transient), so it
    /// works identically on clones and on chains without EIP-1153.
    bool private _mintGuard;

    event Minted(address indexed minter, uint256 indexed tokenId, uint256 payout);
    event BaseURIUpdated(string baseURI);

    /// @dev Blocks nested calls into mint() while a mint is in progress.
    modifier nonReentrantMint() {
        require(!_mintGuard, "AgentMintNFT: reentrant call");
        _mintGuard = true;
        _;
        _mintGuard = false;
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /// @notice Initialize a new collection clone. Callable exactly once.
    /// @param name_ Collection name. @param symbol_ Collection symbol.
    /// @param maxSupply_ Maximum NFTs this collection can mint.
    /// @param baseURI_ Metadata base URI (owner can change it later).
    /// @param payoutPerMint_ Fixed AMT reward per successful mint.
    /// @param rewardToken_ Address of the AgentMintToken contract.
    /// @param agentId_ Address of the Agent ID contract used for the gate.
    /// @param launcher_ Collection launcher; becomes the collection owner.
    function initialize(
        string memory name_,
        string memory symbol_,
        uint256 maxSupply_,
        string memory baseURI_,
        uint256 payoutPerMint_,
        address rewardToken_,
        address agentId_,
        address launcher_
    ) public initializer {
        require(maxSupply_ > 0, "AgentMintNFT: maxSupply is zero");
        require(rewardToken_ != address(0), "AgentMintNFT: token is zero address");
        require(agentId_ != address(0), "AgentMintNFT: agent id is zero address");
        require(launcher_ != address(0), "AgentMintNFT: launcher is zero address");
        __ERC721_init(name_, symbol_);
        __Ownable_init(launcher_);
        __Pausable_init();
        _mintGuard = false;
        maxSupply = maxSupply_;
        payoutPerMint = payoutPerMint_;
        baseTokenURI = baseURI_;
        rewardToken = IAgentMintToken(rewardToken_);
        agentId = IERC721(agentId_);
        _nextTokenId = 1;
    }

    /// @notice Free mint (value is always 0). Caller must hold an Agent ID,
    /// must not have minted from this collection before, and the collection
    /// must not be sold out or paused.
    /// @dev Checks-effects-interactions: hasMinted is set and the NFT is
    /// minted BEFORE the external reward-token call, and the whole function
    /// is guarded by nonReentrantMint, so the payout cannot be claimed twice.
    function mint() external nonReentrantMint whenNotPaused {
        require(agentId.balanceOf(msg.sender) > 0, "AgentMintNFT: caller holds no Agent ID");
        require(!hasMinted[msg.sender], "AgentMintNFT: already minted");
        uint256 tokenId = _nextTokenId;
        require(tokenId <= maxSupply, "AgentMintNFT: max supply reached");
        hasMinted[msg.sender] = true;
        _nextTokenId = tokenId + 1;
        _safeMint(msg.sender, tokenId);
        rewardToken.mint(msg.sender, payoutPerMint);
        emit Minted(msg.sender, tokenId, payoutPerMint);
    }

    /// @notice Number of NFTs minted so far in this collection.
    function totalMinted() external view returns (uint256) {
        return _nextTokenId - 1;
    }

    /// @notice Change the metadata base URI. Collection owner only.
    function setBaseURI(string memory baseURI_) external onlyOwner {
        baseTokenURI = baseURI_;
        emit BaseURIUpdated(baseURI_);
    }

    /// @notice Pause minting. Collection owner only.
    function pause() external onlyOwner {
        _pause();
    }

    /// @notice Resume minting. Collection owner only.
    function unpause() external onlyOwner {
        _unpause();
    }

    function _baseURI() internal view override returns (string memory) {
        return baseTokenURI;
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721Upgradeable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
