const puppeteer = require('puppeteer');

async function toKana(msg) {
  const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
  const page = await browser.newPage();
  await page.goto('http://but.lolicom.org/tool');
  await page.click('#src');
  await page.type(msg);
  await page.click('#page0 > button');
  await page.waitFor(1*1000);

  let columnsCount = await page.evaluate((sel) => {
    return document.querySelector(sel).rows[0].cells.length;
  }, '#editpane > table');
  var tmp = [];
  for (let i = 1; i <= columnsCount; i++) {
    let TB_KANA_SELECTOR = '#editpane > table > tbody > tr:nth-child(1) > td:nth-child(INDEX) > input[type="text"]';
    let kanaSelector = TB_KANA_SELECTOR.replace("INDEX", i);
    let kana = await page.evaluate((sel) => {
      var element = document.querySelector(sel);
      if (element) {
        return element.getAttribute('value');
      } else {
        return '';
      }
    }, kanaSelector);

    let TB_SRC_SELECTOR = '#editpane > table > tbody > tr:nth-child(2) > td:nth-child(INDEX)';
    let srcSelector = TB_SRC_SELECTOR.replace("INDEX", i);
    let src = await page.evaluate((sel) => {
      let element = document.querySelector(sel);
      return element? element.innerHTML: '';
    }, srcSelector);

    tmp.push(src + ' ' + kana);
  }
  browser.close();
  return new Promise( (resolve, reject) => {
    if (tmp.length > 0) {
      resolve(tmp.join('\n'));
    } else {
      reject(new Error('sth wrong'));
    }
  });
};

module.exports = {
  toKana: toKana
};
