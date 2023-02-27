const SingleRobotRunner = require('./single-robot-runner');

const consorsbankRobot = require('../robots/consorsbank.robot');
const csvService = require('../services/csv.service');

class ConsorsbankRunner extends SingleRobotRunner {

  constructor(name, hahabuBankAccount, credentials) {
    super(
      name,
      hahabuBankAccount,
      {
        dateField: 'Buchung',
        amountField: 'Betrag in EUR',
        titleField: 'combinedUsage',
        categoryField: 'category'
      },
      'combinedUsage',
      'Betrag in EUR',
      credentials
    );
  }

  _scrapeCore(bankAccount, pin) {
    return consorsbankRobot.beingLoggedIn(
      bankAccount, pin, browser => consorsbankRobot.scrapeAccount(browser, bankAccount)
    );
  }

  _tweakCsvBuffer(csvBuffer) {
    let csv = super._tweakCsvBuffer(csvBuffer);
    csv = csvService.addColumn(csv, 'combinedUsage', row => `${row['Sender / Empfänger']} ${row['Verwendungszweck']}`);
    return csv;
  }

}

module.exports = ConsorsbankRunner;
