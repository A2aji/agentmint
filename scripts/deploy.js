const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Deploy AgentMint: token + NFT implementation + factory.
 *
 * Usage:
 *   npx hardhat run scripts/deploy.js --network localhost
 *   npx hardhat run scripts/deploy.js --network bscTestnet
 *   npx hardhat run scripts/deploy.js --network bsc        (mainnet — see guard below)
 *
 * Signer: the first account Hardhat is configured with. On live networks
 * that means DEPLOYER_PRIVATE_KEY from the environment (see .env.example).
 * The key is NEVER read from a file in this repo and NEVER printed.
 *
 * Mainnet guard: deploying to chain 56 refuses unless the environment
 * variable CONFIRM_MAINNET_DEPLOY=yes is set. Mainnet deploy happens only
 * with an explicit go-ahead, never by accident.
 *
 * Parameters (env, all optional):
 *   AGENT_ID_ADDRESS  official Agent ID contract (default: the verified
 *                     mainnet address 0x60b9262456de011f7d15a54cdd8c48baaa8b022f)
 *   CREATE_GENESIS    "true" to also launch the first collection from the
 *                     deployer (deployer must hold an Agent ID)
 *   GENESIS_NAME / GENESIS_SYMBOL / GENESIS_MAX_SUPPLY / GENESIS_BASE_URI /
 *   GENESIS_PAYOUT_PER_MINT (whole AMT, default 1000)
 */
async function main() {
  const network = await ethers.provider.getNetwork();
  const chainId = Number(network.chainId);
  const [deployer] = await ethers.getSigners();
  console.log(`Network chainId: ${chainId}`);
  console.log(`Deployer: ${deployer.address}`);

  if (chainId === 56 && process.env.CONFIRM_MAINNET_DEPLOY !== "yes") {
    throw new Error(
      "Mainnet deploy refused: set CONFIRM_MAINNET_DEPLOY=yes only with an explicit go-ahead."
    );
  }

  const agentId = process.env.AGENT_ID_ADDRESS || "0x60b9262456de011f7d15a54cdd8c48baaa8b022f";
  console.log(`Agent ID contract: ${agentId}`);

  const Token = await ethers.getContractFactory("AgentMintToken");
  const token = await Token.deploy();
  await token.waitForDeployment();
  const tokenReceipt = await token.deploymentTransaction().wait();
  const tokenAddress = await token.getAddress();
  console.log(`AgentMintToken deployed: ${tokenAddress} (gas used: ${tokenReceipt.gasUsed})`);

  const NFT = await ethers.getContractFactory("AgentMintNFT");
  const implementation = await NFT.deploy();
  await implementation.waitForDeployment();
  const implReceipt = await implementation.deploymentTransaction().wait();
  const implAddress = await implementation.getAddress();
  console.log(`AgentMintNFT implementation deployed: ${implAddress} (gas used: ${implReceipt.gasUsed})`);

  const Factory = await ethers.getContractFactory("AgentMintFactory");
  const factory = await Factory.deploy(implAddress, tokenAddress, agentId);
  await factory.waitForDeployment();
  const factoryReceipt = await factory.deploymentTransaction().wait();
  const factoryAddress = await factory.getAddress();
  console.log(`AgentMintFactory deployed: ${factoryAddress} (gas used: ${factoryReceipt.gasUsed})`);

  // Setup: token admin grants the factory REGISTRAR_ROLE so createCollection
  // can register each new collection as a minter. Without this step, the
  // first createCollection call reverts.
  const registrarRole = await token.REGISTRAR_ROLE();
  const grantTx = await token.grantRole(registrarRole, factoryAddress);
  await grantTx.wait();
  console.log(`Granted REGISTRAR_ROLE to factory (tx: ${grantTx.hash})`);

  let genesis = null;
  if (process.env.CREATE_GENESIS === "true") {
    const payout = ethers.parseUnits(process.env.GENESIS_PAYOUT_PER_MINT || "1000", 18);
    const tx = await factory.createCollection(
      process.env.GENESIS_NAME || "AgentMint Genesis",
      process.env.GENESIS_SYMBOL || "AMG",
      Number(process.env.GENESIS_MAX_SUPPLY || 10_000),
      process.env.GENESIS_BASE_URI || "",
      payout
    );
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
    genesis = parsed.args.collection;
    console.log(`Genesis collection created: ${genesis} (gas used: ${receipt.gasUsed})`);
  }

  const out = {
    network: chainId,
    deployer: deployer.address,
    agentId,
    token: tokenAddress,
    nftImplementation: implAddress,
    factory: factoryAddress,
    genesisCollection: genesis,
    gasUsed: {
      token: tokenReceipt.gasUsed.toString(),
      nftImplementation: implReceipt.gasUsed.toString(),
      factory: factoryReceipt.gasUsed.toString(),
    },
  };
  const dir = path.join(__dirname, "..", "deployments");
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `${chainId}.json`);
  fs.writeFileSync(file, JSON.stringify(out, null, 2) + "\n");
  console.log(`Deployment record written: ${file}`);
  console.log(JSON.stringify(out, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
