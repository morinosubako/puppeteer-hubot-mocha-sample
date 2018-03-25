'use strict';

const ChildProcess = require('child_process');
const request = require('request');
const fs = require('fs');
const path = require('path');

const slackSettingsPath = path.join(__dirname, '../conf/slack.json');
const slackSettings = JSON.parse(fs.readFileSync(slackSettingsPath));

module.exports = (robot) => {
  robot.respond(/test/i, (msg) => {
    // 子プロセスでテストスクリプトを起動
    const result = ChildProcess.execSync('node mocha/index.js').toString();
    // 発言したチャンネルへテスト結果を送信
    request.post(slackSettings.endpoint,
        {
            form: {
                token: slackSettings.token,
                channel: msg.message.room,
                username: slackSettings.userName,
                text: result
            }
        }, (error, response, body) => {
          // 必要に応じてエラー処理等を書く
        }
    );
  });
};
