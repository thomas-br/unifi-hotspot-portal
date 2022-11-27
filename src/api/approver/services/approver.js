'use strict';

/**
 * approver service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::approver.approver');
