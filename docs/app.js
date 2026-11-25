// AgentMint mint page — static, no build step.
// Wallet: the browser's injected EIP-1193 provider (e.g. MetaMask).
// No QR code, no pairing code, no seed phrase is ever requested.
// Minting is value 0 (gas only) and needs no token approval.

const FACTORY_ABI = [
  "function createCollection(string name_, string symbol_, uint256 maxSupply_, string baseURI_, uint256 payoutPerMint_) returns (address collection)",
  "function collections(uint256) view returns (address)",
  "function collectionCount() view returns (uint256)",
  "function isCollection(address) view returns (bool)",
  "event CollectionCreated(address indexed launcher, address indexed collection, string name, string symbol, uint256 maxSupply, uint256 payoutPerMint)",
];
const NFT_ABI = [
  "function mint()",
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function maxSupply() view returns (uint256)",
  "function totalMinted() view returns (uint256)",
  "function payoutPerMint() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function hasMinted(address) view returns (bool)",
  "function paused() view returns (bool)",
  "function owner() view returns (address)",
  "event Minted(address indexed minter, uint256 indexed tokenId, uint256 payout)",
];
const TOKEN_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
];
const AGENT_ID_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function handleOf(address wallet) view returns (string)",
];

const $ = (id) => document.getElementById(id);
const logEl = $("log");
function log(msg) {
  logEl.textContent += "\n" + new Date().toLocaleTimeString() + "  " + msg;
}
function explorerTx(network, hash) {
  return `${AGENTMINT_CONFIG[network].blockExplorer}/tx/${hash}`;
}

let provider = null; // ethers BrowserProvider (wallet)
let signer = null;
let account = null;
let network = "mainnet";
let contracts = null; // { factory, token, agentId }
let hasAgentId = false;
let accountAgentIdName = null; // e.g. "jiazi22.ai" for the connected wallet

// Cache of wallet address (lowercase) -> ".ai" name or null, so each address
// is resolved once per page load.
const handleCache = new Map();
async function agentIdName(readProvider, address) {
  const key = address.toLowerCase();
  if (handleCache.has(key)) return handleCache.get(key);
  let name = null;
  try {
    const agentId = new ethers.Contract(cfg().agentId, AGENT_ID_ABI, readProvider);
    const handle = await agentId.handleOf(address);
    if (handle) name = handle + ".ai";
  } catch {}
  handleCache.set(key, name);
  return name;
}

function cfg() {
  return AGENTMINT_CONFIG[network];
}

function contractsReady() {
  const c = cfg();
  return Boolean(c.factory && c.token && c.agentId);
}

async function refreshNetworkUI() {
  const c = cfg();
  $("switchBtn").disabled = !provider;
  if (!contractsReady()) {
    $("agentIdStatus").textContent =
      `This network is not deployed yet — contract addresses are still empty in config.js (${network}).`;
    $("agentIdStatus").className = "status bad";
    $("collections").innerHTML = `<p class="muted">No contracts configured for ${network} yet. Fill in <code>config.js</code> from <code>deployments/${c.chainId}.json</code> after deploy.</p>`;
    $("collectionCount").textContent = "";
    $("launchBtn").disabled = true;
    return false;
  }
  // Clear any stale status left by a previous network (e.g. the testnet
  // "not deployed yet" message) — the current network is ready.
  $("agentIdStatus").textContent = "";
  $("agentIdStatus").className = "status";
  return true;
}

async function connect() {
  if (!window.ethereum) {
    $("walletStatus").textContent = "No browser wallet found. Install MetaMask (or another EIP-1193 wallet) and reload this page.";
    $("walletStatus").className = "status bad";
    return;
  }
  try {
    provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send("eth_requestAccounts", []);
    account = accounts[0];
    signer = await provider.getSigner();
    $("walletStatus").textContent = `Connected: ${account}`;
    $("walletStatus").className = "status ok";
    $("switchBtn").disabled = false;
    log(`Connected ${account}`);
    await afterConnect();
  } catch (e) {
    $("walletStatus").textContent = "Connection rejected: " + (e.shortMessage || e.message);
    $("walletStatus").className = "status bad";
  }
}

async function afterConnect() {
  if (!(await refreshNetworkUI())) return;
  const net = await provider.getNetwork();
  if (Number(net.chainId) !== cfg().chainId) {
    $("agentIdStatus").textContent = `Your wallet is on chain ${net.chainId}, but ${network} needs chain ${cfg().chainId}. Use "Switch network in wallet".`;
    $("agentIdStatus").className = "status bad";
    // Stop here: checkAgentId() would overwrite this warning, and minting
    // from the wrong chain would fail.
    return;
  }
  await checkAgentId();
  await refreshBalances();
  await refreshCollections();
}

async function checkAgentId() {
  const c = cfg();
  try {
    const readProvider = new ethers.JsonRpcProvider(c.rpcUrl);
    const agentId = new ethers.Contract(c.agentId, AGENT_ID_ABI, readProvider);
    const bal = await agentId.balanceOf(account);
    hasAgentId = bal > 0n;
    // Resolve the wallet's .ai name (read-only handleOf call). Empty means
    // the wallet holds no name; a failure leaves the name blank.
    accountAgentIdName = null;
    if (hasAgentId) {
      try {
        const handle = await agentId.handleOf(account);
        if (handle) accountAgentIdName = handle + ".ai";
      } catch {}
    }
    $("agentIdStatus").textContent = hasAgentId
      ? `Agent ID: yes — ${accountAgentIdName || "this wallet"} holds an Agent ID (balance ${bal}). You can launch collections and mint.`
      : `Agent ID: no — this wallet holds no Agent ID (balance 0). Launching and minting are only open to Agent ID holders.`;
    $("agentIdStatus").className = "status " + (hasAgentId ? "ok" : "bad");
    $("launchBtn").disabled = !hasAgentId;
    log(`Agent ID balance for ${account}: ${bal}`);
  } catch (e) {
    $("agentIdStatus").textContent = "Could not check Agent ID: " + (e.shortMessage || e.message);
    $("agentIdStatus").className = "status bad";
  }
}

async function refreshBalances() {
  const c = cfg();
  try {
    const readProvider = new ethers.JsonRpcProvider(c.rpcUrl);
    const token = new ethers.Contract(c.token, TOKEN_ABI, readProvider);
    const bal = await token.balanceOf(account);
    $("amtBalance").textContent = `${ethers.formatUnits(bal, 18)} AMT`;
  } catch (e) {
    $("amtBalance").textContent = "—";
    log("AMT balance check failed: " + (e.shortMessage || e.message));
  }
}

async function refreshCollections() {
  const c = cfg();
  const box = $("collections");
  try {
    const readProvider = new ethers.JsonRpcProvider(c.rpcUrl);
    const factory = new ethers.Contract(c.factory, FACTORY_ABI, readProvider);
    const count = await factory.collectionCount();
    $("collectionCount").textContent = `${count} collection(s) launched through this factory.`;
    if (count === 0n) {
      box.innerHTML = `<p class="muted">No collections yet. Launch the first one below (Agent ID holders only).</p>`;
      return;
    }
    box.innerHTML = "";
    for (let i = 0; i < Number(count); i++) {
      const addr = await factory.collections(i);
      const nft = new ethers.Contract(addr, NFT_ABI, readProvider);
      const [name, symbol, maxSupply, totalMinted, payout, nftBal, minted, paused] = await Promise.all([
        nft.name(), nft.symbol(), nft.maxSupply(), nft.totalMinted(),
        nft.payoutPerMint(), nft.balanceOf(account), nft.hasMinted(account), nft.paused(),
      ]);
      // Resolve the launcher's .ai name (collection owner). Kept separate
      // from the main reads so a failure here cannot break the card.
      let launcherLabel = "";
      try {
        const ownerAddr = await nft.owner();
        const launcherName = await agentIdName(readProvider, ownerAddr);
        launcherLabel = `Launched by ${launcherName || ownerAddr}`;
      } catch {}
      const div = document.createElement("div");
      div.className = "collection";
      const soldOut = totalMinted >= maxSupply;
      const canMint = hasAgentId && !minted && !soldOut && !paused;
      div.innerHTML = `
        <strong>${escapeHtml(name)} (${escapeHtml(symbol)})</strong>
        <span class="muted"> — <code>${addr}</code></span><br>
        Minted: ${totalMinted} / ${maxSupply} &nbsp;·&nbsp;
        Community reward per mint: ${ethers.formatUnits(payout, 18)} AMT &nbsp;·&nbsp;
        Your NFTs here: ${nftBal}${paused ? ' &nbsp;·&nbsp;<span class="bad">paused</span>' : ""}<br>
        ${launcherLabel ? escapeHtml(launcherLabel) + "<br>" : ""}
        <span class="muted">Free mint — you only pay gas (hanya bayar gas). One NFT per wallet per collection.</span><br>`;
      const btn = document.createElement("button");
      btn.className = "primary";
      btn.textContent = minted ? "Already minted" : soldOut ? "Sold out" : paused ? "Paused" : "Mint free";
      btn.disabled = !canMint;
      btn.addEventListener("click", () => mintFree(addr, name));
      div.appendChild(btn);
      box.appendChild(div);
    }
  } catch (e) {
    box.innerHTML = `<p class="bad">Could not load collections: ${escapeHtml(e.shortMessage || e.message)}</p>`;
  }
}

async function mintFree(collectionAddress, name) {
  if (!signer) return;
  try {
    log(`Minting from ${name} (${collectionAddress}) — value 0, gas only...`);
    const nft = new ethers.Contract(collectionAddress, NFT_ABI, signer);
    const tx = await nft.mint(); // value is always 0
    log(`Mint sent: ${explorerTx(network, tx.hash)}`);
    const receipt = await tx.wait();
    log(`Mint confirmed in block ${receipt.blockNumber}.`);
    await refreshBalances();
    await refreshCollections();
  } catch (e) {
    log("Mint failed: " + (e.shortMessage || e.message));
    alert("Mint failed: " + (e.shortMessage || e.message));
  }
}

async function launchCollection() {
  if (!signer || !hasAgentId) return;
  const name = $("cName").value.trim();
  const symbol = $("cSymbol").value.trim();
  const maxSupply = BigInt($("cSupply").value || "0");
  const payout = ethers.parseUnits($("cPayout").value || "0", 18);
  if (!name || !symbol || maxSupply === 0n || payout === 0n) {
    $("launchStatus").textContent = "Fill in name, symbol, max supply and reward per mint first.";
    return;
  }
  try {
    $("launchStatus").textContent = "Sending launch transaction (gas only, no fee)...";
    log(`Launching collection "${name}" (${symbol}), max supply ${maxSupply}, reward ${ethers.formatUnits(payout, 18)} AMT/mint...`);
    const factory = new ethers.Contract(cfg().factory, FACTORY_ABI, signer);
    const tx = await factory.createCollection(name, symbol, maxSupply, "", payout);
    log(`Launch sent: ${explorerTx(network, tx.hash)}`);
    const receipt = await tx.wait();
    const created = receipt.logs
      .map((l) => {
        try { return factory.interface.parseLog(l); } catch { return null; }
      })
      .find((p) => p && p.name === "CollectionCreated");
    const addr = created ? created.args.collection : "(see receipt)";
    $("launchStatus").textContent = `Collection launched: ${addr}`;
    log(`Collection launched: ${addr}`);
    await refreshCollections();
  } catch (e) {
    $("launchStatus").textContent = "Launch failed: " + (e.shortMessage || e.message);
    log("Launch failed: " + (e.shortMessage || e.message));
  }
}

async function switchNetwork() {
  if (!window.ethereum) return;
  const c = cfg();
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x" + c.chainId.toString(16) }],
    });
    log(`Switched wallet to ${c.chainName} (chain ${c.chainId}).`);
    await afterConnect();
  } catch (e) {
    if (e.code === 4902) {
      try {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [{
            chainId: "0x" + c.chainId.toString(16),
            chainName: c.chainName,
            rpcUrls: [c.rpcUrl],
            blockExplorerUrls: [c.blockExplorer],
            nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
          }],
        });
        await afterConnect();
      } catch (e2) {
        log("Add network failed: " + (e2.shortMessage || e2.message));
      }
    } else {
      log("Switch network failed: " + (e.shortMessage || e.message));
    }
  }
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[ch]));
}

$("connectBtn").addEventListener("click", connect);
$("switchBtn").addEventListener("click", switchNetwork);
$("refreshBtn").addEventListener("click", refreshCollections);
$("launchBtn").addEventListener("click", launchCollection);
$("network").addEventListener("change", async (e) => {
  network = e.target.value;
  log(`Network selection: ${network}`);
  if (account) await afterConnect();
  else await refreshNetworkUI();
});
if (window.ethereum) {
  window.ethereum.on("accountsChanged", (accounts) => {
    account = accounts[0] || null;
    if (account) {
      afterConnect();
    } else {
      // Wallet disconnected: reset the UI instead of showing a stale account.
      provider = null;
      signer = null;
      hasAgentId = false;
      accountAgentIdName = null;
      $("walletStatus").textContent = "Not connected.";
      $("walletStatus").className = "status";
      $("agentIdStatus").textContent = "";
      $("agentIdStatus").className = "status";
      $("amtBalance").textContent = "—";
      $("collections").innerHTML = `<p class="muted">Connect a wallet to see collections.</p>`;
      $("collectionCount").textContent = "";
      $("launchBtn").disabled = true;
      $("switchBtn").disabled = true;
    }
  });
  window.ethereum.on("chainChanged", () => {
    if (account) afterConnect();
  });
}
refreshNetworkUI();
