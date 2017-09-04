const linebot = require('linebot');
const airtable = require('airtable');
const mhxx = require('./mhxx');
const kanaconv = require('./kanaconv');

let rulesCache = [];
let lastQueryDate;

function fetchRules(callback) {
  const CACHE_TIME = 60 * 1000;
  const current = new Date();
  let flag = true;
  if (lastQueryDate) {
    flag = current - lastQueryDate > CACHE_TIME;
  }
  if (flag) {
    lastQueryDate = current;
    console.log('Query airtable', lastQueryDate);
    rulesCache = [];
    const base = airtable.base(process.env.AIRTABLE_BASE_ID);
    base('keyword')
      .select({
        view: 'Grid view',
      })
      .eachPage(
        (records, fetchNextPage) => {
          rulesCache = rulesCache.concat(records);
          fetchNextPage();
        },
        err => {
          if (err) {
            console.error(err);
            return;
          }
          console.log('Get rules:', rulesCache.length);
          if (callback) {
            callback(rulesCache);
          }
        }
      );
  } else if (callback) {
    callback(rulesCache);
  }
}

function matchRules(msg, rules) {
  const matchRule = rules.find(rule => msg.includes(rule.get('key')));
  return matchRule;
}

const bot = linebot({
  channelId: process.env.ChannelId,
  channelSecret: process.env.ChannelSecret,
  channelAccessToken: process.env.ChannelAccessToken,
});

bot.on('message', event => {
  if (event.message.type === 'text') {
    const msg = event.message.text;
    let flag = true;

    if (flag && msg.toLowerCase() === '/roll') {
      flag = false;
      event.reply(mhxx.roulette());
    }

    const convKey = '巨巨幫我翻譯';
    if (flag && msg.toLowerCase().startsWith(convKey)) {
      flag = false;
      const src = msg
        .substr(convKey.length)
        .replace(':', '')
        .replace('：', '')
        .trim();
      if (src) {
        kanaconv.toKana(src).then(event.reply).catch(error => {
          console.error('Kana Convert Failed!');
          console.error(error);
          event.reply('555..窩4ㄈㄨ窩ㄅ會');
        });
      }
    }

    if (flag) {
      fetchRules(rules => {
        const matchedRule = matchRules(msg, rules);
        if (matchedRule) {
          const msgObj = {};
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
            default:
              break;
          }
          event.reply(msgObj);
        }
      });
    }
  }
});

bot.listen('/', process.env.PORT || 3000);
