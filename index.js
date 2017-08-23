var linebot = require('linebot');
var express = require('express');

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

const app = express();
const linebotParser = bot.parser();
app.post('/linewebhook', linebotParser);

//因為 express 預設走 port 3000，而 heroku 上預設卻不是，要透過下列程式轉換
var server = app.listen(process.env.PORT || 8080, function() {
  var port = server.address().port;
  console.log("App now running on port", port);
});
