/* eslint no-console: 0 */

const { LineBot, LineHandler } = require('bottender');
const { createServer } = require('bottender/express');
const airtable = require('airtable');
const ua = require('universal-analytics');
const kuroshiro = require('kuroshiro');
const thenify = require('thenify');

const mhxx = require('./mhxx');

kuroshiro.init(err => {
  if (err) {
    console.log(`kuroshiro init failed: ${err}`);
  } else {
    console.log('kuroshiro init successed.');
  }
});

const visitor = ua('UA-105745910-1', { https: true });

let rulesCache = [];
let lastQueryDate;

// eslint-disable-next-line no-underscore-dangle
function _fetchRules(callback) {
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
            callback(null, rulesCache);
          }
        }
      );
  } else if (callback) {
    callback(null, rulesCache);
  }
}

const fetchRules = thenify(_fetchRules);

function matchRules(msg, rules) {
  const matchRule = rules.find(rule => msg.includes(rule.get('key')));
  return matchRule;
}

const rollHandler = async context => {
  visitor.event('狩獵輪盤', '狩獵輪盤').send();
  await context.replyText(mhxx.roulette());
};

const translationHandler = async (context, match) => {
  const src = match[1].trim();

  if (src) {
    visitor.event('假名翻譯', '假名翻譯', src).send();
    const result = kuroshiro.convert(src, {
      mode: 'okurigana',
      delimiter_start: ' ',
      delimiter_end: '\n',
    });
    await context.replyText(
      `${context.session.user.displayName}你的翻譯是：${result}`
    );
  }
};

const howHandler = async (context, match) => {
  const device = match[1].trim();
  visitor.event('組合回應', '設計失敗', device).send();
  const str = `${device}絕對不是設計失敗 是設計的太前衛了 一堆功能當時的用戶用不到才失敗\n\n${device}放到今天絕對大賣`;
  await context.replyText(str);
};

const keywordHandler = async context => {
  const rules = await fetchRules();

  const matchedRule = matchRules(context.event.text, rules);
  if (matchedRule) {
    visitor.event('關鍵字回應', matchedRule.get('key')).send();
    const msgObj = {};
    msgObj.type = matchedRule.get('type');
    switch (msgObj.type) {
      case 'text':
        await context.replyText(matchedRule.get('text'));
        break;
      case 'image':
        if (matchedRule.get('image')) {
          await context.replyImage(matchedRule.get('image')[0].url);
        }
        break;
      default:
        break;
    }
  }
};

const handler = new LineHandler()
  .onText(/^\/roll$/i, rollHandler)
  .onText(/^巨巨幫我翻譯[:|：]?\s*(.*)/, translationHandler)
  .onText(/巨巨覺得(.*)怎麼樣/, howHandler)
  .onText(keywordHandler);

const bot = new LineBot({
  channelSecret: process.env.ChannelSecret,
  accessToken: process.env.ChannelAccessToken,
});

bot.onEvent(handler);

const server = createServer(bot);
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`server is running on ${PORT}...`);
});
