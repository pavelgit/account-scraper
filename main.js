const prompt = require('prompt-async');
const combinedRunner = require('./runners/combined.runner.js');

async function readCommand() {
  const { command } = await prompt.get(['command']);
  const match = command.match(/^\s*(\w+)((\s+\w+)+)?\s*$/);
  if (!match) {
    throw new Error('couldn\'t parse the command');
  }

  const names = match[2] ? match[2].match(/\w+/g) : [];

  return { action: match[1], names };
}

(async () => {

  for(;;) {

    const { action, names } = await readCommand();

    if (action === 'exit') {
      return;
    }

    switch (action) {
      case 'scrape':
        await combinedRunner.scrape(names);
        break;
      case 'categorize':
        await combinedRunner.categorize(names);
        break;
      case 'upload':
        await combinedRunner.upload(names);
        break;
      case 'clean':
        await combinedRunner.clean(names);
        break;
      default:
        throw new Error('Unknown command');
    }

  }

})();
