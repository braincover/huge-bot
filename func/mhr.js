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
async function fetchQuest() {
  const CACHE_TIME = 60 * 1000;
  const current = new Date();
  let shouldUpdate = true;
  if (lastQueryDate) {
    shouldUpdate = current - lastQueryDate > CACHE_TIME;
  }
  const base = airtable.base(process.env.AIRTABLE_MHR_BASE_ID);
  if (shouldUpdate) {
    const newQuests = await base('High Rank Quest')
      .select({
        view: 'Grid view',
      })
      .all();
    questsCache = newQuests || questsCache;
    lastQueryDate = current;
    return questsCache;
  } else {
    base('High Rank Quest')
      .select({
        view: 'Grid view',
      })
      .all()
      .then(newQuests => {
        questsCache = newQuests || questsCache;
      });
    return questsCache;
  }
}

module.exports = {
  async roulette() {
    let msg = '';
    ['一', '二', '三', '四'].forEach(num => {
      const weapon = random(weapons);
      const buddy = random(['貓', '狗']);
      const skill1 = random(['1', '2']);
      const skill2 = random(['1', '2']);
      const skill3 = random(['1', '2']);
      msg += `${num}: ${weapon} (${buddy}/${skill1}/${skill2}/${skill3})\n`;
    });

    const quests = await fetchQuest();
    const quest = random(quests);
    msg += `\n任務: ${quest.get('Name')}\n目標: ${quest.get('Objective')}`;
    return msg;
  },
};
