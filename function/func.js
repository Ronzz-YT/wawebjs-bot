const util = require('util');
const hr = require('human-readable');
const moment = require('moment');

function Formarter() {
  this.util = util.format
  this.size = formatSize
  this.date = function(fmt) {
    let date = new Date(((fmt + "000") * 1) + (1000 * 60 * 60 * 7))
    let YYYY = date.getFullYear()
    let MM = date.getMonth() + 1
    let DD = date.getDate()
    let hh = date.getHours()
    let mm = date.getMinutes()
    let ss = date.getSeconds()

    return [YYYY, MM, DD].map(v => ("" + v).padStart(2, "0")).join("-") + ", " + [hh, mm, ss].map(v => ("" + v).padStart(2, "0")).join(":")
  }
  this.money = function(n, opt = "IDR") {
    return n.toLocaleString("id", {
      style: "currency",
      currency: opt
    })
  },
  this.number = function(n) {
    return n.toLocaleString("id")
  }
  this.clock = function clockString(ms) {
    let h = isNaN(ms) ? '--' : Math.floor(ms % (3600 * 24) / 3600)
	let m = isNaN(ms) ? '--' : Math.floor(ms % 3600 / 60)
	let s = isNaN(ms) ? '--' : Math.floor(ms % 60)
	return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':')
  }
  this.FtoC = function(f) {
  if (f.endsWith("°F")) return "" + Math.ceil(((f.replace(/[^0-9]/g, "") * 1) - 32) * 5 / 9) + "°C"
    else return f
  }
  this.json = function(j) {
    return JSON.stringify(j, null, 2)
  }
  this.bytes = function(bytes) {
    const sizes = ["B", "KB", "MB", "GB", "TB"]
    if (bytes == 0 || isNaN(bytes * 1)) return "0 B"
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)))
    return (bytes / Math.pow(1024, i)) + " " + sizes[i]
  }
}

let formatSize = hr.sizeFormatter({
  std: 'JEDEC',
  decimalPlaces: 2,
  keepTrailingZeroes: false,
  render: (literal, symbol) => `${literal} ${symbol}B`
})

export async function parseMention(text = '') {
  return [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(v => v[1] + '@c.us')
}

export async function sendGroupMessage(anu, message, client) {
  const id = parseMention(message);
  try {
    const contact = await client.getContactById(id);
    await client.sendMessage(anu.id.remote, message, { mentions: [contact] });
  } catch (error) {
    console.log(error);
  }
}

export async function days() {
  let dnew = new Date(new Date + 3600000)
  return dnew.toLocaleDateString('id', { weekday: 'long' })
}

export async function date() {
  let d = new Date
  return d.toLocaleDateString('id', { day: 'numeric', month: 'long', year: 'numeric' })
}

export async function dateIslamic() {
  let dnew = new Date(new Date + 3600000)
  return Intl.DateTimeFormat('id' + '-TN-u-ca-islamic', { day: 'numeric', month: 'long', year: 'numeric' }).format(dnew)
}

export async function time(local = 'asia/jakarta') {
  return moment.tz(local).format('HH:mm:ss')
}

export async function isUrl(url) {
  return url.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/, 'gi'))
}

export const format = new Formarter()