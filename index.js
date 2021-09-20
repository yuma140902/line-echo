const https = require('https')
const express = require('express')
const line = require('@line/bot-sdk')
const kuromoji = require('kuromoji')

const dic_path = path.join(__dirname, '../node_modules/kuromoji/dict') + '/'

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

  kuromoji.builder({ dicPath: dic_path }).build(function (err, tokenizer) {
    // tokenizer is ready
    var path = tokenizer.tokenize(event.message.text);
    console.log("tokens:", path);
  });

  const response = {
    "type": "image",
    "originalContentUrl": "https://public.potaufeu.asahi.com/b4e7-p/picture/26282214/7d014eead948b196890a4c8491594f33_640px.jpg",
    "previewImageUrl": "https://static.minne.com/profiles/8909705/large/31d7ac414ba91e999875c7c0871871bf15034323.gif?1528854093"
  };

  return client.replyMessage(event.replyToken, response);
}

app.listen(port, () => console.log(`Listening on :${port}`));