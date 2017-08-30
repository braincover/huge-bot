const linebot = require('linebot');
const airtable = require('airtable');
const mhxx = require('./mhxx');

var bot = linebot({
  channelId: process.env.ChannelId,
  channelSecret: process.env.ChannelSecret,
  channelAccessToken: process.env.ChannelAccessToken
});

bot.on('message', function(event) {
  if (event.message.type === 'text') {
    var msg = event.message.text;
    fetchRules(function(rules) {
      var matchedRule = matchRules(msg, rules);
      if (matchedRule) {
        var msgObj = {};
        msgObj.type = matchedRule.get('type');
        switch (msgObj.type) {
          case 'text':
            msgObj.text = matchedRule.get('text');
            break;
          case 'image':
            if (matchedRule.get('image')) {
              msgObj.originalContentUrl = matchedRule.get('image')[0].url;
              msgObj.previewImageUrl = matchedRule.get('image')[0].url;
            }
            break;
        }
        event.reply(msgObj);
      }
    });

    if (msg.toLowerCase() === '/roll') {
      event.reply({
        type: 'text',
        text: mhxx.roulette()
      });
    }
  }
});

bot.listen('/', process.env.PORT || 3000);

var rulesCache = [];
var lastQueryDate;
var fetchRules = function(callback) {
  var CACHE_TIME = 60 * 1000;
  var current = new Date;
  var flag = true;
  if (lastQueryDate) {
    flag = (current - lastQueryDate) > CACHE_TIME;
  }
  if (flag) {
    lastQueryDate = current;
    console.log('Query airtable', lastQueryDate);
    rulesCache = [];
    var base = airtable.base(process.env.AIRTABLE_BASE_ID);
    base('keyword').select({
      view: "Grid view"
    }).eachPage(function page(records, fetchNextPage) {
      rulesCache = rulesCache.concat(records);
      fetchNextPage();
    }, function done(err) {
      if (err) {
        console.error(err);
        return;
      }
      console.log('Get rules:', rulesCache.length);
      callback && callback(rulesCache);
    });
  } else {
    callback && callback(rulesCache);
  }
}

var matchRules = function(msg, rules) {
  var matchRule = rules.find(rule => {
    return msg.includes(rule.get('key'));
  });
  return matchRule;
}
