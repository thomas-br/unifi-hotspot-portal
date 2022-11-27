'use strict';
const Unifi = require('node-unifi');

module.exports = ({ strapi }) => ({
  async authorize(site, mac, minutes, ap) {
    const {host, port, sslVerify, user, password} = strapi.config.unifi;
    const unifi = new Unifi.Controller({host, port, sslverify: Boolean(sslVerify), site: site});
    await unifi.login(user, password)
    await unifi.authorizeGuest(mac, minutes, null, null, null, ap)
  }
});
