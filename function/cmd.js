import('../settings.js');

import util from 'util';
import cp from 'child_process';
import syntaxerror from 'syntax-error';
import { tiktok } from '@xct007/frieren-scraper';
import fetch from 'node-fetch';
import { fileTypeFromBuffer } from 'file-type';
import { ytMp4, ytMp3 } from './y2mate.js';

export async function menuCommand(m, func) {
  let text = `▬▭▬▭▬▭ ✦✧✦ ▬▭▬▭▬▭
                        𝗠𝗘𝗡𝗨
▬▭▬▭▬▭ ✦✧✦ ▬▭▬▭▬▭
BOT NAME : ${global.botname}
RUNTIME : ${func.format.clock(process.uptime())}
OWNER : @${global.ownnomer}

SILAHKAN PILIH MENU DIBAWAH

*[ MAIN MENU ]*

• ${prefix}runtime
• ${prefix}ping

*[ OWNER MENU ]*

• ${prefix}restart
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

CREDIT : ${global.ownname}
▬▭▬▭▬▭ ✦✧✦ ▬▭▬▭▬▭`
  m.reply(text, false, { mentions : [func.parseMention(text)]});
}

export async function runtimeCommand(m, func) {
  m.reply(`*STATUS : BOT ONLINE*\n_Runtime : ${func.format.clock(process.uptime())}_`);
}

export async function pingCommand(m, speed) {
  let timestamp = speed();
  let latensi = speed() - timestamp;
  m.reply(`Kecepatan respon _${latensi.toFixed(4)} Second_`);
}

export async function restartCommand(m, cp) {
  cp.exec('pm2 restart ronzz');
}

export async function stickerCommand(m, text, quotedMsg, command, MessageMedia) {
  let packname = text.split(',')[0]
  let author = text.split(',')[1]
  if (!quotedMsg) return m.reply(`Reply media dengan caption *${prefix+command}*`)
  let attachmentData = quotedMsg.downloadMedia();
  m.reply(global.mess.wait)
  m.reply(new MessageMedia(attachmentData.mimetype, attachmentData.data, attachmentData.filename), false, { sendMediaAsSticker: true, stickerName: packname || global.packname, stickerAuthor: author || global.author, stickerCategories: ['ðŸ˜…']})
}

export async function tiktokMp4Command(m, value, command, func, MessageMedia) {
  if (!value) return m.reply(`Penggunaan: *${prefix+command} https://www.tiktok.com/@initokyolagii/video/7189917930761506075*`);
  if (!func.isUrl(value)) return m.reply(global.mess.error.lv);
  let data = tiktok.v1(value)
  if (data.error) return m.reply(data.message);
  let video = Buffer.from(fetch(data.play).arrayBuffer())
  m.reply(global.mess.wait)
  m.reply(new MessageMedia((fileTypeFromBuffer(video)).mime, video.toString("base64")), false, { caption: `*Name :* ${data.nickname}\n*Author :* @${data.unique_id}` });
}

export async function tiktokMp3Command(m, value, command, func, MessageMedia) {
  if (!value) return m.reply(`Penggunaan: *${prefix+command} https://www.tiktok.com/@initokyolagii/video/7189917930761506075*`);
  if (!func.isUrl(value)) return m.reply(global.mess.error.lv);
  let data = tiktok.v1(value)
  if (data.error) return m.reply(data.message);
  let audio = Buffer.from(fetch(data.music).arrayBuffer())
  m.reply(global.mess.wait)
  m.reply(new MessageMedia((fileTypeFromBuffer(audio)).mime, audio.toString("base64")));
}

export async function ytMp4Command(m, value, command, func, MessageMedia) {
  if (!value) return m.reply(`Penggunaan: *${prefix+command} https://youtu.be/cHfyes6e7HQ*`);
  if (!func.isUrl(value)) return m.reply(global.mess.error.lv);
  ytMp4(value).then(res => {
    m.reply(global.mess.wait)
    let video = Buffer.from(fetch(res.result).arrayBuffer())
    m.reply(new MessageMedia((fileTypeFromBuffer(video)).mime, video.toString("base64")), false, { caption: `*⭔Title :* ${res.title}\n*⭔Channel :* ${res.channel}\n*⭔Published :* ${res.uploadDate}\n*⭔View :* ${res.views}\n*⭔Description :* ${res.desc}` });
  }).catch(err => {
    console.log(err)
    m.reply(global.mess.error.api)
  })
}

export async function ytMp3Command(m, value, command, func, MessageMedia) {
  if (!value) return m.reply(`Penggunaan: *${prefix+command} https://youtu.be/cHfyes6e7HQ*`);
  if (!func.isUrl(value)) return m.reply(global.mess.error.lv);
  ytMp3(value).then(res => {
    m.reply(global.mess.wait)
    let audio = Buffer.from(fetch(res.result).arrayBuffer())
    m.reply(`*⭔Title :* ${res.title}\n*⭔Channel :* ${res.channel}\n*⭔Published :* ${res.uploadDate}\n*⭔View :* ${res.views}\n*⭔Description :* ${res.desc}\n\n_Sedang mengirim audio_\n_Mohon tunggu sebentar._`)
    m.reply(new MessageMedia((fileTypeFromBuffer(audio)).mime, audio.toString("base64")));
  }).catch(err => {
    console.log(err)
    m.reply(global.mess.error.api)
  })
}