module.exports = ({ env }) => ({
  host: env('UNIFI_HOST', '127.0.0.1'),
  port: env('UNIFI_PORT', '8443'),
  sslVerify: env('UNIFI_USE_SSL', 'true'),
  user: env('UNIFI_USER', 'admin'),
  password: env('UNIFI_PASSWORD', 'admin'),
});
