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
    await page.goto('https://kunden.commerzbank.de/lp/login?pk');
    await page.waitForSelector('#uc-btn-accept-banner');
    await page.click('#uc-btn-accept-banner');

    await page.type('#teilnehmer', accountNumber);
    await page.type('#pin', pin);
    await page.click('#loginFormSubmit');

    await Promise.all([
      page.waitForSelector('#customerInformationPanel', { timeout: 120000 }),
      this._detectAndHandleSessionAlreadyExistsIfHappened(page, accountNumber, pin)
    ]);

    await page.close();
  }


  async _logout(browser) {
    const page = await browser.newPage();
    await page.goto('https://kunden.commerzbank.de/banking/landingpage?0');
    await page.click('[title=Abmelden]');
  }

  async _detectAndHandleSessionAlreadyExistsIfHappened(page, accountNumber, pin) {
    try {
      await page.waitForXPath(
        '//*[contains(text(), "Unter Ihrem Teilnehmer liegt bereits eine aktive Session vor")]',
        { timeout: 10000 }
      );
    } catch (e) {
      return;
    }

    await page.type('#pin', pin);
    await page.click('#loginFormSubmit');
  }

  async _clickBankAccountTitle(page, bankAccountTitle) {
    const accountLinkElements =
      await page.$x(`//*[@id='customerInformationPanel' and .//span[contains(text(), '${bankAccountTitle}')]]`);
    await accountLinkElements[0].click();
  }

  async scrapeAccount(browser, bankAccountTitle) {
    const page = await browser.newPage();
    await page.goto('https://kunden.commerzbank.de/banking/landingpage');

    await sleep(3000);

    try {
      await this._clickBankAccountTitle(page, bankAccountTitle)
    } catch (e) {
      if (e.message === 'Node is either not visible or not an HTMLElement') {
        await page.click('#financeOverviewPanel .expander-handle');
        await this._clickBankAccountTitle(page, bankAccountTitle)
      } else {
        throw e;
      }
    }

    await page.waitForSelector('#s2id_input-13');
    await page.click('#s2id_input-13');
    const options = await page.$x('//*[@id="input-13"]/option[contains(text(),"3 Monate")]');
    const optionValue = await (await options[0].getProperty("value")).jsonValue();
    await page.select('#input-13', optionValue);
    await sleep(1000);

    const downloadedFileContent =
      await downloadAndReadFile(page, async () => {
        await page.click('[data-sel-id="csvButton"]');
      });

    await page.close();
    return downloadedFileContent;
  }
}

module.exports = new CommerzbankRobot();
