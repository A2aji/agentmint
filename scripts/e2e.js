const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * End-to-end checks against a live AgentMint deployment (testnet or local).
 *
 * Reads deployments/<chainId>.json (token / factory) and
 * deployments/<chainId>-mock.json (mock Agent ID) written by
 * scripts/deploy-mock.js and scripts/deploy.js.
 *
 * Checks:
 *   (a) deployer (mock-ID holder) createCollection via the factory — must
 *       succeed, CollectionCreated event recorded.
 *   (b) tester2 (mock-ID holder) free mint — must succeed; NFT balance 1
 *       and AMT balance exactly payoutPerMint.
 *   (c) tester3 (NO mock ID) mint — must revert.
 *   (d) tester2 second mint — must revert (max 1 per address).
 *
 * Keys come from .env (DEPLOYER_PRIVATE_KEY, TESTER2_PRIVATE_KEY,
 * TESTER3_PRIVATE_KEY). Writes a JSON report to
 * deployments/<chainId>-e2e.json. Exit code 1 if any check fails.
 */
async function main() {
  const network = await ethers.provider.getNetwork();
  const chainId = Number(network.chainId);
  const dir = path.join(__dirname, "..", "deployments");
  const deployment = JSON.parse(fs.readFileSync(path.join(dir, `${chainId}.json`), "utf8"));
  const mockRec = JSON.parse(fs.readFileSync(path.join(dir, `${chainId}-mock.json`), "utf8"));
  const factoryAddress = deployment.factory;
  const tokenAddress = deployment.token;
  const mockAddress = mockRec.mockAgentId;

  const deployerKey = process.env.DEPLOYER_PRIVATE_KEY;
  const tester2Key = process.env.TESTER2_PRIVATE_KEY;
  const tester3Key = process.env.TESTER3_PRIVATE_KEY;
  if (!deployerKey || !tester2Key || !tester3Key) {
    throw new Error("Missing DEPLOYER_PRIVATE_KEY / TESTER2_PRIVATE_KEY / TESTER3_PRIVATE_KEY in env.");
  }
  const deployer = new ethers.Wallet(deployerKey, ethers.provider);
  const tester2 = new ethers.Wallet(tester2Key, ethers.provider);
  const tester3 = new ethers.Wallet(tester3Key, ethers.provider);

  const factory = await ethers.getContractAt("AgentMintFactory", factoryAddress);
  const token = await ethers.getContractAt("AgentMintToken", tokenAddress);
  const mock = await ethers.getContractAt("MockAgentID", mockAddress);

  const results = {};
  const fail = (name, reason) => {
    results[name] = { pass: false, reason };
    console.log(`FAIL ${name}: ${reason}`);
  };
  const ok = (name, detail) => {
    results[name] = { pass: true, ...detail };
    console.log(`PASS ${name}: ${JSON.stringify(detail)}`);
  };

  console.log(`Network chainId: ${chainId}`);
  console.log(`Deployer: ${deployer.address}  Tester2: ${tester2.address}  Tester3: ${tester3.address}`);
  console.log(`Factory: ${factoryAddress}  Token: ${tokenAddress}  MockAgentID: ${mockAddress}`);
  console.log(
    `Mock-ID balances — deployer: ${await mock.balanceOf(deployer.address)}, ` +
      `tester2: ${await mock.balanceOf(tester2.address)}, ` +
      `tester3: ${await mock.balanceOf(tester3.address)}`
  );

  // (a) deployer creates a collection.
  let collection;
  try {
    const payout = ethers.parseUnits("1000", 18);
    const tx = await factory
      .connect(deployer)
      .createCollection("AgentMint Test Collection", "AMT-TEST", 100, "", payout);
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
    if (!parsed) throw new Error("CollectionCreated event not found in receipt");
    collection = parsed.args.collection;
    ok("a_createCollection", {
      collection,
      txHash: tx.hash,
      gasUsed: receipt.gasUsed.toString(),
      collectionCount: (await factory.collectionCount()).toString(),
    });
  } catch (e) {
    fail("a_createCollection", e.shortMessage || e.message);
  }
  if (!collection) {
    return finish(results, dir, chainId, false);
  }

  const nft = await ethers.getContractAt("AgentMintNFT", collection);
  const payoutPerMint = await nft.payoutPerMint();

  // (b) tester2 free mint.
  try {
    const tx = await nft.connect(tester2).mint();
    const receipt = await tx.wait();
    const nftBal = await nft.balanceOf(tester2.address);
    const amtBal = await token.balanceOf(tester2.address);
    const mintedEvent = receipt.logs
      .map((l) => {
        try {
          return nft.interface.parseLog(l);
        } catch {
          return null;
        }
      })
      .find((p) => p && p.name === "Minted");
    if (nftBal !== 1n) throw new Error(`NFT balance ${nftBal}, expected 1`);
    if (amtBal !== payoutPerMint) {
      throw new Error(`AMT balance ${ethers.formatUnits(amtBal, 18)}, expected ${ethers.formatUnits(payoutPerMint, 18)}`);
    }
    ok("b_freeMint_holder", {
      txHash: tx.hash,
      gasUsed: receipt.gasUsed.toString(),
      tokenId: mintedEvent ? mintedEvent.args.tokenId.toString() : null,
      nftBalance: nftBal.toString(),
      amtBalance: ethers.formatUnits(amtBal, 18),
      totalMinted: (await nft.totalMinted()).toString(),
    });
  } catch (e) {
    fail("b_freeMint_holder", e.shortMessage || e.message);
  }

  // (c) tester3 (no mock ID) mint must revert.
  try {
    const tx = await nft.connect(tester3).mint();
    await tx.wait();
    fail("c_mint_noAgentId_reverts", `mint SUCCEEDED unexpectedly (tx ${tx.hash})`);
  } catch (e) {
    const msg = e.shortMessage || e.message || "";
    if (/caller holds no Agent ID/.test(msg)) {
      ok("c_mint_noAgentId_reverts", { revertReason: "AgentMintNFT: caller holds no Agent ID" });
    } else {
      fail("c_mint_noAgentId_reverts", `reverted but with unexpected reason: ${msg.slice(0, 200)}`);
    }
  }

  // (d) tester2 second mint must revert.
  try {
    const tx = await nft.connect(tester2).mint();
    await tx.wait();
    fail("d_secondMint_reverts", `second mint SUCCEEDED unexpectedly (tx ${tx.hash})`);
  } catch (e) {
    const msg = e.shortMessage || e.message || "";
    if (/already minted/.test(msg)) {
      ok("d_secondMint_reverts", { revertReason: "AgentMintNFT: already minted" });
    } else {
      fail("d_secondMint_reverts", `reverted but with unexpected reason: ${msg.slice(0, 200)}`);
    }
  }

  const allPass = Object.values(results).every((r) => r.pass);
  return finish(results, dir, chainId, allPass);
}

function finish(results, dir, chainId, allPass) {
  const report = { network: chainId, allPass, results };
  const file = path.join(dir, `${chainId}-e2e.json`);
  fs.writeFileSync(file, JSON.stringify(report, null, 2) + "\n");
  console.log(`E2E report written: ${file}`);
  console.log(`E2E ${allPass ? "ALL PASS" : "FAILURES PRESENT"}`);
  if (!allPass) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
