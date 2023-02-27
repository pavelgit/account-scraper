const puppeteer = require('puppeteer');
const tmp = require('tmp');
const fs = require('fs');
const { selectByOptionContainingText, sleep } = require('../helpers/scraping.helpers');

class HahabuRobot {

  async beingLoggedIn(username, password, action) {
    const browser = await puppeteer.launch({ headless: false, defaultViewport: { width: 1024, height: 768 } });

    await this._login(browser, username, password);

    try {
      return await action(browser);
    } finally {
      await browser.close();
    }
  }

  async _login(browser, username, password) {
    const page = await browser.newPage();
    await page.goto('https://mein.hahabu.de/import/schritt-1-hochladen');

    await page.type('#hahabuUsername', username);
    await page.type('#hahabuPassword', password);
    await page.click('section.login form button.btn-success');

    await page.waitForSelector('#AccountSelect');

    await page.close();
  }

  async uploadCsv(browser, csvContent, { bankAccount, dateField, amountField, titleField, categoryField }) {
    const page = await browser.newPage();
    await page.goto('https://mein.hahabu.de/import/schritt-1-hochladen');

    await this._processUploadStep1(page, bankAccount, csvContent);

    await this._processUploadStep2(page, dateField, amountField, titleField, categoryField);

    await this._processUploadStep3(page);

    await page.close();
  }

  async _processUploadStep1(page, bankAccount, csvContent) {
    await selectByOptionContainingText(
      page,
      await page.$('#AccountSelect'),
      bankAccount
    );

    const [fileChooser] = await Promise.all([
      page.waitForFileChooser(),
      page.click('#FileDropZone')
    ]);

    const tmpFileName = tmp.tmpNameSync();
    fs.writeFileSync(tmpFileName, csvContent);

    await fileChooser.accept([tmpFileName]);

    await page.waitForSelector('#NextButton:not([disabled])');
    await page.click('#NextButton:not([disabled])');

    await page.waitForSelector('#dateField');
  }

  async _processUploadStep2(page, dateField, amountField, titleField, categoryField) {
    await sleep(1000);
    await selectByOptionContainingText(
      page,
      await page.$('#dateField'),
      dateField
    );
    await selectByOptionContainingText(
      page,
      await page.$('#amountField'),
      amountField
    );
    await selectByOptionContainingText(
      page,
      await page.$('#titleField'),
      titleField
    );

    await selectByOptionContainingText(
      page,
      await page.$('#categoryField'),
      categoryField
    );

    await page.click('label[for=enable_rules]');

    await page.waitForSelector('#NextButton:not([disabled])');
    await page.click('#NextButton:not([disabled])');

    await page.waitForSelector('#ImportTable');
  }

  async _processUploadStep3(page) {
    try {
      await page.waitForSelector('#NextButton:not([disabled])', {timeout: 2000});
    } catch (e) {
      return;
    }
    const nonDisabledButton = await page.$('#NextButton:not([disabled])');

    await page.evaluate(() => { window.confirm = () => true; });
    await nonDisabledButton.click();

    await page.waitForSelector('.alert-success');
  }
}

module.exports = new HahabuRobot();
