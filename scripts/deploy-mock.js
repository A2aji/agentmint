const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Deploy the test-only MockAgentID contract and give mock Agent IDs to the
 * deployer + tester2 wallets.
 *
 * Usage (testnet):
 *   npx hardhat run scripts/deploy-mock.js --network bscTestnet
 *
 * Keys come from .env (DEPLOYER_PRIVATE_KEY, TESTER2_PRIVATE_KEY).
 * The mock is NEVER deployed to mainnet: this script refuses chain 56.
 * The mock address is written to deployments/<chainId>-mock.json so that
 * scripts/deploy.js can be run with AGENT_ID_ADDRESS=<mock address>.
 */
async function main() {
  const network = await ethers.provider.getNetwork();
  const chainId = Number(network.chainId);
  if (chainId === 56) {
    throw new Error("MockAgentID must NEVER be deployed to mainnet (chain 56).");
  }
  const [deployer] = await ethers.getSigners();
  console.log(`Network chainId: ${chainId}`);
  console.log(`Deployer: ${deployer.address}`);

  const Mock = await ethers.getContractFactory("MockAgentID");
  const mock = await Mock.deploy();
  await mock.waitForDeployment();
  const deployReceipt = await mock.deploymentTransaction().wait();
  const mockAddress = await mock.getAddress();
  console.log(`MockAgentID deployed: ${mockAddress} (gas used: ${deployReceipt.gasUsed})`);

  const holders = [deployer.address];
  const tester2Key = process.env.TESTER2_PRIVATE_KEY;
  if (tester2Key) {
    const tester2 = new ethers.Wallet(tester2Key, ethers.provider);
    holders.push(tester2.address);
  }
  const mintTxs = [];
  for (const holder of holders) {
    const tx = await mock.mintTo(holder);
    const receipt = await tx.wait();
    mintTxs.push(tx.hash);
    console.log(`Mock Agent ID minted to ${holder} (tx: ${tx.hash}, gas used: ${receipt.gasUsed})`);
  }

  const out = {
    network: chainId,
    mockAgentId: mockAddress,
    deployTx: deployReceipt.hash,
    deployGasUsed: deployReceipt.gasUsed.toString(),
    holders,
    mintTxs,
  };
  const dir = path.join(__dirname, "..", "deployments");
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `${chainId}-mock.json`);
  fs.writeFileSync(file, JSON.stringify(out, null, 2) + "\n");
  console.log(`Mock record written: ${file}`);
  console.log(JSON.stringify(out, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
