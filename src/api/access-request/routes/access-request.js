'use strict';

/**
 * access-request router
 */

module.exports = {
    routes: [
      { 
        method: 'POST',
        path: '/access-request', 
        handler: 'access-request.new',
        config: {
          auth: false,
        }
      },
      { 
        method: 'GET',
        path: '/access-request/:uuid',
        handler: 'access-request.findUUID',
        config: {
          auth: false,
        }
      }
    ]
  }
