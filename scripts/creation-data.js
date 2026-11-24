const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Print/write full contract-CREATION calldata for a contract, so a deploy
 * can be previewed (or, where supported, executed) through an external
 * signer such as the Binance Agentic Wallet CLI (`baw contract-call
 * preview`), which has no deploy command of its own.
 *
 * Usage:
 *   npx hardhat run scripts/creation-data.js --network hardhat
 *   CONTRACT=AgentMintFactory AGENT_ID_ADDRESS=0x... TOKEN_ADDRESS=0x... \
 *     IMPL_ADDRESS=0x... npx hardhat run scripts/creation-data.js
 *
 * Env:
 *   CONTRACT            contract name (default AgentMintToken)
 *   AGENT_ID_ADDRESS    constructor arg for the factory (default: official)
 *   TOKEN_ADDRESS       constructor arg for the factory
 *   IMPL_ADDRESS        constructor arg for the factory
 *
 * Output: full 0x creation data written to /tmp/agentmint-creation/<name>.txt
 * (kept out of the repo; it is long). Length + keccak256 are printed here.
 * Nothing is broadcast by this script.
 */
async function main() {
  const name = process.env.CONTRACT || "AgentMintToken";
  const factory = await ethers.getContractFactory(name);
  let deployTx;
  if (name === "AgentMintFactory") {
    const agentId =
      process.env.AGENT_ID_ADDRESS || "0x60b9262456de011f7d15a54cdd8c48baaa8b022f";
    const token = process.env.TOKEN_ADDRESS || ethers.ZeroAddress;
    const impl = process.env.IMPL_ADDRESS || ethers.ZeroAddress;
    deployTx = await factory.getDeployTransaction(impl, token, agentId);
  } else {
    deployTx = await factory.getDeployTransaction();
  }
  const data = deployTx.data;
  const dir = "/tmp/agentmint-creation";
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `${name}.txt`);
  fs.writeFileSync(file, data);
  console.log(`Contract: ${name}`);
  console.log(`Creation data file: ${file}`);
  console.log(`Bytes: ${(data.length - 2) / 2}`);
  console.log(`keccak256: ${ethers.keccak256(data)}`);
  console.log(`First 100 chars: ${data.slice(0, 100)}...`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
