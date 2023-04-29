import util from 'util';
import cp from 'child_process';
import syntaxerror from 'syntax-error';
import { tiktok } from "@xct007/frieren-scraper";
import fetch from 'node-fetch'
import { fileTypeFromBuffer } from 'file-type';
import fs from 'fs';
import { fileURLToPath, pathToFileURL } from "url";
let fileP = fileURLToPath(import.meta.url)

class CMD {
  constructor() {
    this.pesan = 'Dunia ini bukanlah milikmu, semua ini hanyalah punya tuhan';
  }

  async menuCommand(m, setting, prefix, func) {
    let text = `
▬▭▬▭▬▭ ✦✧✦ ▬▭▬▭▬▭
                        𝗠𝗘𝗡𝗨
▬▭▬▭▬▭ ✦✧✦ ▬▭▬▭▬▭
BOT NAME : ${setting.botname}
RUNTIME : ${func.format.clock(process.uptime())}
OWNER : @${setting.ownernomer}

SILAHKAN PILIH MENU DIBAWAH

*[ MAIN MENU ]*

• ${prefix}runtime
• ${prefix}ping

*[ OWNER MENU ]*

• ${prefix}restart
• ${prefix}sswa
• =>
• >
• $

*[ TOOLS MENU ]*

• ${prefix}sticker

*[ DOWNLOADER MENU ]*

• ${prefix}ytmp4
• ${prefix}ytmp3
• ${prefix}tiktokmp4
• ${prefix}tiktokmp3

*[ GROUP MENU ]*

• ${prefix}enable
• ${prefix}disabled

CREDIT : ${setting.ownname}
▬▭▬▭▬▭ ✦✧✦ ▬▭▬▭▬▭
`.trim()
    m.reply(text, false, { mentions: [func.parseMention(text)] });
  }

  async runtimeCommand(m, func) {
    m.reply(`*STATUS : BOT ONLINE*\n_Runtime : ${func.format.clock(process.uptime())}_`);
  }

  async pingCommand(m, speed) {
    let timestamp = speed();
    let latensi = speed() - timestamp;
    m.reply(`Kecepatan respon _${latensi.toFixed(4)} Second_`);
  }

  async restartCommand(m) {
    cp.exec(`pm2 restart waweb`); //Jika make pm2 
  }

  async stickerCommand(m, msg, setting, MessageMedia) {
    let qMsg = await msg.quotedMsg;
    let [packname, author] = msg.value.split(',');
    if (msg.quotedMsg && msg.quotedMsg.hasMedia) {
      let attachmentData = await (await qMsg.downloadMedia());
      await m.reply(new MessageMedia(attachmentData.mimetype, attachmentData.data, attachmentData.filename), false, { sendMediaAsSticker: true, stickerName: packname || setting.packname, stickerAuthor: author || setting.packname, stickerCategories: ['😅'] });
    } else return m.reply(`Reply media dengan caption *${msg.command}*`);
  }

  async tiktokMp4Command(m, msg, func, MessageMedia) {
    if (!msg.value) return m.reply(`Penggunaan: *${msg.command} https://www.tiktok.com/@initokyolagii/video/7189917930761506075*`);
    m.reply(mess.wait)
    const data = await tiktok.v1(msg.value);
    if (data.error) return m.reply(data.message);
    const buffVideo = Buffer.from(await (await fetch(data.play)).arrayBuffer());
    m.reply(new MessageMedia((await fileTypeFromBuffer(buffVideo)).mime, buffVideo.toString("base64")), false, { caption: `*${data.nickname}*\n@${data.unique_id}`.trim() });
  }
  
  async tiktokMp3Command(m, msg, func, MessageMedia) {
    if (!msg.value) return m.reply(`Penggunaan: *${msg.command} https://www.tiktok.com/@initokyolagii/video/7189917930761506075*`);
    if (!func.isUrl(msg.value)) return m.reply(mess.error.lv);
    m.reply(mess.wait)
    const data = await tiktok.v1(msg.value);
    if (data.error) return m.reply(data.message);
    const buffAudio = Buffer.from(await (await fetch(data.music)).arrayBuffer());
    m.reply(new MessageMedia((await fileTypeFromBuffer(buffAudio)).mime, buffAudio.toString("base64")));
  }
  
  async function ytMp4Command(m, msg, func, MessageMedia) {
    if (!msg.value) return m.reply(`Penggunaan: *${msg.command} https://youtu.be/cHfyes6e7HQ*`);
    if (!func.isUrl(msg.value)) return m.reply(mess.error.lv);
    fetch(`https://saipulanuar.ga/api/download/ytmp4?url=${msg.value}`).then(res => {
      let data = res.json()
      m.reply(mess.wait)
      let video = Buffer.from(await (await fetch(data.result.url)).arrayBuffer());
      m.reply(new MessageMedia((await fileTypeFromBuffer(video)).mime, video.toString("base64")), false, { caption: `*⭔Title :* ${data.result.title}\n*⭔Channel :* ${data.result.channel}\n*⭔Published :* ${data.result.published}\n*⭔View :* ${data.result.views}` });
    }).catch(err => {
      console.log(err)
      m.reply(mess.error.api)
    })
  }

  async function ytMp3Command(m, msg, func, MessageMedia) {
    if (!msg.value) return m.reply(`Penggunaan: *${msg.command} https://youtu.be/cHfyes6e7HQ*`);
    if (!func.isUrl(msg.value)) return m.reply(mess.error.lv);
    fetch(`https://saipulanuar.ga/api/download/ytmp3?url=${msg.value}`).then(res => {
      let data = res.json()
      m.reply(mess.wait)
      let audio = Buffer.from(fetch(data.result.url).arrayBuffer())
      m.reply(`*⭔Title :* ${data.result.title}\n*⭔Channel :* ${data.result.channel}\n*⭔Published :* ${data.result.published}\n*⭔View :* ${data.result.views}\n\n_Sedang mengirim audio_\n_Mohon tunggu sebentar._`)
      m.reply(new MessageMedia((fileTypeFromBuffer(audio)).mime, audio.toString("base64")));
    }).catch(err => {
      console.log(err)
      m.reply(mess.error.api)
    })
  }

  async screenshotWaCommand(m, conn, msg, MessageMedia) {
    if (!msg.isOwner) return m.reply(mess.owner)
    await conn.pupPage.setViewport({ width: 720, height: 1600 });
    let media = await conn.pupPage.screenshot({ fullPage: true });
    m.reply(new MessageMedia((await fileTypeFromBuffer(media)).mime, media.toString("base64")));
  }
	
  async activatorGroupCommand(m, msg) {
  	let isEnable = /true|enable|(turn)?on|1/i.test(msg.command)
      let groups = db.groups[m.to]
      let type = (msg.value || '').toLowerCase()
      let isAll = false, isUser = false
      if (!msg.isGroup) return m.reply(mess.group)
      if (!(msg.isAdmin || msg.isOwner)) return m.reply(mess.admin)
      switch (type) {
      	case 'welcome':
          groups.welcome = isEnable
          break
          default:
      if (!/[01]/.test(msg.command)) return m.reply(`
List option: 
=> welcome 

Contoh:
${msg.prefix}enable welcome 
${msg.prefix}disable welcome
`.trim())
    throw false
  }
  m.reply(`
*${type}* berhasil di *${isEnable ? 'nyala' : 'mati'}kan* ${isAll ? 'untuk bot ini' : isUser ? '' : 'untuk chat ini'}
`.trim())
      	}
  	}
export default CMD

fs.watchFile(fileP, () => {
    fs.unwatchFile(fileP)
    console.log(`Update File "${fileP}"`)
    import(`${import.meta.url}?update=${Date.now()}`)
})