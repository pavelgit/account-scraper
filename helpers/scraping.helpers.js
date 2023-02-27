const fs = require('fs');
const path = require('path');
const tmp = require('tmp');

async function selectByOptionContainingText(page, selectElement, optionTitle) {
  const options = await selectElement.$x(`//option[contains(text(),'${optionTitle}')]`);
  const value = await page.evaluate(element => element.value, options[0]);
  await selectElement.select(value);
}

async function sleep(duration) {
  return new Promise(resolve => setTimeout(resolve, duration));
}

async function waitAndGetDownloadedFileContent(dir) {
  for (let tryNumber = 0; tryNumber<20; tryNumber++) {
    const files = fs.readdirSync(dir);
    if (files.length > 0 && !files[0].endsWith('.crdownload')) {
      const filePath = path.join(dir, files[0]);
      return fs.readFileSync(filePath);
    }
    await sleep(500);
  }
  return null;
}

async function downloadAndReadFile(page, action) {
  const tmpDir = tmp.dirSync().name;
  await page._client.send('Page.setDownloadBehavior', {
    behavior: 'allow',
    downloadPath: tmpDir
  });
  await action();
  return waitAndGetDownloadedFileContent(tmpDir);
}

module.exports = {
  selectByOptionContainingText,
  waitAndGetDownloadedFileContent,
  downloadAndReadFile,
  sleep
};