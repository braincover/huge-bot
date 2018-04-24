const random = require('random-item');
const pickRandom = require('pick-random');
const flatten = require('lodash/flatten');

const weapons = [
  '大劍',
  '太刀',
  '單手劍',
  '雙劍',
  '大錘',
  '狩獵笛',
  '長槍',
  '銃槍',
  '斬擊斧',
  '充能斧',
  '操蟲棍',
  '弓',
  '輕弩槍',
  '重弩槍',
];

const mantles = [
  '隱身衣裝',
  '滑空衣裝',
  '盜掠衣裝',
  '體力衣裝',
  '耐雷衣裝',
  '耐水衣裝',
  '耐寒衣裝',
  '耐熱衣裝',
  '耐龍衣裝',
  '化合衣裝',
  '免疫衣裝',
  '強打衣裝',
  '挑釁衣裝',
  '迴避衣裝',
  '不動衣裝',
];
const boosters = [
  '療癒煙筒',
  '解除煙筒',
  '達人煙筒',
];
const tools = [].concat(
  mantles,
  boosters
);

const monsters0 = [
  '眩鳥',
  '搔鳥',
  '大兇顎龍',
  '大兇豺龍',
  '岩賊龍',
];
const monsters1 = [
  '毒妖鳥',
  '飛雷龍',
  '蠻顎龍',
  '泥魚龍',
  '雌火龍',
  '土砂龍',
  '骨鎚龍',
  '浮空龍',
];
const monsters2 = [
  '火龍',
  '蒼火龍',
  '角龍',
  '黑角龍',
  '爆鎚龍',
  '慘爪龍',
  '溶岩龍',
  '爆鱗龍',
  '櫻火龍',
  '風漂龍',
  '恐暴龍',
];
const monsters3 = [
  '滅盡龍',
  '炎王龍',
  '鋼龍',
  '屍套龍',
  '麒麟',
  // '熔山龍',
  // '冥燈龍',
];
const monsters = [
  monsters0,
  monsters1,
  monsters2,
  monsters3,
];

module.exports = {
  roulette(star) {
    let msg = '';

    ['一', '二', '三', '四'].forEach(num => {
      const weapon = random(weapons);
      const toolspair = pickRandom(tools, { count: 2 });
      msg += `${num}: ${weapon} (${toolspair[0]}, ${toolspair[1]})\n`;
    });

    if (star < 3) {
      const monster = random(flatten(monsters.slice(star + 1, 4)));
      msg += `\n目標: ${monster}`;
    } else {
      msg += '\n任務: 【超特殊許可】對女友坦白\n目標: 女友 (危險度9)';
    }
    return msg;
  },
};
