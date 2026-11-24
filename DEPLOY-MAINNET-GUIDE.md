# AgentMint — Panduan Deploy Mainnet (untuk Bos)

> **Yang Bos lakukan:** deploy 3 kontrak dari laptop Bos sendiri (Remix + WalletConnect ke aplikasi Binance). Kunci wallet tetap di tangan Bos — Muse tidak pernah memegang seed/private key Bos.
> **Waktu:** ~15–20 menit. **Biaya:** ~0,0002 BNB (kurang dari $0,20) pada gas saat ini. **Jaringan:** BNB Smart Chain (chain ID 56) — JANGAN deploy ke jaringan lain.
> **Syarat sebelum mulai:** Bos memilih Path C — lewati testnet, langsung mainnet dengan hati-hati (kontrak sudah lolos 24/24 test lokal, gas dicek rendah).

## Yang disiapkan

- Laptop Bos (browser Chrome) + HP Bos dengan aplikasi Binance.
- **Deploy dilakukan dari wallet UTAMA Bos (yang terhubung via WalletConnect).** Wallet Agentic (`0xaD50d4C370e1a55d7517215E33b0176472260720`, Agent ID `jiazi22.ai`) memang **tidak bisa** dihubungkan ke Remix — Binance merancangnya hanya untuk agen (Muse via baw), dan FAQ resmi mereka bilang jangan sign-in Agentic via QR situs pihak ketiga. Wallet utama yang jadi admin Token + owner Factory; koleksi Genesis nanti dibuat Muse dari wallet Agentic via baw.
- Saldo BNB di wallet utama: cek dulu — biaya deploy ~0,0002 BNB. Kalau 0, kirim ~0,001 BNB dari wallet Agentic ke wallet utama di aplikasi Binance.

## Langkah 0 — Cek gas dulu

1. Buka https://bscscan.com/gastracker di browser laptop.
2. Lihat angka gas saat ini. **Deploy hanya kalau gas rendah (ideal di bawah 1 gwei; sekarang ~0,05 gwei).**
3. Kalau gas di atas 1 gwei, tunggu sampai turun — jangan deploy saat gas mahal.

## Langkah 1 — Buka Remix dan ambil kode

1. Buka https://remix.ethereum.org di browser laptop.
2. Di panel kiri, klik ikon **Source Control** (ikon cabang/branch).
3. Klik **Clone**, lalu tempel URL repo ini dan clone:
   `https://github.com/A2aji/agentmint`
   (Kalau Clone tidak muncul: buka https://github.com/A2aji/agentmint di tab baru → tombol hijau **Code** → **Download ZIP** → di Remix, File Explorer → **Upload Folder** → pilih folder hasil ekstrak ZIP.)
4. Pastikan folder `contracts/` muncul dengan 3 file: `AgentMintToken.sol`, `AgentMintNFT.sol`, `AgentMintFactory.sol`.

## Langkah 2 — Compile

1. Klik ikon **Solidity Compiler** (ikon "S") di panel kiri.
2. Atur: **Compiler:** `0.8.24` · centang **Enable optimization**, isi **Runs:** `200` · **EVM Version:** `Cancun` (di pengaturan lanjutan/Advanced).
3. Klik **Compile** (atau "Compile contracts/AgentMintToken.sol" — compile semua).
4. Pastikan tidak ada error merah. Peringatan kuning boleh diabaikan.

## Langkah 3 — Hubungkan wallet Bos

1. Klik ikon **Deploy & Run Transactions** (ikon panah) di panel kiri.
2. Di **Environment**, pilih **WalletConnect** (bukan "Injected Provider").
3. Akan muncul kode QR. Buka aplikasi **Binance** di HP → **WalletConnect** (biasanya di menu scan/koneksi) → scan QR itu → setujui koneksi.
4. Pastikan di Remix tertulis jaringan **BNB Smart Chain (56)**. Alamat yang terhubung adalah **wallet UTAMA Bos** (bukan `0xaD50...0720` — wallet Agentic memang tidak bisa terhubung ke Remix). **Catat alamat wallet utama itu dan kirim ke Muse** untuk dicek saldonya sebelum deploy.
5. Kalau tertulis jaringan lain, ganti ke BNB Smart Chain dulu di aplikasi Binance.

## Langkah 4 — Deploy AgentMintToken

1. Di **Contract**, pilih `AgentMintToken`.
2. Tidak ada isian constructor (kosong). Klik **Deploy**.
3. Konfirmasi transaksi di aplikasi Binance di HP (cek: jaringan BNB Smart Chain, biaya gas kecil).
4. Setelah berhasil, di bawah akan muncul entri `AgentMintToken at 0x...` — **salin alamatnya**. Ini alamat **TOKEN**.

## Langkah 5 — Deploy AgentMintNFT (implementation)

1. Di **Contract**, pilih `AgentMintNFT`.
2. Tidak ada isian constructor. Klik **Deploy**, konfirmasi di HP.
3. **Salin alamatnya.** Ini alamat **IMPLEMENTATION**.

## Langkah 6 — Deploy AgentMintFactory

1. Di **Contract**, pilih `AgentMintFactory`.
2. Isi constructor (3 alamat, urut persis seperti ini):
   - `_implementation` → alamat **IMPLEMENTATION** dari Langkah 5
   - `_rewardToken` → alamat **TOKEN** dari Langkah 4
   - `_agentId` → `0x60b9262456de011f7d15a54cdd8c48baaa8b022f` (kontrak resmi Agent ID — jangan diganti)
3. Klik **Deploy**, konfirmasi di HP.
4. **Salin alamatnya.** Ini alamat **FACTORY**.

## Langkah 7 — Beri izin factory (WAJIB, kalau tidak, mint pertama gagal)

1. Di **Contract**, pilih `AgentMintToken`, lalu di kolom **At Address** tempel alamat **TOKEN** → klik **At Address**.
2. Cari fungsi `grantRole`, buka, isi:
   - `role` → `0xedcc084d3dcd65a1f7f23c65c46722faca6953d28e43150a467cf43e5c309238`
   - `account` → alamat **FACTORY** dari Langkah 6
3. Klik **transact**, konfirmasi di HP.
4. (Cek: nilai role itu adalah `REGISTRAR_ROLE` — bisa dicek dengan memanggil fungsi `REGISTRAR_ROLE` di kontrak Token, hasilnya harus sama persis dengan nilai di atas.)

## Langkah 8 — (Dilakukan Muse, bukan Bos) Buat koleksi pertama

Koleksi Genesis dibuat oleh Muse dari wallet Agentic via baw — hanya wallet Agentic yang punya Agent ID (syarat `createCollection`), dan wallet Agentic hanya bisa bergerak lewat agen. Bos **tidak perlu** melakukan langkah ini di Remix. Cukup kirim 3 alamat dari Langkah 4–6 ke Muse (Langkah 9), dan Muse yang membuat koleksi Genesis (`AgentMint Genesis`, `AMG`, maxSupply 10000, payout 1000 AMT) lalu mengirim alamat koleksinya ke Bos.

## Langkah 9 — Kirim ke Muse

Kirim ke Muse (WhatsApp) 3 alamat ini:

- TOKEN: `0x...`
- IMPLEMENTATION: `0x...`
- FACTORY: `0x...`

(Muse yang membuat koleksi Genesis setelah menerima 3 alamat ini, lalu mengirim alamat koleksinya ke Bos.)

Muse yang akan: verifikasi ketiganya di BscScan, isi alamat mainnet di halaman mint, publish halaman, lalu submit proyek ke form hackathon.

## Aturan aman (baca dulu)

- **Jangan pernah kirim seed phrase / private key ke siapa pun**, termasuk ke Muse. Remix tidak pernah meminta seed — kalau ada yang minta seed, itu penipuan, berhenti.
- **Setiap transaksi harus Bos konfirmasi sendiri di aplikasi Binance.** Jangan setujui transaksi yang Bos tidak kenal.
- **Deploy hanya ke BNB Smart Chain (56).** Kalau Remix menampilkan jaringan lain, berhenti dan tanya Muse.
- **Kalau ada langkah yang gagal / alamat tidak muncul / angka gas tiba-tiba besar**, berhenti, jangan ulangi transaksi, dan kirim screenshot ke Muse.
- Total gas 3 deploy + setup ≈ 3,7 juta gas → ~0,000185 BNB pada 0,05 gwei; ~0,0037 BNB pada 1 gwei — dibayar dari **wallet utama** (pastikan saldonya cukup; kalau 0, kirim ~0,001 BNB dari wallet Agentic). Koleksi Genesis (via baw) dibayar dari wallet Agentic (saldo 0,01014 BNB).

## Setelah deploy

- Muse verifikasi kontrak di BscScan (butuh alamat dari Bos, bukan kunci).
- Muse isi `frontend/config.js` mainnet → halaman mint di https://a2aji.github.io/agentmint/ jadi hidup.
- Muse submit proyek ke form resmi hackathon (butuh produk live + 30 alamat Agent ID berinteraksi — rekrutmen menyusul).
