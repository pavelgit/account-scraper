const SingleRobotRunner = require('./single-robot-runner');
const commerzbankRobot = require('../robots/commerzbank.robot');

class CommerzbankRunner extends SingleRobotRunner {

  constructor(
    name,
    hahabuBankAccount,
    credentials,
    commerzbankAccountName = '0-Euro-Konto'
  ) {
    super(
      name,
      hahabuBankAccount,
      {
        dateField: 'Buchungstag',
        amountField: 'Betrag',
        titleField: 'Buchungstext',
        categoryField: 'category'
      },
      'Buchungstext',
      'Betrag',
      credentials
    );
    this.commerzbankAccountName = commerzbankAccountName;
  }

  _scrapeCore(bankAccount, pin) {
    return commerzbankRobot.beingLoggedIn(
      bankAccount,
      pin,
      browser => commerzbankRobot.scrapeAccount(browser, this.commerzbankAccountName)
    );
  }

}

module.exports = CommerzbankRunner;
