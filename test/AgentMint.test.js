const { expect } = require("chai");
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

const PAYOUT = 1000n * 10n ** 18n; // 1,000 AMT per mint
const MAX_SUPPLY_TOKEN = 1_000_000_000n * 10n ** 18n;

// Official Agent ID contract address (mainnet, BSC) — used here only as a
// documented constant; tests run against a local mock at a different address.
const OFFICIAL_AGENT_ID = "0x60b9262456de011f7d15a54cdd8c48baaa8b022f";

describe("AgentMint", function () {
  let owner, launcher, holderA, holderB, holderC, stranger;
  let token, mockId, implementation, factory;

  async function deployAll() {
    [owner, launcher, holderA, holderB, holderC, stranger] = await ethers.getSigners();

    const MockAgentID = await ethers.getContractFactory("MockAgentID");
    mockId = await MockAgentID.deploy();

    const Token = await ethers.getContractFactory("AgentMintToken");
    token = await Token.deploy();

    const NFT = await ethers.getContractFactory("AgentMintNFT");
    implementation = await NFT.deploy();

    const Factory = await ethers.getContractFactory("AgentMintFactory");
    factory = await Factory.deploy(
      await implementation.getAddress(),
      await token.getAddress(),
      await mockId.getAddress()
    );

    // Setup step (documented in PERMISSIONS.md): token admin grants the
    // factory REGISTRAR_ROLE so it can register each new collection.
    const REGISTRAR_ROLE = await token.REGISTRAR_ROLE();
    await token.grantRole(REGISTRAR_ROLE, await factory.getAddress());

    // Give the launcher + holders an Agent ID each.
    await mockId.mintTo(launcher.address);
    await mockId.mintTo(holderA.address);
    await mockId.mintTo(holderB.address);
    await mockId.mintTo(holderC.address);
  }

  async function createCollection(signer, opts = {}) {
    const tx = await factory.connect(signer).createCollection(
      opts.name || "Test Collection",
      opts.symbol || "TEST",
      opts.maxSupply || 10_000,
      opts.baseURI || "https://example.invalid/meta/",
      opts.payout || PAYOUT
    );
    const receipt = await tx.wait();
    const log = receipt.logs.find((l) => {
      try {
        return factory.interface.parseLog(l).name === "CollectionCreated";
      } catch {
        return false;
      }
    });
    const parsed = factory.interface.parseLog(log);
    const NFT = await ethers.getContractFactory("AgentMintNFT");
    return NFT.attach(parsed.args.collection);
  }

  beforeEach(deployAll);

  // ---------------------------------------------------------------- token
  describe("AgentMintToken", function () {
    it("has the right name, symbol, decimals and zero initial supply", async function () {
      expect(await token.name()).to.equal("AgentMint Reward Token");
      expect(await token.symbol()).to.equal("AMT");
      expect(await token.decimals()).to.equal(18);
      expect(await token.totalSupply()).to.equal(0);
    });

    it("caps total supply at 1,000,000,000 AMT", async function () {
      expect(await token.cap()).to.equal(MAX_SUPPLY_TOKEN);
      expect(await token.MAX_SUPPLY()).to.equal(MAX_SUPPLY_TOKEN);
    });

    it("rejects minting by anyone without MINTER_ROLE", async function () {
      await expect(token.connect(stranger).mint(holderA.address, 1n)).to.be.revertedWithCustomError(
        token,
        "AccessControlUnauthorizedAccount"
      );
      // Even the deployer/owner cannot mint directly without the role.
      await expect(token.connect(owner).mint(holderA.address, 1n)).to.be.revertedWithCustomError(
        token,
        "AccessControlUnauthorizedAccount"
      );
    });

    it("lets a MINTER_ROLE holder mint, and enforces the cap", async function () {
      const MINTER_ROLE = await token.MINTER_ROLE();
      await token.grantRole(MINTER_ROLE, owner.address);
      // Mint exactly up to the cap.
      await token.mint(holderA.address, MAX_SUPPLY_TOKEN);
      expect(await token.balanceOf(holderA.address)).to.equal(MAX_SUPPLY_TOKEN);
      expect(await token.totalSupply()).to.equal(MAX_SUPPLY_TOKEN);
      // One unit more must revert.
      await expect(token.mint(holderA.address, 1n)).to.be.revertedWithCustomError(
        token,
        "ERC20ExceededCap"
      );
    });

    it("rejects registerMinter from anyone without REGISTRAR_ROLE", async function () {
      await expect(
        token.connect(stranger).registerMinter(holderA.address)
      ).to.be.revertedWithCustomError(token, "AccessControlUnauthorizedAccount");
    });

    it("lets the factory (REGISTRAR_ROLE) register a minter", async function () {
      // createCollection already exercises this; verify the role landed.
      const nft = await createCollection(launcher);
      const MINTER_ROLE = await token.MINTER_ROLE();
      expect(await token.hasRole(MINTER_ROLE, await nft.getAddress())).to.equal(true);
    });
  });

  // ------------------------------------------------------- factory + gate
  describe("AgentMintFactory", function () {
    it("lets an Agent ID holder launch a collection and records it", async function () {
      const nft = await createCollection(launcher, { name: "Alpha", symbol: "ALP" });
      const addr = await nft.getAddress();
      expect(await factory.isCollection(addr)).to.equal(true);
      expect(await factory.collectionCount()).to.equal(1);
      expect(await factory.collections(0)).to.equal(addr);
      expect(await nft.name()).to.equal("Alpha");
      expect(await nft.symbol()).to.equal("ALP");
      expect(await nft.owner()).to.equal(launcher.address);
      expect(await nft.maxSupply()).to.equal(10_000);
      expect(await nft.payoutPerMint()).to.equal(PAYOUT);
    });

    it("emits CollectionCreated with launcher, address and params", async function () {
      const tx = await factory
        .connect(launcher)
        .createCollection("Beta", "BET", 500, "https://example.invalid/", 42n);
      const receipt = await tx.wait();
      const parsed = receipt.logs
        .map((l) => {
          try {
            return factory.interface.parseLog(l);
          } catch {
            return null;
          }
        })
        .find((p) => p && p.name === "CollectionCreated");
      expect(parsed).to.not.equal(undefined);
      expect(parsed.args.launcher).to.equal(launcher.address);
      expect(parsed.args.name).to.equal("Beta");
      expect(parsed.args.symbol).to.equal("BET");
      expect(parsed.args.maxSupply).to.equal(500);
      expect(parsed.args.payoutPerMint).to.equal(42n);
      expect(await factory.isCollection(parsed.args.collection)).to.equal(true);
    });

    it("rejects launching by an address without an Agent ID", async function () {
      await expect(
        factory.connect(stranger).createCollection("Nope", "NOP", 100, "", PAYOUT)
      ).to.be.revertedWith("AgentMintFactory: caller holds no Agent ID");
      expect(await factory.collectionCount()).to.equal(0);
    });

    it("rejects a second initialize() call on a collection clone", async function () {
      const nft = await createCollection(launcher);
      await expect(
        nft.initialize("Again", "AGN", 1, "", 1n, await token.getAddress(), await mockId.getAddress(), launcher.address)
      ).to.be.revertedWithCustomError(nft, "InvalidInitialization");
    });

    it("rejects initialize() on the bare implementation contract", async function () {
      await expect(
        implementation.initialize("X", "X", 1, "", 1n, await token.getAddress(), await mockId.getAddress(), launcher.address)
      ).to.be.revertedWithCustomError(implementation, "InvalidInitialization");
    });

    it("pause blocks launching; only the factory owner can pause/unpause", async function () {
      await expect(factory.connect(stranger).pause()).to.be.revertedWithCustomError(
        factory,
        "OwnableUnauthorizedAccount"
      );
      await factory.pause();
      await expect(
        factory.connect(launcher).createCollection("Paused", "PAU", 100, "", PAYOUT)
      ).to.be.revertedWithCustomError(factory, "EnforcedPause");
      await expect(factory.connect(stranger).unpause()).to.be.revertedWithCustomError(
        factory,
        "OwnableUnauthorizedAccount"
      );
      await factory.unpause();
      const nft = await createCollection(launcher);
      expect(await factory.collectionCount()).to.equal(1);
      expect(await nft.name()).to.equal("Test Collection");
    });
  });

  // ------------------------------------------------------------- NFT mint
  describe("AgentMintNFT mint", function () {
    let nft;

    beforeEach(async function () {
      nft = await createCollection(launcher);
    });

    it("rejects minting by an address without an Agent ID", async function () {
      await expect(nft.connect(stranger).mint()).to.be.revertedWith(
        "AgentMintNFT: caller holds no Agent ID"
      );
    });

    it("mints the NFT and pays the exact AMT payout in the same tx", async function () {
      await expect(nft.connect(holderA).mint())
        .to.emit(nft, "Minted")
        .withArgs(holderA.address, 1, PAYOUT);
      expect(await nft.ownerOf(1)).to.equal(holderA.address);
      expect(await nft.balanceOf(holderA.address)).to.equal(1);
      expect(await token.balanceOf(holderA.address)).to.equal(PAYOUT);
      expect(await token.totalSupply()).to.equal(PAYOUT);
      expect(await nft.hasMinted(holderA.address)).to.equal(true);
      expect(await nft.totalMinted()).to.equal(1);
    });

    it("mints for free: no native value is required or accepted", async function () {
      // mint() is not payable; sending value must revert.
      await expect(nft.connect(holderA).mint({ value: 1n })).to.be.reverted;
      // Plain mint with value 0 works.
      await nft.connect(holderA).mint();
      expect(await nft.ownerOf(1)).to.equal(holderA.address);
    });

    it("enforces max 1 NFT per address per collection", async function () {
      await nft.connect(holderA).mint();
      await expect(nft.connect(holderA).mint()).to.be.revertedWith("AgentMintNFT: already minted");
      // The same address CAN mint from a different collection.
      const nft2 = await createCollection(holderB, { name: "Second", symbol: "SEC" });
      await nft2.connect(holderA).mint();
      expect(await nft2.balanceOf(holderA.address)).to.equal(1);
    });

    it("enforces the collection max supply", async function () {
      const small = await createCollection(launcher, { maxSupply: 2 });
      await small.connect(holderA).mint();
      await small.connect(holderB).mint();
      await expect(small.connect(holderC).mint()).to.be.revertedWith(
        "AgentMintNFT: max supply reached"
      );
      expect(await small.totalMinted()).to.equal(2);
    });

    it("returns tokenURI as baseURI + token id", async function () {
      await nft.connect(holderA).mint();
      expect(await nft.tokenURI(1)).to.equal("https://example.invalid/meta/1");
    });

    it("pause blocks minting; only the collection owner can pause/unpause", async function () {
      await expect(nft.connect(holderA).pause()).to.be.revertedWithCustomError(
        nft,
        "OwnableUnauthorizedAccount"
      );
      await nft.connect(launcher).pause();
      await expect(nft.connect(holderA).mint()).to.be.revertedWithCustomError(nft, "EnforcedPause");
      await expect(nft.connect(holderA).unpause()).to.be.revertedWithCustomError(
        nft,
        "OwnableUnauthorizedAccount"
      );
      await nft.connect(launcher).unpause();
      await nft.connect(holderA).mint();
      expect(await nft.ownerOf(1)).to.equal(holderA.address);
    });

    it("only the collection owner can change baseURI", async function () {
      await expect(nft.connect(holderA).setBaseURI("https://evil.invalid/")).to.be.revertedWithCustomError(
        nft,
        "OwnableUnauthorizedAccount"
      );
      await nft.connect(launcher).setBaseURI("https://new.invalid/");
      await nft.connect(holderA).mint();
      expect(await nft.tokenURI(1)).to.equal("https://new.invalid/1");
    });

    it("a failed reward payout reverts the whole mint (no free NFT)", async function () {
      // Revoke the collection's minter role, then mint must revert and no
      // NFT may exist afterwards.
      const MINTER_ROLE = await token.MINTER_ROLE();
      await token.revokeRole(MINTER_ROLE, await nft.getAddress());
      await expect(nft.connect(holderA).mint()).to.be.reverted;
      await expect(nft.ownerOf(1)).to.be.revertedWithCustomError(nft, "ERC721NonexistentToken");
      expect(await nft.hasMinted(holderA.address)).to.equal(false);
    });
  });

  // ---------------------------------------------------------- reentrancy
  describe("Reentrancy", function () {
    it("a hostile token cannot re-enter mint() to double-claim", async function () {
      // Wire a second factory to the hostile token, launch a collection
      // through it, then mint as a real holder. The hostile token's mint()
      // tries to call nft.mint() again mid-mint. The hostile token is
      // deliberately given an Agent ID too, so the gate alone cannot stop
      // the nested call — only the reentrancy guard can.
      const Malicious = await ethers.getContractFactory("MaliciousToken");
      const malicious = await Malicious.deploy(ethers.ZeroAddress);
      const Factory = await ethers.getContractFactory("AgentMintFactory");
      const badFactory = await Factory.deploy(
        await implementation.getAddress(),
        await malicious.getAddress(),
        await mockId.getAddress()
      );
      const tx = await badFactory
        .connect(launcher)
        .createCollection("Trap", "TRAP", 100, "", PAYOUT);
      const receipt = await tx.wait();
      const parsed = receipt.logs
        .map((l) => {
          try {
            return badFactory.interface.parseLog(l);
          } catch {
            return null;
          }
        })
        .find((p) => p && p.name === "CollectionCreated");
      const NFT = await ethers.getContractFactory("AgentMintNFT");
      const trap = NFT.attach(parsed.args.collection);
      await malicious.setNft(await trap.getAddress());
      await mockId.mintTo(await malicious.getAddress());

      // The real mint: NFT goes to holderA, hostile token re-enters mid-mint.
      await trap.connect(holderA).mint();
      expect(await malicious.attacked()).to.equal(true);
      // Holder got exactly one NFT; the nested mint produced nothing for
      // the hostile contract (guard reverted the nested call).
      expect(await trap.balanceOf(holderA.address)).to.equal(1);
      expect(await trap.balanceOf(await malicious.getAddress())).to.equal(0);
      expect(await trap.hasMinted(await malicious.getAddress())).to.equal(false);
      // And the holder cannot mint a second time either.
      await expect(trap.connect(holderA).mint()).to.be.revertedWith(
        "AgentMintNFT: already minted"
      );
    });
  });

  // ------------------------------------------------- no unlimited approvals
  describe("No unlimited approvals", function () {
    it("no contract in this repo calls approve() or uses an unlimited allowance", async function () {
      const contractsDir = path.join(__dirname, "..", "contracts");
      const files = ["AgentMintToken.sol", "AgentMintNFT.sol", "AgentMintFactory.sol"];
      for (const file of files) {
        const src = fs.readFileSync(path.join(contractsDir, file), "utf8");
        expect(src, `${file} must not call approve`).to.not.include("approve(");
        expect(src, `${file} must not use type(uint256).max`).to.not.include("type(uint256).max");
      }
      // Minting requires no token approval from the minter at all: a plain
      // mint works for a holder who never approved anything.
      const nft = await createCollection(launcher);
      await nft.connect(holderA).mint();
      expect(await token.balanceOf(holderA.address)).to.equal(PAYOUT);
    });
  });

  // ------------------------------------------------------- address record
  describe("Agent ID address", function () {
    it("documents the official Agent ID contract address used in production", async function () {
      // The production constant lives in the README/PERMISSIONS docs and in
      // scripts/deploy.js; this test pins it so a typo is caught.
      expect(OFFICIAL_AGENT_ID).to.equal("0x60b9262456de011f7d15a54cdd8c48baaa8b022f");
      expect(ethers.isAddress(OFFICIAL_AGENT_ID)).to.equal(true);
    });
  });
});
