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

function handleEvent(event) {
  console.log("event:", JSON.stringify(event));

  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }

  return getTokenizerPromise().then(tokenizer => {
    const result = word_analyzer.analyzeWord(tokenizer, event.message.text);

    if (result.succeeded) {
      const response = {
        "type": "text",
        "text": `名詞: ${result.surface}、よみ: ${result.kana}`
      };
      return client.replyMessage(event.replyToken, response);
    } else {
      const response = {
        "type": "text",
        "text": `${result.tokens}`
      };
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