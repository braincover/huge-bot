var linebot = require('linebot');

var bot = linebot({
  channelId: process.env.ChannelId,
  channelSecret: process.env.ChannelSecret,
  channelAccessToken: process.env.ChannelAccessToken
});

bot.on('message', function(event) {
  if (event.message.type == 'text') {
    var msg = event.message.text;
    if (msg.includes('巨')) {
      event.reply('巨什麼啦XD');
    }
    if (msg.includes('買NS')) {
      event.reply([
        {
          type: 'text',
          text: '再買任天堂主機就剁gg'
        },
        {
          type: 'image',
          originalContentUrl: 'http://i.imgur.com/h3V74bK.jpg',
          previewImageUrl: 'http://i.imgur.com/h3V74bK.jpg'
      }
      ]);
    }
  }
});

bot.listen('/', process.env.PORT || 8080);
