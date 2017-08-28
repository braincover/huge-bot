const linebot = require('linebot');
const fs = require('fs');
const parseCsv = require('csv-parse/lib/sync');

var bot = linebot({
  channelId: process.env.ChannelId,
  channelSecret: process.env.ChannelSecret,
  channelAccessToken: process.env.ChannelAccessToken
});

const file = fs.readFileSync('./rule.csv', 'utf8');
const rules = parseCsv(file, { columns: true });

bot.on('message', function(event) {
  if (event.message.type === 'text') {
    var msg = event.message.text;
    var matchRule = rules.find(rule => {
      return msg.includes(rule.key);
    });
    if (matchRule) {
      var msgObj = {};
      msgObj.type = matchRule.type;
      switch(matchRule.type) {
        case 'text':
          msgObj.text = matchRule.text;
          break;
        case 'image':
          msgObj.originalContentUrl = matchRule.image;
          msgObj.previewImageUrl = matchRule.image;
          break;
      }
      event.reply(msgObj);
    }
  }
});

bot.listen('/', process.env.PORT || 3000);
