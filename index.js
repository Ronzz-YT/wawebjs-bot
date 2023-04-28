import wweb from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import fs from 'fs';
import axios from 'axios';
import util from 'util';
import cp from 'child_process';
import syntaxerror from 'syntax-error';
import speed from 'performance-now';
import chalk from 'chalk';
import { fileURLToPath } from 'url';
import { createRequire } from 'module'
import path, { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const require = createRequire(__dirname)

require(path.join(__dirname, './settings.js'))

// Import semua fungsi yang diperlukan menjadi variabel global
import * as cmd from './function/cmd.js';
import * as func from './function/func.js';

// Inisialisasi client WhatsApp
const { Client, LocalAuth, MessageMedia } = wweb;
const ronzz = new Client({
  authStrategy: new LocalAuth(),
  qrMaxRetries: 3,
  takeoverOnConflict: true,
  takeoverTimeoutMs: 3000,
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
ronzz.initialize();

// Event saat loading screen muncul
ronzz.on('loading_screen', (percent, message) => {
  console.log('LOADING SCREEN', percent, message);
});

// Event saat QR code muncul
ronzz.on('qr', (qr) => {
  console.log('QR RECEIVED', qr);
  qrcode.generate(qr, { small: true });
});

// Event saat proses authentikasi berhasil
ronzz.on('authenticated', () => {
  console.log('AUTHENTICATED');
});

// Event saat proses authentikasi gagal
ronzz.on('auth_failure', (msg) => {
  console.error('AUTHENTICATION FAILURE', msg);
});

// Event saat client WhatsApp siap digunakan
ronzz.on('ready', async () => {
  console.log('READY');
  
});

// Listener untuk kejadian ketika ada pengguna bergabung ke grup
ronzz.on('group_join', (anu) => {
  console.log(anu);
  let message = `*Welcome New Member*\n\n📛 : _@${anu.id.participant.split("@")[0]}_\n🔢 : _${anu.id.participant.split("@")[0]}_\n📆 : _${func.days()}, ${func.date()}_\n⏰ : _${func.time()} *WIB*_`;
  func.sendGroupMessage(anu, message, ronzz);
});

// Listener untuk kejadian ketika ada pengguna keluar dari grup
ronzz.on('group_leave', (anu) => {
  console.log(anu);
  let message = `*Goodbye Old Member*\n\n📛 : _@${anu.id.participant.split("@")[0]}_\n🔢 : _${anu.id.participant.split("@")[0]}_\n📆 : _${func.days()}, ${func.date()}_\n⏰ : _${func.time()} *WIB*_`;
  func.sendGroupMessage(anu, message, ronzz);
});

/*
 @Feature in here
*/
ronzz.on("message_create", async (m) => {
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
        this.isOwner = [...global.owner].map(v => v.replace(/[^0-9]/g, '') + '@c.us').includes(id.participant || from)
        this.quotedMessage = m.getQuotedMessage() || m      
      }

      async getChat() {
        if (this.chat) return this.chat;
        const chat = await m.getChat();
        this.chat = chat;
        return chat;
      }
    }

    const msg = new Message({ ...m });

    if (msg.isCmd) console.log('Pesan: ' + msg.body);

    const commands = {
      menu: () => cmd.menuCommand(m, func),
      runtime: () => cmd.runtimeCommand(m, func),
      tes: () => cmd.runtimeCommand(m, func),
      ping: () => cmd.pingCommand(m, speed),
      restart: () => cmd.restartCommand(m, cp),
      sticker: () => cmd.stickerCommand(m, msg.value, msg.quotedMessage, msg.command, MessageMedia),
      stiker: () => cmd.stickerCommand(m, msg.value, msg.quotedMessage, msg.command, MessageMedia),
      s: () => cmd.stickerCommand(m, msg.value, msg.quotedMessage, msg.command, MessageMedia),
      ytmp4: () => cmd.ytMp4Command(m, msg.value, msg.command, func, MessageMedia),
      ytmp3: () => cmd.ytMp3Command(m, msg.value, msg.command, func, MessageMedia),
      tt: () => cmd.tiktokMp4Command(m, msg.value, msg.command, func, MessageMedia),
      ttmp4: () => cmd.tiktokMp4Command(m, msg.value, msg.command, func, MessageMedia),
      tiktok: () => cmd.tiktokMp4Command(m, msg.value, msg.command, func, MessageMedia),
      tiktokmp4: () => cmd.tiktokMp4Command(m, msg.value, msg.command, func, MessageMedia),
      ttmp3: () => cmd.tiktokMp3Command(m, msg.value, msg.command, func, MessageMedia),
      tiktokmp3: () => cmd.tiktokMp3Command(m, msg.value, msg.command, func, MessageMedia)
    };

    if (commands[msg.command.replace(msg.prefix, '')]) {
      commands[msg.command.replace(msg.prefix, '')]();
    } else {
     // console.log('Text no command');
    }

    // Check command type
    switch (msg.command) {
      case '>':
      case '=>': {
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
          let erTxt = `${err ? `${err}\n\n` : ""}${util.format(e)}`;
          m.reply(erTxt);
        }
        break;
      }

      case '$': {
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
        break;
      }
    }
  } catch (e) {
    console.log(e);
  }
});

let file = require.resolve(__filename)
fs.watchFile(file, () => {
	fs.unwatchFile(file)
	console.log(chalk.redBright(`Update '${__filename}'`))
	delete require.cache[file]
	require(file)
})