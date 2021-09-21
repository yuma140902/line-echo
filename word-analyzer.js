'use strict'

const error_reasons = {
  NOT_A_WORD: "一単語ではない",
  COMPOUND_NOUN: "複合語",
  NOT_A_NOUN: "名詞ではない"
}

// tokenが既知の単語であり、かつその品詞がposであるかどうか確認する
const posEquals = (token, pos) =>
  token.word_type === 'KNOWN' && token.pos === pos;

const analyzeWord = (tokenizer, text) => {


  const tokens = tokenizer.tokenize(text);

  if (tokens.length === 1 && posEquals(tokens[0], '名詞')) {
    return {
      succeeded: true,
      tokens: tokens,
      surface: tokens[0].surface_form,
      kana: tokens[0].reading
    };
  }
  // 1単語だが名詞ではないとき
  else if (tokens.length === 1) {
    return {
      succeeded: false,
      tokens: tokens,
      error_reason: error_reasons.NOT_A_NOUN,
      pos: tokens[0].pos
    }
  }
  else {
    const allNoun = tokens.every(token => (posEquals(token, '名詞') || posEquals(token, '接頭詞')));
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
module.exports.error_reasons = error_reasons;