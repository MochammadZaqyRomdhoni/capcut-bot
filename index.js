require('dotenv').config();
const { Telegraf } = require('telegraf');
const fs = require('fs');
const express = require('express');
const app = express();

const bot = new Telegraf(process.env.BOT_TOKEN);
const ADMIN_ID = process.env.ADMIN_ID;
const FILE_PATH = './produk.json';

// Load produk
function loadProduk() {
    if (!fs.existsSync(FILE_PATH)) return {};
    return JSON.parse(fs.readFileSync(FILE_PATH));
}

// Simpan produk
function saveProduk(data) {
    fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2));
}

// /start
bot.start((ctx) => {
    ctx.reply('Selamat datang! Ketik /me untuk melihat ID kamu.');
});

// /me
bot.command('me', (ctx) => {
    ctx.reply(`ID Telegram kamu: ${ctx.from.id}`);
});

// /tambahproduk NAMA HARGA
bot.command('tambahproduk', (ctx) => {
    if (ctx.from.id.toString() !== ADMIN_ID) return;
    const [nama, harga] = ctx.message.text.split(' ').slice(1);
    if (!nama || !harga) return ctx.reply('Format: /tambahproduk NAMA HARGA');
    const data = loadProduk();
    data[nama] = { harga: parseInt(harga), stok: [] };
    saveProduk(data);
    ctx.reply(`Produk ${nama} ditambahkan dengan harga Rp${harga}`);
});

// /tambahakun NAMA\nemail|pass
bot.command('tambahakun', (ctx) => {
    if (ctx.from.id.toString() !== ADMIN_ID) return;
    const lines = ctx.message.text.split('\n');
    const [_, namaProduk] = lines[0].split(' ');
    if (!namaProduk) return ctx.reply('Format: /tambahakun NAMA_PRODUK\nemail|pass');
    const data = loadProduk();
    if (!data[namaProduk]) return ctx.reply('Produk tidak ditemukan.');
    const akunBaru = lines.slice(1).map(line => {
        const [email, password] = line.split('|');
        return { email, password, terpakai: false };
    });
    data[namaProduk].stok.push(...akunBaru);
    saveProduk(data);
    ctx.reply(`${akunBaru.length} akun ditambahkan ke ${namaProduk}`);
});

// /stok
bot.command('stok', (ctx) => {
    const data = loadProduk();
    if (Object.keys(data).length === 0) return ctx.reply('Belum ada produk.');
    let msg = '*Stok Produk:*
';
    for (const [nama, info] of Object.entries(data)) {
        const sisa = info.stok.filter(a => !a.terpakai).length;
        msg += `• ${nama} - ${sisa} akun tersedia - Rp${info.harga}
`;
    }
    ctx.replyWithMarkdown(msg);
});

// /hapusproduk NAMA
bot.command('hapusproduk', (ctx) => {
    if (ctx.from.id.toString() !== ADMIN_ID) return;
    const nama = ctx.message.text.split(' ')[1];
    const data = loadProduk();
    if (!data[nama]) return ctx.reply('Produk tidak ditemukan.');
    delete data[nama];
    saveProduk(data);
    ctx.reply(`Produk ${nama} telah dihapus.`);
});

// Webhook
app.use(express.json());
app.post('/webhook', (req, res) => {
    bot.handleUpdate(req.body);
    res.sendStatus(200);
});

// Jalankan server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
