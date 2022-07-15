// mhrs.js

const airtable = require('airtable');
const random = require('random-item');
const randInt = require('random-int');

let weaponCache = [];
let lastWeaponQueryDate;
async function fetchWeapon() {
  const CACHE_TIME = 60 * 1000;
  const current = new Date();
  let shouldUpdate = true;
  if (lastWeaponQueryDate) {
    shouldUpdate = current - lastWeaponQueryDate > CACHE_TIME;
  }
  const base = airtable.base(process.env.AIRTABLE_MHR_BASE_ID);
  if (shouldUpdate) {
    const newQuests = await base('Weapon')
      .select({
        view: 'Grid view',
      })
      .all();
    weaponCache = newQuests || weaponCache;
    lastWeaponQueryDate = current;
    return weaponCache;
  } else {
    base('Weapon')
      .select({
        view: 'Grid view',
      })
      .all()
      .then(newQuests => {
        weaponCache = newQuests || weaponCache;
      });
    return weaponCache;
  }
}

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
    const newQuests = await base('Master Rank Quest')
      .select({
        view: 'Grid view',
      })
      .all();
    questsCache = newQuests || questsCache;
    lastQueryDate = current;
    return questsCache;
  } else {
    base('Master Rank Quest')
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
  async roulette(onlyQuest) {
    let msg = '';

    if (!onlyQuest) {
      const weapons = await fetchWeapon();
      ['一', '二', '三', '四'].forEach(num => {
        const weaponInfo = random(weapons);
        const weapon = weaponInfo.get('Name');
        const buddy = random(['貓', '狗']);
        const skillCounts = [2, 2, 2, 3, 2];
        const book1 = skillCounts
          .map(randInt)
          .map(String)
          .join('');
        const book2 = skillCounts
          .map(randInt)
          .map(String)
          .join('');
        msg += `${num}: ${weapon} (${buddy}/${book1}/${book2})\n`;
      });
      msg += `\n`;
    }

    const quests = await fetchQuest();
    const quest = random(quests);
    msg += `任務: ${quest.get('Name')}\n目標: ${quest.get('Objective')}`;
    return msg;
  },
};
