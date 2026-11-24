// AgentMint — contract addresses per network.
//
// TESTNET addresses are filled in from deployments/97.json and
// deployments/97-mock.json AFTER the testnet deploy (currently blocked:
// the deployer wallet has 0 tBNB and every tBNB faucet needs an interactive
// captcha or an account login — see ../TESTNET.md).
// MAINNET addresses stay placeholders until the mainnet deploy, which
// happens only with an explicit go-ahead.
//
// The testnet Agent ID address is the MockAgentID contract (test-only
// stand-in, because the official Agent ID contract does not exist on
// BSC testnet). On mainnet it is the official Agent ID contract
// 0x60b9262456de011f7d15a54cdd8c48baaa8b022f.
const AGENTMINT_CONFIG = {
  testnet: {
    chainId: 97,
    chainName: "BNB Smart Chain Testnet",
    rpcUrl: "https://data-seed-prebsc-2-s1.binance.org:8545/",
    blockExplorer: "https://testnet.bscscan.com",
    agentId: "", // FILL ME: deployments/97-mock.json -> mockAgentId
    token: "", // FILL ME: deployments/97.json -> token
    nftImplementation: "", // FILL ME: deployments/97.json -> nftImplementation
    factory: "", // FILL ME: deployments/97.json -> factory
  },
  mainnet: {
    chainId: 56,
    chainName: "BNB Smart Chain",
    rpcUrl: "https://bsc-dataseed.binance.org/",
    blockExplorer: "https://bscscan.com",
    agentId: "0x60b9262456de011f7d15a54cdd8c48baaa8b022f",
    token: "0x608112c648C48Df948cebEFcfE39871fC9DB6085", // mainnet deploy 24 Nov 2026
    nftImplementation: "0x1a3b457Af5fF36283d2444C47F65622c123AC979", // mainnet deploy 24 Nov 2026
    factory: "0xFF6A1F2070f395Be9cA150Be4eBbd44d6b92267C", // mainnet deploy 24 Nov 2026
  },
};
