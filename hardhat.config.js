require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/**
 * AgentMint — Hardhat config.
 *
 * Networks:
 * - hardhat (local, default)
 * - bscTestnet (chain 97)
 * - bsc (chain 56, mainnet — deploy ONLY with explicit go-ahead, see scripts/deploy.js)
 *
 * The deployer key is NEVER stored in this repo. It comes from the
 * DEPLOYER_PRIVATE_KEY environment variable only. See .env.example.
 */
const DEPLOYER_KEY = process.env.DEPLOYER_PRIVATE_KEY;
const deployerAccounts = DEPLOYER_KEY ? [DEPLOYER_KEY] : [];

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: { enabled: true, runs: 200 },
      // Cancun: OpenZeppelin 5.6 uses the `mcopy` builtin, which solc only
      // enables with the Cancun EVM target.
      evmVersion: "cancun",
    },
  },
  networks: {
    hardhat: {},
    bscTestnet: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545/",
      chainId: 97,
      accounts: deployerAccounts,
    },
    bsc: {
      url: "https://bsc-dataseed.binance.org/",
      chainId: 56,
      accounts: deployerAccounts,
    },
  },
  gasReporter: {
    enabled: true,
    currency: "USD",
    // No price API key configured; gas is reported in native units + USD at 0
    // unless COINMARKETCAP_API_KEY is set. The gas-unit numbers are what matter.
  },
};
