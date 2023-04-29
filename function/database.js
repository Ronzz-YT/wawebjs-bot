import fs from 'fs';

export const databased = async () => {
  if (!fs.existsSync(`./options/database.json`)) return ({})
  const json = JSON.parse(fs.readFileSync(`./options/database.json`, 'utf-8'))
  return json
}

export const dbsaver = async data => {
  const database = data ? data : global.db
  fs.writeFileSync(`./options/database.json`, JSON.stringify(database, null, 3))
}

export const connect = async () => {
  let content = await databased()
  if (!content || Object.keys(content).length === 0) {
    global.db = {
      users: {},
      groups: {},
      setting: {},
      other: {}
    }
    await dbsaver()
  } else {
    global.db = content
  }
}


