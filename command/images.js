let path = require('path')
let fs = require('fs')
let Jimp = require('jimp')

let methods = {}

let mikusayImg = path.resolve('res', 'mikusay.jpg')
let chihayaFont = path.resolve('res', 'chihaya.fnt')

const LETTER_PER_LINE = 10
const MAX_LETTER = 30

const CANVAS_WIDTH = 380
const CANVAS_HEIGHT = 290
const CANVAS_ROTATE = 17

const CANVAS_X = 170
const CANVAS_Y = 650

let lastProcessTime

let destImg = path.resolve('res', 'mikusaycopy.jpg')

let claimHugImg = path.resolve('res', 'claimhug.jpg')
let destHugImg = path.resolve('res', 'claimhugcopy.jpg')

const HUG_CANVAS_WIDTHPERCHAR = 70
const HUG_CANVAS_HEIGHT = 180
const HUG_CANVAS_X = 0
const HUG_CANVAS_Y = 300

let lastHugTime

methods.mikuSay = function(msg) {
    if (lastProcessTime != null && new Date().getTime() - lastProcessTime.getTime() < 3000) {
        msg.channel.send('Please don\'t rush Miku. Miku is the slowest of the quints.')
        lastProcessTime = new Date()
        return
    }
    
    lastProcessTime = new Date()    

    if (msg.content.substring(11).length > MAX_LETTER) {
        msg.channel.send('Miku is too tired writing for that long.')
        return
    }

    if (msg.content.substring(11).trim() == '') {
        msg.channel.send('Miku is confused.')
        return
    }

    msg.channel.startTyping()
    Jimp.read(mikusayImg)
        .then(miku => (
            Jimp.loadFont(chihayaFont).then(font => ([miku, font]))
        ))
        .then(async function(data) {
            miku = data[0]
            font = data[1]

            let splitWord =  msg.content.substring(11).split(' ')
            let printStr = ''
            splitWord.forEach(function(item) {
                let tempItem = ''
                if (item.length / LETTER_PER_LINE > 0) {
                    let counter = item.length / LETTER_PER_LINE
                    
                    for (let i = 0; i < counter; i++) {
                        tempItem += item.substring(i * LETTER_PER_LINE, (i + 1) * LETTER_PER_LINE) + ' '
                    }
                } else {
                    tempItem = item
                }

                printStr += tempItem + ' '
            })            

            let fontCanvas = await Jimp.create(CANVAS_WIDTH, CANVAS_HEIGHT)
            fontCanvas.print(font, 0, 0, {
                text: printStr,
                alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
                alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
            }, CANVAS_WIDTH, CANVAS_HEIGHT).rotate(CANVAS_ROTATE)

            return miku.blit(fontCanvas, CANVAS_X, CANVAS_Y)
        })
        .then(async function(miku) {
            await miku.quality(100).write(destImg)
        })
        .then(() => {
            msg.channel.send({
                files: [{
                    attachment: destImg,
                    name: 'mikusaycopy.jpg'
                }]
            })
            .then(() => {
                msg.channel.stopTyping()
            })
            .catch(err => {
                msg.channel.stopTyping()
                msg.channel.send('Miku doesn\'t understand what\'s wrong.')
                console.log(err)
            })
        })
        .catch(err => {
            msg.channel.stopTyping()
            msg.channel.send('Miku doesn\'t understand what\'s wrong.')
            console.log(err)
        })
}

methods.claimHug = function(msg) {
    if (lastHugTime != null && new Date().getTime() - lastHugTime.getTime() < 15000) {
        msg.channel.send('Please don\'t rush Miku. Miku is the slowest of the quints.')
        lastHugTime = new Date()
        return
    }
    
    lastHugTime = new Date()

    msg.channel.startTyping()
    Jimp.read(claimHugImg)
        .then(miku => (
            Jimp.loadFont(Jimp.FONT_SANS_128_WHITE).then(font => ([miku, font]))
        ))
        .then(async function(data) {
            miku = data[0]
            font = data[1]

            let fontCanvas = await Jimp.create(msg.author.username.length * HUG_CANVAS_WIDTHPERCHAR, 
                HUG_CANVAS_HEIGHT, 'black')
            fontCanvas.print(font, 0, 0, {
                text: msg.author.username,
                alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
                alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
            }, msg.author.username.length * HUG_CANVAS_WIDTHPERCHAR, HUG_CANVAS_HEIGHT)

            return miku.blit(fontCanvas, HUG_CANVAS_X, HUG_CANVAS_Y)
        })
        .then(async function(miku) {
            await miku.quality(100).write(destHugImg)
        })
        .then(() => {
            msg.channel.send({
                files: [{
                    attachment: destHugImg,
                    name: 'claimhugcopy.jpg'
                }]
            })
            .then(() => {
                msg.channel.stopTyping()
            })
            .catch(err => {
                msg.channel.stopTyping()
                msg.channel.send('Miku doesn\'t understand what\'s wrong.')
                console.log(err)
            })
        })
        .catch(err => {
            msg.channel.stopTyping()
            msg.channel.send('Miku doesn\'t understand what\'s wrong.')
            console.log(err)
        })
}

module.exports = methods