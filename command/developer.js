let path = require('path')
let fs = require('fs')
let discord = require('discord.js')

let developerInfoPath = path.resolve('save', 'developerInfo.json')
let methods = {}

methods.showdeveloperInfo = function(msg) {
    if (!fs.existsSync(developerInfoPath)) {
        fs.writeFileSync(developerInfoPath, '')
    }

    let developerInfo = JSON.parse(fs.readFileSync(developerInfoPath, 'utf8'))
    let embed = new discord.RichEmbed()

    const info = embed
        .setTitle(developerInfo.title)
        .setURL(developerInfo.url)
        .setThumbnail(developerInfo.thumbnail)
        .setDescription(developerInfo.description)
        .setImage(developerInfo.image)
        .setFooter(developerInfo.footer)
        
    msg.channel.send(info)
}

module.exports = methods