const airtable = require('airtable');

let rulesCache = [];
let lastQueryDate;

function fetchRules() {
  const CACHE_TIME = 60 * 1000;
  const current = new Date();
  let shouldUpdate = true;
  if (lastQueryDate) {
    shouldUpdate = current - lastQueryDate > CACHE_TIME;
  }
  if (shouldUpdate) {
    lastQueryDate = current;
    // eslint-disable-next-line no-console
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

module.exports = {
  matchRules(msg) {
    fetchRules();
    const matchRule = rulesCache.find(rule => {
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
  },
};
