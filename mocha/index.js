'use stricts';

const Mocha = require('mocha');
const fs = require('fs');
const path = require('path');

const testDir = path.join(__dirname, '../mocha/test');

const runTest = () => {
  const mocha = new Mocha();

  // テストフォルダの中のテストを自動で追加
  fs.readdirSync(testDir).filter((file) => {
    return file.substr(-3) === '.js';
  }).forEach((file) => {
    mocha.addFile(
      path.join(testDir, file)
    );
  });

  return new Promise((resolve, reject) => {
    mocha.run(failures => {
      resolve(failures);
    });
  });
};

(async () => {
  await runTest();
  process.exit();
})();
