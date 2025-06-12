// index.js
require('dotenv').config();
const fs = require('fs');
const TelegramBot = require('node-telegram-bot-api');

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });
const ADMIN_ID = process.env.ADMIN_ID;
const DATA_FILE = 'produk.json';

function loadProduk() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE));
  } catch (e) {
    return [];
  }
}

function saveProduk(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Selamat datang! Ketik /beli untuk beli Akun CapCut Premium.');
});

bot.onText(/\/beli/, (msg) => {
  const chatId = msg.chat.id;
  const qr = 'https://dummyqris.link/qris.png';
  bot.sendMessage(chatId, `Silakan bayar Rp 10000 ke QRIS berikut (dummy):\n${qr}\n\nKetik *Saya sudah bayar* jika sudah.`, {
    parse_mode: 'Markdown'
  });
});

bot.onText(/Saya sudah bayar/i, (msg) => {
  const akun = {
    email: 'dummycapcut@mail.com',
    password: 'password123'
  };
  bot.sendMessage(msg.chat.id, `✅ *Pembayaran diterima!*\nBerikut akun CapCut kamu:\n\nEmail: ${akun.email}\nPassword: ${akun.password}`, {
    parse_mode: 'Markdown'
  });
});

bot.onText(/\/tambahproduk/, (msg) => {
  if (msg.from.id.toString() !== ADMIN_ID) return;
  bot.sendMessage(msg.chat.id, 'Kirim produk dengan format: `nama|stok`', { parse_mode: 'Markdown' });
});

bot.on('message', (msg) => {
  if (msg.from.id.toString() !== ADMIN_ID) return;
  if (msg.text && msg.text.includes('|')) {
    const [nama, stok] = msg.text.split('|');
    if (!nama || isNaN(stok)) return;
    const produk = loadProduk();
    produk.push({ nama: nama.trim(), stok: parseInt(stok) });
    saveProduk(produk);
    bot.sendMessage(msg.chat.id, `✅ Produk '${nama}' berhasil ditambahkan.`);
  }
});

bot.onText(/\/stok/, (msg) => {
  if (msg.from.id.toString() !== ADMIN_ID) return;
  const produk = loadProduk();
  let msgText = `*Stok Produk:*
`;
  produk.forEach((p, i) => {
    msgText += `#${i + 1} ${p.nama} - ${p.stok} pcs\n`;
  });
  bot.sendMessage(msg.chat.id, msgText, { parse_mode: 'Markdown' });
});

bot.onText(/\/hapusproduk (\d+)/, (msg, match) => {
  if (msg.from.id.toString() !== ADMIN_ID) return;
  const produk = loadProduk();
  const index = parseInt(match[1]) - 1;
  if (produk[index]) {
    const removed = produk.splice(index, 1);
    saveProduk(produk);
    bot.sendMessage(msg.chat.id, `🗑️ Produk '${removed[0].nama}' dihapus.`);
  } else {
    bot.sendMessage(msg.chat.id, '❌ Produk tidak ditemukan.');
  }
});
