// bottender.config.js
module.exports = {
  channels: {
    line: {
      enabled: true,
      path: '/webhooks/line',
      accessToken: process.env.ChannelAccessToken,
      channelSecret: process.env.ChannelSecret,
    },
  },
};
