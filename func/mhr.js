// mhr.js

const airtable = require('airtable');
const random = require('random-item');

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
  '輕弩槍',
  '重弩槍',
  '弓',
];

let questsCache = [];
let lastQueryDate;
function fetchQuest() {
  const CACHE_TIME = 60 * 1000;
  const current = new Date();
  let shouldUpdate = true;
  if (lastQueryDate) {
    shouldUpdate = current - lastQueryDate > CACHE_TIME;
  }
  if (shouldUpdate) {
    lastQueryDate = current;

    const base = airtable.base(process.env.AIRTABLE_MHR_BASE_ID);
    base('High Rank Quest')
      .select({
        view: 'Grid view',
      })
      .all()
      .then(newQuests => {
        questsCache = newQuests || questsCache;
      });
  }
}

module.exports = {
  roulette() {
    fetchQuest();
    let msg = '';
    ['一', '二', '三', '四'].forEach(num => {
      const weapon = random(weapons);
      const buddy = random(['貓', '狗']);
      const skill1 = random(['1', '2']);
      const skill2 = random(['1', '2']);
      const skill3 = random(['1', '2']);
      msg += `${num}: ${weapon} (${buddy}/${skill1}/${skill2}/${skill3})\n`;
    });

    if (Array.isArray(questsCache) && questsCache.length === 0) {
      msg += `\n任務: 讀取中...請稍後再試`;
    } else {
      const quest = random(questsCache);
      msg += `\n任務: ${quest.get('Name')}\n目標: ${quest.get('Objective')}`;
    }
    return msg;
  },
};
