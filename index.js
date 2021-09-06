const https = require('https')
const express = require('express')
const line = require('@line/bot-sdk')

const PORT = process.env.PORT || 3000;

const config = {
  channelAccessToken: process.env.LINE_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET
};

const dic = {
  'a': 'apple',
  'b': 'banana',
  'c': 'cacao',
  'd': 'domain',
  'e': 'e-mail',
  'f': 'family',
  'g': 'go',
  'h': 'hey',
  'i': 'internet',
  'j': 'Japan',
  'k': 'kid',
  'l': 'lily',
  'm': 'mom',
  'n': 'no',
  'o': 'occur',
  'p': 'piano',
  'q': 'quantum',
  'r': 'random',
  's': 'step',
  't': 'tech',
  'u': 'ultra',
  'v': 'vector',
  'w': 'win',
  'x': 'x-server',
  'y': 'yes',
  'z': 'zoom'
}

const app = express();

app.get('/', (req, res) => res.sendStatus(200));

app.post('/webhook', line.middleware(config), (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then(result => res.json(result));
});

const client = new line.Client(config);
function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }

  const word = event.message.text;
  const lastletter = word.slice(-1).toLowerCase();
  const replyWord = dic[lastletter];

  return client.replyMessage(event.replyToken, {
    type: 'text',
    text: replyWord ?? 'English word please'
  });
}

app.listen(PORT, () => console.log(`Listening on :${PORT}`));