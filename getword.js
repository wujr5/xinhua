const superagent = require('superagent');
const cheerio = require('cheerio');
const fs = require('fs');

const baseUrl = 'https://www.cidianwang.com'

function getPinyinIndex() {
  return superagent
    .get(baseUrl + '/pinyin')
    .then((res) => {
      let $ = cheerio.load(res.text);
      let dom = $('.bs .zdbs a');

      let aPinyin = [];
      dom.map((item) => {
        aPinyin.push(dom[item].attribs.href)
      });

      return aPinyin
    })
    .catch((err) => {
      console.log('发生错误：', err)
    })
}

async function getPinyinWord(url) {
  return new Promise((resolve, reject) => {
    superagent
      .get(baseUrl + url)
      .then((res) => {
        let $ = cheerio.load(res.text);
        let word = [];

        // 字 与 链接
        let c1 = $('.bh .c1 a');
        c1.map((key, item) => {
          word.push({
            word: c1[key].children[0].data,
            link: c1[key].attribs.href
          })
        });

        // 笔画
        let c2 = $('.bh .c2');
        c2.map((key, item) => {
          word[key].stroke = c2[key].children[0].data;
        });

        // 读音
        let c3 = $('.bh .c3');
        c3.map((key, item) => {
          word[key].pinyin = c3[key].children[0].data.split(' ').filter(i => i);
        });

        resolve(word)
      })
      .catch((err) => {
        console.log('发生错误：', err.status, err.message)
        reject({
          err: true,
          msg: err.status + ' ' + err.message
        });
      })
  })
}

async function start() {
  let aPinyin = await getPinyinIndex();
  let aWord = [];

  for (i = 0; i < aPinyin.length; i++) {
    console.log('抓取：', aPinyin[i]);
    let word;
    try {
      word = await getPinyinWord(aPinyin[i]);
      aWord = aWord.concat(word);
    } catch (e) {
      console.log(e)
    }
  }

  fs.writeFileSync('word.json', JSON.stringify(aWord));
}

start();
