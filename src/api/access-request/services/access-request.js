'use strict';

/**
 * access-request service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::access-request.access-request');
