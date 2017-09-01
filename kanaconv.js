const puppeteer = require('puppeteer');

async function toKana(msg) {
  return new Promise(function(resolve, reject) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('http://but.lolicom.org/tool');
    await page.click('#src');
    await page.type(msg);
    await page.click('#page0 > button');
    await page.waitFor(1 * 1000);

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
        return element ? element.innerHTML : '';
      }, srcSelector);

      tmp.push(src + ' ' + kana);
    }
    browser.close();

    if (tmp.length > 0) {
      resolve(tmp.join('\n'));
    } else {
      reject(Error('sth wrong'));
    }
  });
};

module.exports = {
  toKana: toKana
};