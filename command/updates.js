require('dotenv').config()

let cloudscraper = require('cloudscraper')
let $ = require('cheerio')

let CronJob = require('cron').CronJob
let methods = {}
let botClient = null
let firebase = null

let cron = new CronJob('*/5 * * * *', doScraping, null, false, 'UTC')

const MANGADEX_URL = 'https://mangadex.org/title/31477/solo-leveling'

const DB_SERVER = 'server/'
const DB_MANGA = 'manga/'

methods.registerChannel = function(client, msg, fb) {
    botClient = client
    firebase = fb

    firebase.database().ref(DB_SERVER + msg.guild.id).once('value').then(function(snapshot) {
        if (!snapshot.val()) {
            firebase.database().ref(DB_SERVER + msg.guild.id).set({
                server_name: msg.guild.name,
                channel_id: msg.channel.id,
                channel_name: msg.channel.name
            })
            msg.channel.send('Got it!')
        } else {
            msg.channel.send(':)')
        }
    })

    cron.start()
}

methods.unregisterChannel = function(client, msg, fb) {
    botClient = client
    firebase = fb

    firebase.database().ref(DB_SERVER + msg.guild.id).remove().then(function() {
        msg.channel.send('It\'s been a good run! I\'ll miss you!')
    })
}

methods.rerunCron = function(client, msg, fb) {
    botClient = client
    firebase = fb

    msg.channel.send('I\'m up and running!')
    cron.start()
}

function doScraping() {
   let mangaChapterOptions = {
        method: 'GET',
        //headers: { 'Cookie': process.env.COOKIE, 'User-Agent': process.env.USER_AGENT },
        url: MANGADEX_URL
    }

    cloudscraper(mangaChapterOptions)
        .then(function(html) {
            let items = []

            $('div[data-lang=1]', html).each(function(i, elem) {
                items[i] = $(this).data()
            })

            let latestChapter = 0
            items.forEach(function(item) {
                if (item.chapter > latestChapter) {
                    latestChapter = item
                }
            })

            handleMangaChapterResult(latestChapter)
        })
        .catch(function(err) {
            sendLog(err)
        })
    
}

function handleMangaChapterResult(latestChapter) {
    let newKey = Number.isInteger(latestChapter.chapter) ? latestChapter.chapter : `Extra ${latestChapter.volume}`
    firebase.database().ref(DB_MANGA + newKey).once('value').then(function(snapshot) {
        if (!snapshot.val()) {
            firebase.database().ref(DB_MANGA + newKey).set({
                title: latestChapter.title,
                chapter: latestChapter.chapter,
                volume: latestChapter.volume,
                lang: latestChapter.lang,
                group: latestChapter.group,
                uploader: latestChapter.uploader,
                timestamp: latestChapter.timestamp,
                mangaId: latestChapter.mangaId,
                id: latestChapter.id
            })
            sendLog('New chapter: Chapter ' + latestChapter.chapter)
            
            firebase.database().ref(DB_SERVER).once('value').then(function(snapshot) {
                let result = snapshot.val()
                for (key in result) {
                    try {
                        let subscribedChannel = botClient.channels.get(result[key].channel_id)
                        subscribedChannel.send('New chapter of the best manga in the world is out!' + 
                            '\nRead Chapter ' + latestChapter.chapter +' here: ' + 
                            'https://mangadex.org/chapter/' + latestChapter.id + '/1')
                    } catch (ex) {
                        sendLog(ex)
                    }
                }
            }).catch(function(err) {
                sendLog(err)
            })
        } else {
            sendLog('Still chapter ' + latestChapter.chapter)
        }
    }).catch(function(err) {
        sendLog(err)
    })
}

function sendLog(content) {
    console.log(content)
    botClient.channels.get(process.env.LOG_CHANNEL).send(content)
}

module.exports = methods