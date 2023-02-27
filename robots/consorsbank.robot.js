const puppeteer = require('puppeteer');
const { downloadAndReadFile, sleep } = require('../helpers/scraping.helpers');

class CommerzbankRobot {

  async beingLoggedIn(accountNumber, pin, action) {
    const browser = await puppeteer.launch({ headless: false, defaultViewport: { width: 1024, height: 768 } });
    await this._login(browser, accountNumber, pin);
    try {
      return await action(browser);
    } finally {
      await this._logout(browser);
      await browser.close();
    }
  }

  async _login(browser, accountNumber, pin) {
    const page = await browser.newPage();
    await page.goto('https://www.consorsbank.de/home');
    await page.waitForSelector('#popin_tc_privacy_button');
    await page.click('#popin_tc_privacy_button');
    await page.waitForSelector('#header-login-button');
    await sleep(5000);
    await page.click('#header-login-button');

    await page.waitForSelector('[name=username]');

    await sleep(2000);
    await page.type('[name=username]', accountNumber);
    await page.type('[name=password]', pin);

    await sleep(2000);
    await page.click('[title=Einloggen]');

    await page.waitForXPath(this._getAccountLinkXpath(accountNumber), { timeout: 120000 });

    await page.close();
  }

  _getAccountLinkXpath(accountNumber) {
    return `//*[@id='GIR_${accountNumber}']/a[contains(text(), 'Girokonto')]`;
  }

  async _logout(browser) {
    const page = await browser.newPage();
    await page.goto('https://www.consorsbank.de/home');
    await page.waitForSelector('#header-logout-button');
    await page.click('#header-logout-button');
    await sleep(3000);
  }

  async scrapeAccount(browser, accountNumber) {
    const page = await browser.newPage();
    await page.goto('https://www.consorsbank.de/ev/Mein-Konto-und-Depot/Uebersicht#Kontouebersicht');

    await page.waitForXPath(this._getAccountLinkXpath(accountNumber));

    await sleep(3000);
    const accountLinkElements = await page.$x(this._getAccountLinkXpath(accountNumber));
    await accountLinkElements[0].click();

    await page.waitForSelector('[name="dateRange"]');
    await page.select('[name="dateRange"]', 'last90Days');

    await page.waitForSelector('a[title="CSV exportieren"]');
    await sleep(5000);
    const downloadedFileContent =
      await downloadAndReadFile(page, async () => {
        await page.click('a[title="CSV exportieren"]');
      });

    await page.close();
    return downloadedFileContent;
  }
}

module.exports = new CommerzbankRobot();
