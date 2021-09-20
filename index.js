const https = require('https')
const express = require('express')
const line = require('@line/bot-sdk')

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
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }

  const response = {
    "type": "image",
    "originalContentUrl": "https://public.potaufeu.asahi.com/b4e7-p/picture/26282214/7d014eead948b196890a4c8491594f33_640px.jpg",
    "previewImageUrl": "https://static.minne.com/profiles/8909705/large/31d7ac414ba91e999875c7c0871871bf15034323.gif?1528854093"
  };

  return client.replyMessage(event.replyToken, response);
}

app.listen(port, () => console.log(`Listening on :${port}`));