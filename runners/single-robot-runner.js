const path = require('path');
const fs = require('fs');

const { currencyToNumber } = require('./../helpers/currency.helper');

const Runner = require('./runner');

const hahabuRobot = require('../robots/hahabu.robot');
const csvService = require('./../services/csv.service');
const categoryMatchingService = require('./../services/category-matching.service');

const SCRAPED_FOLDER = 'workload/scraped';
const CATEGORIZED_FOLDER = 'workload/categorized';

class SingleRobotRunner extends Runner {

  constructor(
    name,
    hahabuBankAccount,
    hahabuDefaultUploadOptions,
    csvUsageColumnName,
    csvAmountColumnName,
    credentials,
  ) {
    super();
    this.name = name;
    this.hahabuBankAccount = hahabuBankAccount;
    this.hahabuDefaultUploadOptions = hahabuDefaultUploadOptions;
    this.csvUsageColumnName = csvUsageColumnName;
    this.csvAmountColumnName = csvAmountColumnName;

    this.bankAccount = credentials.bankAccount;
    this.bankPin = credentials.bankPin;
    this.hahabuUsername = credentials.hahabuUsername;
    this.hahabuPassword = credentials.hahabuPassword;
  }

  _getScrapedFileName() {
    return path.join(SCRAPED_FOLDER, `${this.name}-scraped.csv`);
  }

  _getCategorizedFileName() {
    return path.join(CATEGORIZED_FOLDER, `${this.name}-categorized.csv`);
  }

  _scrapeCore() {
    throw new Error('Not implemented');
  }

  async scrape() {
    const csvBuffer = await this._scrapeCore(this.bankAccount, this.bankPin);
    const csvString = this._tweakCsvBuffer(csvBuffer);
    fs.writeFileSync(this._getScrapedFileName(), csvString, { encoding: 'utf-8' });
  }

  _getCategory(usage, amount) {
    const matchedRule = categoryMatchingService.getCategory(usage, amount);
    if (matchedRule) {
      return matchedRule.category;
    }
    return 'NO CATEGORY';
  }

  categorize() {
    const documentCsvString = fs.readFileSync(this._getScrapedFileName(), { encoding: 'utf-8' });
    const categorizedCsvString = csvService.addColumn(
      documentCsvString,
      'category',
      (row) => this._getCategory(row[this.csvUsageColumnName], currencyToNumber(row[this.csvAmountColumnName]))
    );
    fs.writeFileSync(this._getCategorizedFileName(), categorizedCsvString, { encoding: 'utf-8' });
  }

  upload() {
    const documentCsvString = fs.readFileSync(this._getCategorizedFileName(), { encoding: 'utf-8' });
    return hahabuRobot.beingLoggedIn(
      this.hahabuUsername,
      this.hahabuPassword,
      async browser => {
        await hahabuRobot.uploadCsv(
          browser,
          documentCsvString,
          {
            bankAccount: this.hahabuBankAccount,
            ...this.hahabuDefaultUploadOptions
          }
        );
      }
    );
  }

  _deleteFileIfExists(filePath) {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  clean() {
    this._deleteFileIfExists(this._getScrapedFileName());
    this._deleteFileIfExists(this._getCategorizedFileName());
  }

  _tweakCsvBuffer(csvBuffer) {
    let csv = csvBuffer.toString('utf-8');
    csv = csvService.filterRows(csv, row => Object.values(row)[0].length > 0);
    csv = csvService.fillEmptyColumns(csv, '<EMPTY>');
    return csv;
  }
}

module.exports = SingleRobotRunner;
