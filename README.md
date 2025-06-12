
# CapCut Bot (Telegram)

Bot jualan akun CapCut otomatis lewat Telegram.

## Perintah Bot
- `/me` → lihat ID Telegram kamu
- `/tambahproduk NAMA HARGA`
- `/tambahakun NAMA\nemail|pass`
- `/stok`
- `/hapusproduk NAMA`

## Deploy ke Railway
1. Upload ZIP ini ke Railway
2. Masukkan Variables:
   - `BOT_TOKEN` dan `ADMIN_ID`
3. Jalankan project
4. Set Webhook:
   `https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=https://<URL>.railway.app/webhook`
