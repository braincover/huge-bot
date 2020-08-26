/* eslint no-console: 0 */

require('dotenv').config();

const { ConsoleBot, LineBot, LineHandler } = require('bottender');
const { createServer } = require('bottender/express');
const airtable = require('airtable');
const ua = require('universal-analytics');
const kuroshiro = require('kuroshiro');

const mhxx = require('./func/mhxx');
const mhw = require('./func/mhw');
const fifa = require('./func/fifa');

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

async function fetchRules() {
  const CACHE_TIME = 60 * 1000;
  const current = new Date();
  let shouldUpdate = true;
  if (lastQueryDate) {
    shouldUpdate = current - lastQueryDate > CACHE_TIME;
  }
  if (shouldUpdate) {
    lastQueryDate = current;
    console.log('Query airtable', lastQueryDate);

    const base = airtable.base(process.env.AIRTABLE_BASE_ID);
    base('keyword')
      .select({
        view: 'Grid view',
      })
      .all()
      .then(newRules => {
        rulesCache = newRules || rulesCache;
      });
  }
  return rulesCache;
}

function toASCII(chars) {
  let ascii = '';
  for (let i = 0; i < chars.length; i += 1) {
    let c = chars[i].charCodeAt(0);
    // make sure we only convert half-full width char
    if (c >= 0xff00 && c <= 0xffef) {
      /* eslint-disable no-bitwise */
      c = 0xff & (c + 0x20);
      /* eslint-enable no-bitwise */
    }
    ascii += String.fromCharCode(c);
  }
  return ascii;
}

function matchRules(msg, rules) {
  const matchRule = rules.find(rule => {
    let text = msg.replace(/(?:https?):\/\/[\S]+/g, '');
    let key = rule.get('key');
    if (rule.get('insensitive')) {
      text = toASCII(text)
        .toLowerCase()
        .replace(/[()\s]/g, '');
      key = key.toLowerCase();
    }
    return text.includes(key);
  });
  return matchRule;
}

const rollWHandler = async (context, match) => {
  let star = -1;
  const cap = match[1];
  if (cap) {
    star = parseInt(cap, 10);
  }
  visitor.event('狩獵輪盤', 'MHW', star).send();
  await context.replyText(mhw.roulette(star));
};

const rollXXHandler = async context => {
  visitor.event('狩獵輪盤', 'MHXX').send();
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
      `${context.session.user.displayName}你的翻譯是：\n${result}`
    );
  }
};

const howHandler = async (context, match) => {
  const device = match[1].trim();
  visitor.event('組合回應', '設計失敗', device).send();
  const str = `${device}絕對不是設計失敗 是設計的太前衛了 一堆功能當時的用戶用不到才失敗\n\n${device}放到今天絕對大賣`;
  await context.replyText(str);
};

const fifaHandler = async (context, match) => {
  const cmd = match[1].trim().toLowerCase();
  let result = '';
  let cmdValid = true;
  switch (cmd) {
    case 'help': {
      const cmds = [
        '⚽ current 顯示當前賽況',
        '⚽ today 顯示今天的比賽時間',
        '⚽ tomorrow 顯示明天的比賽時間',
        '⚽ last [team] 顯示(指定球隊)上一場比賽結果',
        '⚽ next [team] 顯示(指定球隊)下一場比賽時間',
        '⚽ group <letter> 顯示小組賽況',
        '⚽ team [team] 顯示(指定)球隊資訊',
      ];
      result = cmds.join('\n');
      break;
    }
    case 'today': {
      result = await fifa.todayMatches();
      break;
    }
    case 'tomorrow': {
      result = await fifa.tomorrowMatches();
      break;
    }
    case 'current': {
      result = await fifa.currentMatch();
      break;
    }
    case 'last': {
      let code = '';
      if (match[2] !== undefined) {
        code = match[2].trim();
      }
      result = await fifa.lastMatch(code);
      break;
    }
    case 'team': {
      if (match[2] !== undefined) {
        const code = match[2].trim();
        result = await fifa.teamStatus(code);
      } else {
        result = await fifa.teamsStatus();
      }
      break;
    }
    case 'next': {
      let code = '';
      if (match[2] !== undefined) {
        code = match[2].trim();
      }
      result = await fifa.nextMatch(code);
      break;
    }
    case 'group': {
      let code = '';
      if (match[2] !== undefined) {
        code = match[2].trim();
      }
      result = await fifa.groupStatus(code);
      break;
    }
    default: {
      cmdValid = false;
      break;
    }
  }
  if (cmdValid) {
    visitor.event('FIFA', cmd).send();
    await context.replyText(result);
  } else {
    await context.replyText('kóng siánn-siâu');
  }
};

const keywordHandler = async context => {
  const rules = await fetchRules();

  const matchedRule = matchRules(context.event.text, rules);
  if (matchedRule) {
    visitor.event('關鍵字回應', matchedRule.get('key')).send();
    const type = matchedRule.get('type');
    switch (type) {
      case 'text': {
        const text = matchedRule.get('text').replace(/\\n/g, '\n');
        await context.replyText(text);
        break;
      }
      case 'image': {
        if (matchedRule.get('image')) {
          await context.replyImage(matchedRule.get('image')[0].url);
        }
        break;
      }
      case 'bubble': {
        if (matchedRule.get('image')) {
          const bubbleImage = matchedRule.get('image')[0].thumbnails.large;
          await context.replyFlex(matchedRule.get('key'), {
            type: 'bubble',
            hero: {
              type: 'image',
              url: bubbleImage.url,
              size: 'full',
              aspectRatio: `${bubbleImage.width}:${bubbleImage.height}`,
            },
          });
        }
        break;
      }
      default: {
        break;
      }
    }
  } else if (context.event.text === context.state.lastMessage) {
    if (!context.state.isFollowing) {
      if (context.session.user.id !== context.state.lastSpeakerID) {
        if (context.event.text !== '(emoji)') {
          context.setState({ isFollowing: true });
          visitor.event('跟風推齊', context.event.text).send();
          await context.replyText(context.event.text);
        }
      }
    }
  } else {
    context.setState({ isFollowing: false });
  }
  context.setState({
    lastMessage: context.event.text,
    lastSpeakerID: context.session.user.id,
  });
};

const handler = new LineHandler()
  .onText(/^\/roll(?: >(\d))?$/i, rollWHandler)
  .onText(/^\/roll -xx$/i, rollXXHandler)
  .onText(/^巨巨幫我翻譯[:|：]?\s*(.*)/, translationHandler)
  .onText(/巨巨覺得(.*)怎麼樣/, howHandler)
  .onText(
    /^(?:\(soccer ball\)|\(足球\)|⚽)\s*(\w+)(?:\s?(\w+))?$/i,
    fifaHandler
  )
  .onText(keywordHandler);

const useConsole = process.env.USE_CONSOLE === 'true';

if (useConsole) {
  const bot = new ConsoleBot({ fallbackMethods: true });

  bot.onEvent(handler);

  bot.createRuntime();
} else {
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
}
