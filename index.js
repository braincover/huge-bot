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
      event.reply('巨什麼啦XD').then(function(data) {
        // success
      }).catch(function(error) {
        // error
      });
    }
  }
});

bot.listen('/', process.env.PORT || 8080, function() {
  var port = server.address().port;
  console.log("App now running on port", port);
});
