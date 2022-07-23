/* eslint no-console: 0 */

require('dotenv').config();

const { router, text: onText } = require('bottender/router');

const ua = require('universal-analytics');

const keyword = require('./func/keyword');
const mhxx = require('./func/mhxx');
const mhw = require('./func/mhw');
const mhr = require('./func/mhr');
const mhrs = require('./func/mhrs');
const fifa = require('./func/fifa');

const visitor = ua('UA-105745910-1', { https: true });

const rollRSHandler = async (context, match) => {
  let quest = false;
  let anomaly = false;
  const tags = match.match[1];
  if (tags) {
    quest = tags.includes('q');
    anomaly = tags.includes('a');
  }
  visitor.event('狩獵輪盤', 'MHRS', tags).send();
  const msg = await mhrs.roulette(quest, anomaly);
  await context.replyText(msg);
};

const rollRHandler = async (context, match) => {
  let verbose = false;
  let quest = false;
  const tags = match.match[1];
  if (tags) {
    verbose = tags.includes('v');
    quest = tags.includes('q');
  }
  visitor.event('狩獵輪盤', 'MHR', tags).send();
  const msg = await mhr.roulette(verbose, quest);
  await context.replyText(msg);
};

const rollWHandler = async (context, match) => {
  let star = -1;
  const cap = match.match[1];
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
  const matchedRule = keyword.matchRules(context.event.text);
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
          await context.replyImage({
            originalContentUrl: matchedRule.get('image')[0].url,
          });
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

module.exports = function App() {
  return router([
    onText(/^\/roll(?: -([aq]+))?$/i, rollRSHandler),
    onText(/^\/roll -r(?: -([vq]+))?$/i, rollRHandler),
    onText(/^\/roll -w(?: >(\d))?$/i, rollWHandler),
    onText(/^\/roll -xx$/i, rollXXHandler),
    onText(/巨巨覺得(.*)怎麼樣/, howHandler),
    onText(
      /^(?:\(soccer ball\)|\(足球\)|⚽)\s*(\w+)(?:\s?(\w+))?$/i,
      fifaHandler
    ),
    onText('*', keywordHandler),
  ]);
};
