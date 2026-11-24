# AgentMint — Panduan tBNB via MetaMask (Path B)

> **Untuk apa:** mendapatkan tBNB ke wallet deployer testnet, karena wallet
> Agentic tidak punya testnet dan faucet resmi butuh alamat yang pegang
> ≥0,002 BNB di mainnet.
> **Waktu:** ~10 menit. **Biaya:** 0,005 BNB (mainnet, ~$2,80) + gas kirim
> yang kecil. tBNB-nya sendiri gratis dan tidak bernilai.

## Langkah 1 — Install MetaMask dan buat wallet baru

1. Install **MetaMask** gratis dari Play Store / App Store.
2. Buka MetaMask → **Create a new wallet** (buat wallet BARU, jangan import).
3. Buat password, lalu MetaMask menampilkan **seed phrase (12 kata)**.
   **SIMPAN 12 kata itu di kertas / tempat aman di luar HP. Jangan pernah
   kirim seed phrase itu ke siapa pun — termasuk ke Muse.** Kalau ada yang
   minta seed phrase, itu penipuan.
4. Setelah selesai, di layar utama MetaMask akan terlihat alamat wallet
   baru Bos (diawali `0x...`). **Salin alamat itu.**

## Langkah 2 — Kirim 0,005 BNB (mainnet) ke MetaMask

1. Buka aplikasi **Binance** (wallet Agentic Bos).
2. Kirim **0,005 BNB** di jaringan **BNB Smart Chain (mainnet)** ke alamat
   MetaMask dari Langkah 1.
3. Tunggu sampai masuk (biasanya <1 menit). Saldo mainnet Bos 0,01014 BNB
   — cukup, sisa ~0,005 BNB.

## Langkah 3 — Klaim tBNB gratis ke alamat MetaMask

1. Buka di browser HP: https://testnet.bnbchain.org/faucet-smart
2. Tempel **alamat MetaMask** Bos di kolom "Wallet Address".
   (Alamat ini sekarang pegang 0,005 BNB di mainnet, jadi lolos syarat
   faucet "0,002 BNB on BSC Mainnet is needed".)
3. Klik **Send 0.3 BNB**. Selesaikan pemeriksaan keamanan kalau muncul.
4. Dapat **0,3 tBNB**. Jatah klaim 1x per 24 jam.

## Langkah 4 — Tambahkan jaringan BSC Testnet di MetaMask

1. Di MetaMask, ketuk nama jaringan di atas layar → **Add network** →
   **Add a network manually**, isi persis:
   - Network name: `BNB Smart Chain Testnet`
   - RPC URL: `https://data-seed-prebsc-2-s1.binance.org:8545/`
   - Chain ID: `97`
   - Currency symbol: `tBNB`
   - Block explorer URL: `https://testnet.bscscan.com`
2. Simpan, lalu ganti jaringan ke **BNB Smart Chain Testnet**. Saldo 0,3
   tBNB akan terlihat.

## Langkah 5 — Kirim 0,05 tBNB ke deployer

1. Di MetaMask (jaringan BSC Testnet), ketuk **Send**.
2. Alamat tujuan: `0x1917eaea3d9092487E8De6a8068A1359C8b2882B`
3. Jumlah: `0,05` tBNB. Kirim.
4. **Kirim ke Muse: "tBNB sudah dikirim".** Muse langsung menjalankan
   deploy + uji testnet (kontrak sudah siap semua).

## Catatan

- Alamat deployer `0x1917eaea...` adalah wallet testnet sekali-pakai milik
  proyek (kuncinya hanya di mesin Muse, tidak pernah di-print). tBNB tidak
  bernilai — tidak ada uang asli di sini.
- 0,005 BNB mainnet yang Bos kirim ke MetaMask tetap milik Bos (di wallet
  MetaMask Bos), bukan dibayarkan ke siapa pun. Sisa tBNB di MetaMask juga
  tetap milik Bos.
- Kalau ada langkah yang gagal / alamat tidak muncul / MetaMask minta hal
  aneh, berhenti dan kirim screenshot ke Muse.
