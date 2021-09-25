import kuromoji from 'kuromoji'
import * as word_verifier from './word-verifier'
const freqlist = require('../rsc/freqlist_ja.json');

// ===== 次の言葉を考えるモジュール =====

function randomRanged(begin: number, end: number) {
  begin = Math.ceil(begin);
  end = Math.floor(end);
  return Math.floor(Math.random() * (end - begin) + begin);
}

const MAX_TRIAL = 12;

interface NextWordInfo {
  kana: string,
  word: string
}

const nextWord = (tokenizer: kuromoji.Tokenizer<any>, lastKana: string): NextWordInfo | undefined => {

  if (!freqlist[lastKana]) {
    console.assert(false, `not implemented next-word (lastKana: ${lastKana})`);
    return undefined;
  }

  let word;
  const numWords = freqlist[lastKana].length;

  let trial = 0;
  do {
    word = freqlist[lastKana][randomRanged(0, numWords)];
    ++trial;
    if (trial > 12) {
      word = undefined;
      break;
    }
  } while (!word_verifier.verifyWord(tokenizer, word[1]).succeeded);

  console.log("next-word trial", trial);

  if (!word) return undefined;

  return {
    kana: word[0],
    word: word[1]
  };
}

export default nextWord;