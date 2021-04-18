// mhw.js

const random = require('random-item');
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
  '轉身衣裝',
  '刺客衣裝',
];
const boosters = ['療癒煙筒', '解除煙筒', '達人煙筒'];
const tools = [].concat(mantles, boosters);

const monsters0 = ['眩鳥', '搔鳥', '大兇顎龍', '大兇豺龍', '岩賊龍'];
const monsters1 = [
  '毒妖鳥',
  '飛雷龍',
  '蠻顎龍',
  '泥魚龍',
  '雌火龍',
  '土砂龍',
  '骨鎚龍',
  '浮空龍',
  '冰魚龍',
  '猛牛龍',
  '痺毒龍',
  '浮眠龍',
  '水妖鳥',
  '雷顎龍',
];
const monsters2 = [
  '火龍',
  '蒼火龍',
  '角龍',
  '黑角龍',
  '爆鎚龍',
  '慘爪龍',
  '溶岩龍',
  '櫻火龍',
  '風漂龍',
  '冰牙龍',
  '迅龍',
  '斬龍',
  '轟龍',
  '碎龍',
  '霜翼風漂龍',
  '硫斬龍',
  '兇爪龍',
  '雷狼龍',
  '黑狼鳥',
  // '戰痕黑狼鳥',
  '黑轟龍',
];
const monsters3 = [
  '殲世滅盡龍',
  '炎王龍',
  '鋼龍',
  '霧瘴屍套龍',
  '麒麟',
  '炎妃龍',
  '貝希摩斯',
  '冰呪龍',
  '溟波龍',
  '紅蓮爆鱗龍',
  '惶怒恐暴龍',
  '金火龍',
  '銀火龍',
  '金獅子',
  // '熔山龍',
  // '冥燈龍',
  // '天地煌啼龍',
];
const monsters = [monsters0, monsters1, monsters2, monsters3];

module.exports = {
  roulette(star) {
    let msg = '';

    ['一', '二', '三', '四'].forEach(num => {
      const weapon = random(weapons);
      const toolspair = random.multiple(tools, 2);
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
