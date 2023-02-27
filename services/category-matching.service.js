const categoryMatchingRules = require('./../config/categories.json');

class CategoryMatchingService {

  constructor() {
    this._validateRules();
  }

  _validateRules() {
    const invalidRules = categoryMatchingRules.filter(rule => !this._ruleIsValid(rule));
    if (invalidRules.length > 0) {
      throw new Error(`The rules are not valid, please check: ${JSON.stringify(invalidRules)}`)
    }
  }

  _ruleIsValid(rule) {
    return rule.usageRegex && rule.category;
  }

  getCategory(usage, amount) {
    const rule = categoryMatchingRules.find(rule => this._ruleMatches(usage, amount, rule));
    return rule;
  }

  _ruleMatches(usage, amount, rule) {
    const usageRegex = new RegExp(rule.usageRegex, 'i');
    if (!usageRegex.test(usage)) {
      return false;
    }
    if (!this._ruleMatchesAmount(rule, amount)) {
      return false;
    }
    return true;
  }

  _ruleMatchesAmount(rule, amount) {
    if (!rule.amount) {
      return true;
    }
    return rule.amount === amount;
  }

}

module.exports = new CategoryMatchingService();
