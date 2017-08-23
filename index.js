var linebot = require('linebot');
var express = require('express');

var bot = linebot({
  channelId: "1531659118",
  channelSecret: "efd14fdc4d2bfe22f9f0521da2aea307",
  channelAccessToken: "H2OvBuHCB8TSlID9ZC1jBxffmMVxdVAvuo36DC7KJzJkYffDtSXOGoljD9lx4YLo3PC5nJ5Wq9Q3fd87aDe2/k6eYtk6s6CkmzO8SdvvUysWg0okNoALACNjDehlqj0ltJwU00V9ha8isEBk47HFswdB04t89/1O/w1cDnyilFU="
});

bot.on('message', function(event) {
  if (event.message.type = 'text') {
    var msg = event.message.text;
    if (msg.includes('巨')) {
      event.reply('巨什麼啦XD').then(function(data) {
        console.log(msg);
      }).catch(function(error) {
        console.log('error');
      });
    }
  }
});

const app = express();
const linebotParser = bot.parser();
app.post('/', linebotParser);

//因為 express 預設走 port 3000，而 heroku 上預設卻不是，要透過下列程式轉換
var server = app.listen(process.env.PORT || 8080, function() {
  var port = server.address().port;
  console.log("App now running on port", port);
});
