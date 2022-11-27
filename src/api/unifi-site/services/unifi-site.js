'use strict';

/**
 * unifi-site service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::unifi-site.unifi-site');
