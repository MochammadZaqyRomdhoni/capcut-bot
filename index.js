require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const express = require("express");
const fs = require("fs");

const app = express();
app.use(express.json());

const TOKEN = process.env.TOKEN;
const BASE_URL = process.env.BASE_URL;
const ADMIN_ID = process.env.ADMIN_ID;
const bot = new TelegramBot(TOKEN);

bot.setWebHook(`${BASE_URL}/bot${TOKEN}`);

// DB sederhana pakai file JSON
const loadProduk = () => JSON.parse(fs.readFileSync("produk.json", "utf-8"));
const saveProduk = (data) => fs.writeFileSync("produk.json", JSON.stringify(data, null, 2));

// Route webhook
app.post(`/bot${TOKEN}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// Fungsi handle command
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, `Halo ${msg.from.first_name}! Ketik /menu untuk mulai.`);
});

bot.onText(/\/menu/, (msg) => {
  const isAdmin = msg.from.id.toString() === ADMIN_ID;
  let teks = "📦 Menu:\n- /produk = Lihat produk\n";

  if (isAdmin) {
    teks += "- /tambah = Tambah produk\n- /hapus = Hapus produk";
  }

  bot.sendMessage(msg.chat.id, teks);
});

bot.onText(/\/produk/, (msg) => {
  const list = loadProduk();
  if (list.length === 0) return bot.sendMessage(msg.chat.id, "Belum ada produk.");

  let teks = "*📦 Stok Produk:*\n";
  list.forEach((p, i) => {
    teks += `${i + 1}. *${p.nama}* (${p.stok} stok)\n`;
  });

  bot.sendMessage(msg.chat.id, teks, { parse_mode: "Markdown" });
});

// Tambah produk (admin)
bot.onText(/\/tambah/, (msg) => {
  if (msg.from.id.toString() !== ADMIN_ID) return;

  bot.sendMessage(msg.chat.id, "Format: nama|stok").then(() => {
    bot.once("message", (res) => {
      const [nama, stok] = res.text.split("|");
      const data = loadProduk();
      data.push({ nama, stok: parseInt(stok) });
      saveProduk(data);
      bot.sendMessage(msg.chat.id, "✅ Produk ditambahkan.");
    });
  });
});

// Hapus produk (admin)
bot.onText(/\/hapus/, (msg) => {
  if (msg.from.id.toString() !== ADMIN_ID) return;

  const list = loadProduk();
  let teks = "*Pilih produk yang ingin dihapus:*\n";
  list.forEach((p, i) => {
    teks += `${i + 1}. ${p.nama}\n`;
  });

  bot.sendMessage(msg.chat.id, teks, { parse_mode: "Markdown" }).then(() => {
    bot.once("message", (res) => {
      const idx = parseInt(res.text) - 1;
      if (list[idx]) {
        list.splice(idx, 1);
        saveProduk(list);
        bot.sendMessage(msg.chat.id, "❌ Produk dihapus.");
      } else {
        bot.sendMessage(msg.chat.id, "❌ Nomor tidak valid.");
      }
    });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Bot jalan di port " + PORT);
});
