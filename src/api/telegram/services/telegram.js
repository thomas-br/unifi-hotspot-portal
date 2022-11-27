'use strict';
const TelegramBot = require('node-telegram-bot-api')
const { v4: uuid } = require('uuid')
const utils = require("@strapi/utils")
const { ApplicationError } = utils.errors

const siteModel = 'api::unifi-site.unifi-site'
const approverModel = 'api::approver.approver'
const accessRequestModel = 'api::access-request.access-request'
let bot

module.exports = ({ strapi }) => ({
  connect() {
    const { token } = strapi.config.telegram;
    bot = new TelegramBot(token, {
      polling: true
    })
    enableRegistration()
    enableCallbacks()
  },
  async requestAccess(mac, site, name, ap) {
    let sites = await strapi.entityService.findMany(siteModel, { filters: { unifi_id: site }, populate: { approvers: true }})
    if(sites.length > 0) {
      let site = sites[0]
      let accessRequest = await strapi.entityService.create(accessRequestModel, { data: { uuid: uuid(), mac: mac, ap: ap, unifi_id: site.unifi_id} })
      site.approvers.forEach(approver => {
        bot.sendMessage(approver.chat_id, `${name} möchte Zugriff auf das WLAN`, getChoices(accessRequest.uuid))
      })
      return accessRequest
    }
    throw new ApplicationError("Site kann nicht gefunden werden")
  }
});

const enableRegistration = () => {
  bot.onText(/\/register ([a-zA-Z0-9]{1,20}) ([[a-zA-Z0-9_\!]{5,30})/, async (msg, match) => {
    let matchingSites = await strapi.entityService.findMany(siteModel, { filters: { name: match[1] } })
    if(matchingSites.length === 0) {
      bot.sendMessage(msg.chat.id, "Sorry, da gab es einen Fehler")
      return
    }
    let site = matchingSites[0]
    let passwordCorrect = await strapi.service("admin::auth").validatePassword(match[2], site.registration_password)
    if(!passwordCorrect) {
      bot.sendMessage(msg.chat.id, "Sorry, das hat nicht geklappt")
      return
    }

    let existingApprovers = await strapi.entityService.findMany(approverModel, { filters: { unifi_site: site.id, chat_id: msg.chat.id }})
    if(existingApprovers.length === 0) {
      await strapi.entityService.create(approverModel, { unifi_site: site.id, chat_id: msg.chat.id })
      bot.sendMessage(msg.chat.id, "Jo, alles ist geregelt. Es kann losgehen.")
    } else {
      bot.sendMessage(msg.chat.id, "Hey, du warst schon registriert. Also alles bestens.")
    }
  })
}

const enableCallbacks = () => {
  bot.on('callback_query', async (callbackQuery) => {
    const message = callbackQuery.message;
    const data = JSON.parse(callbackQuery.data)

    let accessRequests = await strapi.entityService.findMany(accessRequestModel, { filters: { uuid: data.uuid } })

    if(accessRequests.length === 0) {
      // no matching access request found
      return
    }

    let accessRequest = accessRequests[0]
    
    if(data.t === -1) {
        bot.sendMessage(message.chat.id, "Zugriff abgelehnt")
        let matchingSites = await strapi.entityService.findMany(siteModel, { filters: { unifi_id: data.s }})
        if(matchingSites.length > 0) {
          accessRequest.status = "declined"
          accessRequest.status = matchingSites[0].decline_message
          await strapi.entityService.update(accessRequestModel, accessRequest.id, { data: accessRequest })
        }
        return
    }
    try {
      await strapi.service("api::unifi.unifi").authorize(accessRequest.unifi_id, accessRequest.mac, data.t, accessRequest.ap)
      accessRequest.status = "success"
      await strapi.entityService.update(accessRequestModel, accessRequest.id, { data: accessRequest })
      bot.sendMessage(message.chat.id, "Zugriff gestattet")
    } catch (error) {
      bot.sendMessage(message.chat.id, `Fehler beim Autorisieren: ${JSON.stringify(error)}`)
    }
})

}

// TODO: guests query, message change

const getChoices = (uuid) => {
  const opts = {
      reply_markup: {
        inline_keyboard: [
              [
                {
                    text: "48h",
                    callback_data: JSON.stringify({t: 2880, uuid: uuid})
                },
                {
                    text: "1w",
                    callback_data: JSON.stringify({t: 10080, uuid: uuid})
                },
                {
                  text: "1y",
                  callback_data: JSON.stringify({t: 525600, uuid: uuid})
                },
                {
                    text: "FU",
                    callback_data: JSON.stringify({t: -1, uuid: uuid})
                }
              ]
          ]
      }
  }
  return opts
};
