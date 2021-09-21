'use strict'
const kana_util = require('./kana-util')

// ===== 形態素解析に関するモジュール =====


const error_reasons = {
  NOT_A_WORD: "一単語ではない",
  COMPOUND_NOUN: "複合語",
  NOT_A_NOUN: "名詞ではない",
  UNKNOWN_WORD: "辞書に載っていない名詞"
}

// tokenが既知の単語であり、かつその品詞がposであるかどうか確認する
const posEqualsAndKnown = (token, pos) =>
  token.word_type === 'KNOWN' && token.pos === pos;

const friendlyPos = (token) =>
  (token.word_type === 'UNKNOWN' ? '辞書に載っていない' : '') + token.pos;


const preprocess = (text) =>
  kana_util.han2zen(text.trim());


const analyzeWord = (tokenizer, text) => {
  text = preprocess(text);

  const tokens = tokenizer.tokenize(text);

  if (tokens.length === 1 && posEqualsAndKnown(tokens[0], '名詞')) {
    return {
      succeeded: true,
      tokens: tokens,
      surface: tokens[0].surface_form,
      kana: tokens[0].reading
    };
  }
  else if (tokens.length === 1 && tokens[0].word_type === 'UNKNOWN') {
    return {
      succeeded: false,
      tokens: tokens,
      error_reason: error_reasons.UNKNOWN_WORD
    }
  }
  // 1単語だが名詞ではないとき
  else if (tokens.length === 1) {
    return {
      succeeded: false,
      tokens: tokens,
      error_reason: error_reasons.NOT_A_NOUN,
      pos: friendlyPos(tokens[0])
    };
  }
  else {
    const allNoun = tokens.every(token => (posEqualsAndKnown(token, '名詞') || posEqualsAndKnown(token, '接頭詞')));
    // 入力が複合語と思われるとき
    if (allNoun) {
      return {
        succeeded: false,
        tokens: tokens,
        error_reason: error_reasons.COMPOUND_NOUN
      };
    }
    // その他複数の単語
    else {
      return {
        succeeded: false,
        tokens: tokens,
        error_reason: error_reasons.NOT_A_WORD
      };
    }
  }
}


module.exports.analyzeWord = analyzeWord;
module.exports.friendlyPos = friendlyPos;
module.exports.error_reasons = error_reasons;