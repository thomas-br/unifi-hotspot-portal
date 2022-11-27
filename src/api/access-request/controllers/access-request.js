'use strict';

/**
 * access-request controller
 */

const { createCoreController } = require('@strapi/strapi').factories;
const utils = require("@strapi/utils");


const { sanitize } = utils
const model = 'api::access-request.access-request'
module.exports = createCoreController(model,() => ({
    async findUUID(ctx) {
        const uuid = ctx.params.uuid || "0";
        let request = await strapi.query(model).findOne({ where: { uuid: uuid } })
        const schema = strapi.getModel(model)
        return sanitize.contentAPI.output(request, schema)
    },
    async new(ctx) {
        const { mac, site, name, ap} = ctx.request.body // TODO: validate
        let accessRequest = await strapi.service("api::telegram.telegram").requestAccess(mac, site, name, ap)
        const schema = strapi.getModel(model)
        return sanitize.contentAPI.output(accessRequest, schema)
    },
}));

// TODO: create default permissions for routes
