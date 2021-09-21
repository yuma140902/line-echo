'use strict'

const word_verifier = require('./word-verifier')
const freqlist = require('./rsc/freqlist_ja.json')

// ===== 次の言葉を考えるモジュール =====

function randomRanged(begin, end) {
  begin = Math.ceil(begin);
  end = Math.floor(end);
  return Math.floor(Math.random() * (end - begin) + begin);
}

const nextWord = (tokenizer, lastKana) => {
  let word;
  if (freqlist[lastKana]) {
    const numWords = freqlist[lastKana].length;
    let trial = 0;
    do {
      word = freqlist[lastKana][randomRanged(0, numWords)];
      ++trial;
    } while (!word_verifier.verifyWord(tokenizer, word[1]).succeeded);
    console.log("trial", trial);
    return {
      kana: word[0],
      word: word[1]
    };
  }
  else {
    console.assert(false, "not implemented next-word");
    return undefined;
  }
}

module.exports = nextWord;