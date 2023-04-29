import wweb from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import fs from 'fs';
import axios from 'axios';
import util from 'util';
import cp from 'child_process';
import syntaxerror from 'syntax-error';
import speed from 'performance-now';
import * as load from './function/loaderDatabase.js';

// Import semua fungsi yang diperlukan menjadi variabel global
import CMD from './function/cmd.js'
const cmd = new CMD();
import * as func from './function/func.js'
import { databased, dbsaver, connect } from './function/database.js';

global.setting = {
  botname: 'VelzzyBotz',
  owner: ['628817839722', '628815739965', '6281585933017'],
  ownername: 'Ronzz YT',
  ownernomer: '628817839722',
  packname: '© VelzzyBotz',
  author: 'dibuat oleh Ronzz YT'
}

global.mess = {
  sukses: "Done🤗",
  admin: "Command ini hanya bisa digunakan oleh Admin Grup",
  botAdmin: "Bot Harus menjadi admin",
  owner: "Command ini hanya dapat digunakan oleh owner bot",
  prem: "Command ini khusus member premium",
  group: "Command ini hanya bisa digunakan di grup",
  private: "Command ini hanya bisa digunakan di Private Chat",
  wait: "⏳ Mohon tunggu sebentar...",
  error: {
	lv: "Link yang kamu berikan tidak valid",
	api: "Maaf terjadi kesalahan"
  }
}

// Inisialisasi client WhatsApp
const { Client, LocalAuth, MessageMedia } = wweb;
const deff = new Client({
  authStrategy: new LocalAuth(),
  bypassCSP: true,
  puppeteer: {
    args: [
      '--no-sandbox',
      '--disable-web-security',
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-setuid-sandbox',
      '--disable-accelerated-2d-canvas',
      '--disable-session-crashed-bubble',
      '--start-maximized',
      '--disable-features=LightMode',
      '--force-dark-mode'
    ],
    executablePath: '/usr/bin/google-chrome-stable' // untuk pengguna ubuntu/vps
  },
  userAgent:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36'
});

// Mulai menjalankan client WhatsApp
deff.initialize();
connect().catch(() => connect())
setInterval(async () => { fs.writeFileSync(`./storage/database/database.json`, JSON.stringify(global.db, null, 3))}, 3 * 1000)
// Event saat loading screen muncul
deff.on('loading_screen', (percent, message) => {
  console.log('LOADING SCREEN', percent, message);
});

// Event saat QR code muncul
deff.on('qr', (qr) => {
  console.log('QR RECEIVED', qr);
  qrcode.generate(qr, { small: true });
});

// Event saat proses authentikasi berhasil
deff.on('authenticated', () => {
  console.log('AUTHENTICATED');
});

// Event saat proses authentikasi gagal
deff.on('auth_failure', (msg) => {
  console.error('AUTHENTICATION FAILURE', msg);
});

// Event saat client WhatsApp siap digunakan
deff.on('ready', async () => {
  console.log('READY');
});

// Listener untuk kejadian ketika ada pengguna bergabung ke grup
deff.on('group_join', (anu) => {
  if (db.groups[anu.id].welcome === true) {
    console.log(anu);
    const message = 'Selamat datang';
    func.sendGroupMessage(anu, message, deff);
  }
});

// Listener untuk kejadian ketika ada pengguna keluar dari grup
deff.on('group_leave', (anu) => {
  if (db.groups[anu.id].welcome === true) {
    console.log(anu);
    const message = 'Selamat tinggal';
    func.sendGroupMessage(anu, message, deff);
  }
});

/*
 @Feature in here
*/
deff.on("message_create", async (m) => {
  try {
    if (!m._data.isNewMsg) return;

    class Message {
      constructor({ body = "", from, id, hasMedia, timestamp, type, hasQuotedMsg }) {
        this.from = from;
        this.id = id;
        this.hasMedia = hasMedia;
        this.timestamp = timestamp;
        this.type = type;
        this.hasQuotedMsg = hasQuotedMsg;
        this.sender = id.participant || from;
        this.chat = null;
        this.body = body;
        this.args = body.trim().split(/\s+/).slice(1);
        this.value = this.args.join(" ");
        this.prefix = /^[./!#%^&=\,;:()]/.test(body) ? body[0] : "#";
        this.command = body?.toLowerCase().split(/\s+/)[0] || "";
        this.isCmd = body?.startsWith(this.prefix) || false;
        this.isOwner = [...setting.owner].map(v => v.replace(/[^0-9]/g, '') + '@c.us').includes(id.participant || from)
        this.quotedMessage = m.getQuotedMessage() || m;
        this.isGroup = m.id.remote.endsWith('g.us');
        this.isPrivate = m.id.remote.endsWith('c.us');
      }

      async getChat() {
        if (this.chat) return this.chat;
        const chat = await m.getChat();
        this.chat = chat;
        return chat;
      }
    }

  const msg = new Message({ ...m });
  const participantsGroup = await m.getChat().then(chat => chat.participants);
  const adminFilter = msg.isGroup ? participantsGroup.filter(v => v.isAdmin).map(v => v.id.user) : null;
  msg.isAdmin = adminFilter ? adminFilter.map(v => v.replace(/[^0-9]/g, '') + '@c.us').includes(m.author ? m.author : m.from) : false;
  msg.isBotAdmin = adminFilter ? adminFilter.map(v => v.replace(/[^0-9]/g, '') + '@c.us').includes(deff.info.me._serialized) : false;

  
  if (msg.isCmd) { console.log('Pesan: ' + msg.body) }
    if (msg.body) { await load.loadDatabase(m, msg) }
    if (db.setting.self === true) {
    	if (msg.isCmd && !msg.isOwner) { return
      }
    }
const commands = {
  menu: (message) => ({
    execute: () => cmd.menuCommand(m, setting, msg.prefix, func),
    matches: ['menu', 'help']
  }),
  runtime: (message) => ({
    execute: () => cmd.runtimeCommand(m, func),
    matches: ['runtime', 'uptime', 'tes']
  }),
  ping: (message) => ({
    execute: () => cmd.pingCommand(m, speed),
    matches: ['ping', 'speed']
  }),
  restart: (message) => ({
    execute: () => cmd.restartCommand(m, cp),
    matches: ['restart']
  }),
  sticker: (message) => ({
    execute: () => cmd.stickerCommand(m, msg, setting, MessageMedia),
    matches: ['sticker', 's', 'stiker', 'sgif', 'stickergif', 'stikergif']
  }),
  ytmp4: (message) => ({
    execute: () => cmd.ytMp4Command(m, msg, func, MessageMedia),
    matches: ['ytmp4', 'ytvideo', 'ytdl', 'ytdlmp4']
  }),
  ytmp3: (message) => ({
    execute: () => cmd.ytMp3Command(m, msg, func, MessageMedia),
    matches: ['ytmp3', 'ytaudio', 'ytdlmp3']
  tiktokmp4: (message) => ({
    execute: () => cmd.tiktokMp4Command(m, msg, func, MessageMedia),
    matches: ['tiktok', 'tiktokvideo', 'ttvideo', 'tiktokmp4', 'ttdl', 'ttdlm4', 'ttmp4', 'tt']
  }),
  tiktokmp3: (message) => ({
    execute: () => cmd.tiktokMp4Command(m, msg, func, MessageMedia),
    matches: ['tiktokmp3', 'tiktokaudio', 'ttaudio', 'ttdlm3', 'ttmp3']
  }),
  screenshotWa: (message) => ({
  	execute: () => cmd.screenshotWaCommand(m, deff, msg, MessageMedia),
      matches: ['sswa', 'screenshot-whatsapp']
  	}),
  activator: (message) => ({
  	execute: () => cmd.activatorGroupCommand(m, msg),
      matches: ['enable', 'disable']
  	})
};


function findCommand(message) {
  const command = message.command.slice(1);
  for (const cmd of Object.keys(commands)) {
    const { matches, execute } = commands[cmd](message);
    if (matches.includes(command)) {
      execute();
      return;
    }
  }
  // console.log('Text no command');
}

if (msg) {
  findCommand(msg);
}

//No prefix command
 let commandTypes = {
  '>': async (msg, m) => {
    // Evaluate argument
    if (!msg.isOwner) return;
    try {
      const result = await eval(`(async () => { return ${msg.value} })()`);
      console.log(result);
      m.reply(util.format(result));
    } catch (e) {
      const err = syntaxerror(msg.value, "EvalError", {
        allowReturnOutsideFunction: true,
        allowAwaitOutsideFunction: true,
        sourceType: "module"
      });
      let erTxt = `${err ? `${err}\n\n` : ""}${util.format(e)}`
      m.reply(erTxt);
    }
  },
  '$': (msg, m) => {
    // Execute shell command
    if (!msg.isOwner) return;
    try {
      cp.exec(msg.args.join(" "), function (err, stdout) {
        if (err) m.reply(util.format(err.toString().replace(/\x1b\[[0-9;]*m/g, "")));
        if (stdout) m.reply(util.format(stdout.toString().replace(/\x1b\[[0-9;]*m/g, "")));
      });
    } catch (e) {
      console.warn(e);
    }
  }
}
const messageType = msg.command;
const commandHandler = commandTypes[messageType];
if (commandHandler) {
  commandHandler(msg, m);
}

  } catch (e) {
    console.warn(e);
  }
});
