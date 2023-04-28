const fs = require('fs');
const chalk = require('chalk');

//Others
global.botname = "VelzzyBotz"
global.own = ["628817839722","628815739965","6281585933017"] //Ganti agar fitur owner bisa di gunakan
global.ownname = "Ronzz YT" //Nama lu
global.ownnomer = "628817839722" //Nomor lu
global.packname = "© VelzzyBotz" //Sticker packname ubah
global.author = "di buat oleh Ronzz YT" //Sticker author ubah
global.footer = "VelzzyBotz © 2023" //Footer ubah

//Message
global.prefa = ["","."]
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

let file = require.resolve(__filename)
fs.watchFile(file, () => {
	fs.unwatchFile(file)
	console.log(chalk.redBright(`Update '${__filename}'`))
	delete require.cache[file]
	require(file)
})