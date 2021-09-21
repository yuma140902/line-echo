'use strict'

const https = require('https')
const path = require('path')
const express = require('express')
const line = require('@line/bot-sdk')
const kuromoji = require('kuromoji')
const word_analyzer = require('./word-analyzer')

const dic_path = path.join(__dirname, './node_modules/kuromoji/dict') + '/'

const port = process.env.PORT || 3000;

const config = {
  channelAccessToken: process.env.LINE_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET
};

const client = new line.Client(config);

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
    "type": "text",
    "text": text
  };
}

function handleEvent(event) {
  console.log("event:", JSON.stringify(event));

  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }

  return getTokenizerPromise().then(tokenizer => {
    const result = word_analyzer.analyzeWord(tokenizer, event.message.text);

    if (result.succeeded) {
      const response = textResponse(`名詞: ${result.surface}、よみ: ${result.kana}`);
      // todo 前の言葉との連続性の確認と、データベースの更新処理と、新しい名詞を返す処理
      return client.replyMessage(event.replyToken, response);
    } else {
      let response;
      if (result.error_reason === word_analyzer.error_reasons.COMPOUND_NOUN) {
        const surfaces = result.tokens.map(token => token.surface_form);
        response = [
          textResponse(`${event.message.text}は ${surfaces.join(" + ")} の複合語です。`),
          textResponse('実在する言葉かどうか判定できないので、複合語は使えません。')
        ];
      }
      else if (result.error_reason === word_analyzer.error_reasons.NOT_A_NOUN) {
        response = [
          textResponse(`「${event.message.text}」は${result.pos}です。`),
          textResponse("名詞しか使えません。")
        ];
      }
      else if (result.error_reason === word_analyzer.error_reasons.NOT_A_WORD) {
        response = [
          textResponse(JSON.stringify(result.tokens, undefined, '　')),
          textResponse(`「${event.message.text}」は名詞ではないようです`)
        ];
      }
      return client.replyMessage(event.replyToken, response);
    }


  });


}

function getTokenizerPromise() {
  return new Promise((resolve) => {
    kuromoji.builder({ dicPath: dic_path }).build(function (err, tokenizer) {
      // tokenizer is ready
      resolve(tokenizer);
    });
  })
}

app.listen(port, () => console.log(`Listening on :${port}`));