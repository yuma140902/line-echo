const error_reasons = {
  NOT_A_WORD: "not a word"
}


const analyzeWord = (tokenizer, text) => {
  const tokens = tokenizer.tokenize(text);
  if (tokens.length === 1 && tokens[0].pos === '名詞') {
    return {
      succeeded: true,
      tokens: tokens,
      surface: tokens[0].surface_form,
      kana: tokens[0].reading
    };
  }
  else {
    return {
      succeeded: false,
      tokens: tokens,
      error_reason: error_reasons.NOT_A_WORD
    };
  }
}

module.exports.analyzeWord = analyzeWord;
module.exports.error_reasons = error_reasons;