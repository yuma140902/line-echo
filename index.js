'use strict'

const https = require('https')
const path = require('path')
const express = require('express')
const line = require('@line/bot-sdk')
const kuromoji = require('kuromoji')
const word_verifier = require('./word-verifier')
const kana_util = require('./kana-util')
const next_word = require('./next-word')
const db = require('./db')

const dic_path = path.join(__dirname, './node_modules/kuromoji/dict') + '/'

const port = process.env.PORT || 3000;

const config = {
  channelAccessToken: process.env.LINE_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET
};

const client = new line.Client(config);

let tokenizer;

const app = express();

app.get('/', (req, res) => {
  res.sendStatus(200);
});

app.post('/webhook', line.middleware(config), (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

function textResponse(text) {
  return {
    'type': 'text',
    'text': text
  };
}

function handleEvent(event) {
  console.log('event:', JSON.stringify(event));

  if (event.type !== 'message' || event.message.type !== 'text' || event.source.type !== 'user') {
    return Promise.resolve(null);
  }
  const result = word_verifier.verifyWord(tokenizer, event.message.text);

  if (result.succeeded) {
    const firstKana = kana_util.firstKana(result.kana);
    const lastKana = kana_util.lastKana(result.kana);

    // todo 前の言葉との連続性の確認と、データベースの更新処理と、新しい名詞を返す処理

    const nextWord = next_word(tokenizer, lastKana);

    const userId = event.source.userId;
    console.log("obtain");
    await db.obtainUserLastKana(userId);
    console.log("update");
    await db.updateUserLastKana(userId, lastKana);

    const response = [
      textResponse(`名詞: ${result.surface}、よみ: ${result.kana}、最後の文字は${lastKana}`),
      textResponse(`${nextWord.word} (${nextWord.kana} : ${kana_util.lastKana(nextWord.kana)}) `)
    ];
    return client.replyMessage(event.replyToken, response);
  }
  else {
    let response;
    if (result.error_reason === word_verifier.error_reasons.COMPOUND_NOUN) {
      const surfaces = result.tokens.map(token => token.surface_form);
      response = [
        textResponse(`${event.message.text}は ${surfaces.join(' + ')} の複合語です。`),
        textResponse('実在する言葉かどうか判定できないので、複合語は使えません。')
      ];
    }
    else if (result.error_reason === word_verifier.error_reasons.UNKNOWN_WORD) {
      response = [
        textResponse(`${event.message.text}は辞書に載っていません。`),
        textResponse('辞書に載っている名詞しか使えません')
      ];
    }
    else if (result.error_reason === word_verifier.error_reasons.NOT_A_NOUN) {
      response = [
        textResponse(`「${event.message.text}」は${result.pos}です。`),
        textResponse('名詞しか使えません。')
      ];
    }
    else if (result.error_reason === word_verifier.error_reasons.NOT_A_WORD) {
      const tokens = result.tokens.map(token => `${token.surface_form} : ${word_verifier.friendlyPos(token)}`);
      response = [
        textResponse(`形態素解析の結果、\n${tokens.join('\n')}\nとなりました。`),
        textResponse(`「${event.message.text}」は名詞ではないのでしりとりには使えません。`)
      ];
    }
    else {
      console.assert(false);
      response = textResponse(`[実績解除] 有能デバッガー\nあなたはこのBOTの開発者が気づかなかったバグを見つけ出した！`);
    };
    return client.replyMessage(event.replyToken, response);
  }


}

function getTokenizerPromise() {
  console.log('Loading Kuromoji.js');
  return new Promise((resolve) => {
    kuromoji.builder({ dicPath: dic_path }).build(function (err, tokenizer) {
      // tokenizer is ready
      resolve(tokenizer);
      console.log('Loaded Kuromoji.js');
      if (err) {
        console.error(err);
      }
    });
  })
}

getTokenizerPromise().then(tokenizer_ => {
  tokenizer = tokenizer_;
  app.listen(port, () => console.log(`Listening on :${port}`));
});