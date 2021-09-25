import kuromoji from 'kuromoji'
import * as kana_util from './kana-util'

// ===== 形態素解析に関するモジュール =====

type ErrorReason = 'NOT_A_WORD' | 'COMPOUND_NOUN' | 'UNKNOWN_WORD';

type VerifyWordResult = Success | Fail;

type Success = {
  succeeded: true,
  tokens: kuromoji.IpadicFeatures[],
  surface: string,
  kana: string
}

type Fail = FailBase | FailNotANoun;

type FailBase = {
  succeeded: false,
  tokens: kuromoji.IpadicFeatures[],
  error_reason: ErrorReason
}

type FailNotANoun = {
  succeeded: false,
  tokens: kuromoji.IpadicFeatures[],
  error_reason: 'NOT_A_NOUN',
  pos: string
}


// tokenが既知の単語であり、かつその品詞がposであるかどうか確認する
const posEqualsAndKnown = (token: kuromoji.IpadicFeatures, pos: string): boolean =>
  token.word_type === 'KNOWN' && token.pos === pos;

export const friendlyPos = (token: kuromoji.IpadicFeatures): string =>
  (token.word_type === 'UNKNOWN' ? '辞書に載っていない' : '') + token.pos;


const preprocess = (text: string): string =>
  kana_util.han2zen(text.trim());


export const verifyWord = (tokenizer: kuromoji.Tokenizer<kuromoji.IpadicFeatures>, text: string): VerifyWordResult => {
  text = preprocess(text);

  const tokens = tokenizer.tokenize(text);

  if (tokens.length === 1 && posEqualsAndKnown(tokens[0], '名詞')) {
    return {
      succeeded: true,
      tokens: tokens,
      surface: tokens[0].surface_form,
      kana: tokens[0].reading || ''
    };
  }
  else if (tokens.length === 1 && tokens[0].word_type === 'UNKNOWN') {
    return {
      succeeded: false,
      tokens: tokens,
      error_reason: 'NOT_A_WORD'
    }
  }
  // 1単語だが名詞ではないとき
  else if (tokens.length === 1) {
    return {
      succeeded: false,
      tokens: tokens,
      error_reason: 'NOT_A_NOUN',
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
        error_reason: 'COMPOUND_NOUN'
      };
    }
    // その他複数の単語
    else {
      return {
        succeeded: false,
        tokens: tokens,
        error_reason: 'NOT_A_WORD'
      };
    }
  }
}
