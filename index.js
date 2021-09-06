const https = require('https')
const express = require('express')

const PORT = process.env.PORT || 3000;
const TOKEN = process.env.LINE_ACCESS_TOKEN;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => res.sendStatus(200));

app.post('/webhook', (req, res) => {
  res.send('HTTP POST request sent to the webhook URL!');

  // ユーザーがボットにメッセージを送った場合
  if (req.body.events[0].type === 'message') {
    const body = JSON.stringify({
      replyToken: req.body.events[0].replyToken,
      messages: [
        {
          'type': 'text',
          'text': 'Hello, user'
        },
        {
          'type': 'text',
          'text': 'May I help you?'
        }
      ]
    });

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer' + TOKEN
    };

    const webhookOptions = {
      'hostname': 'api.line.me',
      'path': '/v2/bot/message/reply',
      'method': 'POST',
      'headers': headers
    };

    const request = https.request(webhookOptions, res => {
      res.on('data', data => process.stdout.write(d));
    });

    request.on('error', err => console.error(err));

    request.write(body);
    request.end();
  }
});

app.listen(PORT, () => console.log(`Listening on :${PORT}`));