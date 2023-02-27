const Runner = require('./runner');

class CombinedRunner extends Runner {

  constructor() {
    super();
    this.availableRunners = [];
  }

  _getActiveRunners(names) {
    if (names.some(name => name === 'all')) {
      return [...this.availableRunners];
    }
    if (names.some(name => !this.availableRunners.some(runner => runner.name === name))) {
      throw new Error(`Runner with some of names ${JSON.stringify(names)} is not available`);
    }
    return names.map(name => this.availableRunners.find(runner => runner.name === name));
  }

  scrape(names) {
    const activeRunners = this._getActiveRunners(names);
    return Promise.all(activeRunners.map(runner => runner.scrape()));
  }

  categorize(names) {
    const activeRunners = this._getActiveRunners(names);
    return Promise.all(activeRunners.map(runner => runner.categorize()));
  }

  async upload(names) {
    const activeRunners = this._getActiveRunners(names);
    for (const runner of activeRunners) {
      await runner.upload();
    }
  }

  clean(names) {
    const activeRunners = this._getActiveRunners(names);
    return Promise.all(activeRunners.map(runner => runner.clean()));
  }

}

module.exports = new CombinedRunner();
