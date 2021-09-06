const https = require('https')
const express = require('express')
const line = require('@line/bot-sdk')

const PORT = process.env.PORT || 3000;


const app = express();

app.get('/', (req, res) => {
  const name = req.query.name;
  if (name) {
    console.log(name);
  }
  res.send(`Hello ${name ?? 'Unknown'}`);
});

app.listen(PORT, () => console.log(`Listening on :${PORT}`));