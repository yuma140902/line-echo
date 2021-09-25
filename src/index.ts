import path from 'path'
import express from 'express'
import * as line from '@line/bot-sdk'
import kuromoji from 'kuromoji'
import * as word_verifier from './word-verifier'
import * as kana_util from './kana-util'
import next_word from './next-word'
import * as db from './db'

const dic_path = path.join(__dirname, '../node_modules/kuromoji/dict') + '/'

const port = process.env.PORT || 3000;

const config = {
  channelAccessToken: process.env.LINE_ACCESS_TOKEN || 'LINE ACCESS TOKEN IS NOT SET',
  channelSecret: process.env.CHANNEL_SECRET || 'CHANNEL SECRET IS NOT SET'
};

const client = new line.Client(config);

let tokenizer: kuromoji.Tokenizer<kuromoji.IpadicFeatures>;

const app = express();

app.get('/', (req, res) => {
  res.sendStatus(200);
});

app.post('/webhook', line.middleware(config), (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then(result => res.json(result))
    .catch(err => {
      console.error(err);
      res.status(500).end();
    });
});

function textResponse(text: string): line.TextMessage {
  return {
    'type': 'text',
    'text': text
  };
}

async function handleEvent(event: line.MessageEvent) {
  console.log('event:', JSON.stringify(event));

  const reply = (response: line.Message | line.Message[]) => client.replyMessage(event.replyToken, response);

  if (event.type !== 'message' || event.message.type !== 'text' || event.source.type !== 'user') {
    return Promise.resolve(null);
  }

  const result = word_verifier.verifyWord(tokenizer, event.message.text);

  if (result.succeeded) {
    const firstKana = kana_util.firstKana(result.kana);
    const lastKana = kana_util.lastKana(result.kana);
    const wordInfoResponse = textResponse(`単語: ${result.surface}、よみ: ${result.kana}、最後の文字は${lastKana}`);

    if (lastKana === 'ン') {
      await db.removeUserLastKana(event.source.userId);
      return reply([
        wordInfoResponse,
        textResponse('ンなので終了します'),
        textResponse('再開するには適当な単語を言ってください')
      ]);
    }

    const botLastKana = await db.obtainUserLastKana(event.source.userId);
    if (!botLastKana || firstKana === botLastKana) {
      const nextWord = next_word(tokenizer, lastKana);
      if (!nextWord) {
        return reply(textResponse("参りました"));
      }
      const nextBotLastKana = kana_util.lastKana(nextWord.kana);
      await db.updateUserLastKana(event.source.userId, nextBotLastKana);
      return reply([
        wordInfoResponse,
        textResponse(`${nextWord.word} (${nextWord.kana} : ${nextBotLastKana}) `)
      ]);
    }
    else {
      return reply([
        textResponse(`前の単語は${botLastKana}で終わりましたが、${event.message.text} (${result.kana}) は${firstKana}から始まります`),
        textResponse(`${botLastKana}から始まる単語を入力してください`)
      ]);
    }

  }
  else if (result.error_reason === 'COMPOUND_NOUN') {
    const surfaces = result.tokens.map((token: any) => token.surface_form);
    return reply([
      textResponse(`${event.message.text}は ${surfaces.join(' + ')} の複合語です。`),
      textResponse('実在する言葉かどうか判定できないので、複合語は使えません。')
    ]);
  }
  else if (result.error_reason === 'UNKNOWN_WORD') {
    return reply([
      textResponse(`${event.message.text}は辞書に載っていません。`),
      textResponse('辞書に載っている名詞しか使えません')
    ]);
  }
  else if (result.error_reason === 'NOT_A_NOUN') {
    return reply([
      textResponse(`「${event.message.text}」は${result.pos}です。`),
      textResponse('名詞しか使えません。')
    ]);
  }
  else if (result.error_reason === 'NOT_A_WORD') {
    const tokens = result.tokens.map((token: any) => `${token.surface_form} : ${word_verifier.friendlyPos(token)}`);
    return reply([
      textResponse(`形態素解析の結果、\n${tokens.join('\n')}\nとなりました。`),
      textResponse(`「${event.message.text}」は名詞ではないのでしりとりには使えません。`)
    ]);
  }
  else {
    console.assert(false);
    return reply(textResponse(`[実績解除] 有能デバッガー\nあなたはこのBOTの開発者が気づかなかったバグを見つけ出した！`));
  }


}

function getTokenizerPromise(): Promise<kuromoji.Tokenizer<kuromoji.IpadicFeatures>> {
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