'use stricts';

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const assert = require('chai').assert;

const orderSettingsPath = path.join(__dirname, '../../conf/order.json');
const orderSettings = JSON.parse(fs.readFileSync(orderSettingsPath));

describe('EC-CUBE3 テスト サンプル', function() {
  // mocha タイムアウト
  this.timeout(60000);
  // テストサイトのトップページ
  const topUrl = orderSettings.topUrl;
  // 顧客情報
  const customer = {
    email: orderSettings.email,
    pass: orderSettings.pass

  };
  let browser, page;

  before(async () => {
    // heroku で動かす場合の設定
    const option = process.env.DYNO ? {args: ['--no-sandbox', '--disable-setuid-sandbox']} : {headless: false};

    browser = await puppeteer.launch(option);
    page = await browser.newPage();
  });

  after(async () => {
    await browser.close();
  });

  describe('登録済のアカウントから注文完了できること', async () => {
    // テストデータ
    const dataProvider = {
      '郵便振替': {
        input: {
          payment: '#shopping_payment_1'
        },
        expected: {
          completedUrl: topUrl + '/shopping/complete'
        }
      },
      '現金書留': {
        input: {
          payment: '#shopping_payment_2'
        },
        expected: {
          completedUrl: topUrl + '/shopping/complete'
        }
      },
      '銀行振込': {
        input: {
          payment: '#shopping_payment_3'
        },
        expected: {
          completedUrl: topUrl + '/shopping/complete'
        }
      },
      '代金引換': {
        input: {
          payment: '#shopping_payment_4'
        },
        expected: {
          completedUrl: topUrl + '/shopping/complete'
        }
      }
    };

    // テスト内容
    const exec = async (dataProvider) => {
      // ログアウトから始める
      await page.goto(`${topUrl}/logout`);
      await page.waitFor(1000);

      // 適当な商品をカートに入れる
      await page.goto(`${topUrl}/products/detail/1`);
      await page.select('select[name="classcategory_id1"]', '1');
      await page.select('select[name="classcategory_id2"]', '4');
      await page.click('#add-cart');
      await page.waitFor(1000);

      // レジに進む
      await page.click('a[href*="cart/buystep"]');
      await page.waitFor(1000);

      // ログイン
      await page.type('input[name="login_email"]', customer.email);
      await page.type('input[name="login_pass"]', customer.pass);
      await page.click('form[action*="/login_check"] button[type="submit"]');
      await page.waitFor(1000);

      // 注文する
      await page.click(dataProvider.input.payment);
      await page.waitFor(1500);
      await page.click('#order-button');
      await page.waitFor(1000);

      // 注文完了
      await page.waitFor(1000);
      assert(dataProvider.expected.completedUrl, await page.url());
    };

    // テスト実行
    for (let [describe, testData] of Object.entries(dataProvider)) {
      it(describe, async() => {
        await exec(testData);
      });
    };
  });
});
