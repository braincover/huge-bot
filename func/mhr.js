// mhr.js

const airtable = require('airtable');
const random = require('random-item');

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
  async roulette(verbose, onlyQuest) {
    let msg = '';

    if (!onlyQuest) {
      const weapons = await fetchWeapon();
      ['一', '二', '三', '四'].forEach(num => {
        const weaponInfo = random(weapons);
        const weapon = weaponInfo.get('Name');
        if (verbose) {
          const buddy = random(['隨從艾路', '隨從加爾克']);
          const skill1 = random(weaponInfo.get('Switch Skill 1').split(', '));
          const skill2 = random(weaponInfo.get('Switch Skill 2').split(', '));
          const skill3 = random(weaponInfo.get('Switch Skill 3').split(', '));
          msg += `${num}: ${weapon} /${buddy}\n  ${skill1}\n  ${skill2}\n  ${skill3}\n`;
        } else {
          const buddy = random(['貓', '狗']);
          const skill1 = random(['1', '2']);
          const skill2 = random(['1', '2']);
          const skill3 = random(['1', '2']);
          msg += `${num}: ${weapon} (${buddy}/${skill1}/${skill2}/${skill3})\n`;
        }
      });
      msg += `\n`;
    }

    const quests = await fetchQuest();
    const quest = random(quests);
    msg += `任務: ${quest.get('Name')}\n目標: ${quest.get('Objective')}`;
    return msg;
  },
};
