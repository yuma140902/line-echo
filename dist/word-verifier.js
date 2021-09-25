"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyWord = exports.friendlyPos = void 0;
var kana_util = __importStar(require("./kana-util"));
// tokenが既知の単語であり、かつその品詞がposであるかどうか確認する
var posEqualsAndKnown = function (token, pos) {
    return token.word_type === 'KNOWN' && token.pos === pos;
};
var friendlyPos = function (token) {
    return (token.word_type === 'UNKNOWN' ? '辞書に載っていない' : '') + token.pos;
};
exports.friendlyPos = friendlyPos;
var preprocess = function (text) {
    return kana_util.han2zen(text.trim());
};
var verifyWord = function (tokenizer, text) {
    text = preprocess(text);
    var tokens = tokenizer.tokenize(text);
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
        };
    }
    // 1単語だが名詞ではないとき
    else if (tokens.length === 1) {
        return {
            succeeded: false,
            tokens: tokens,
            error_reason: 'NOT_A_NOUN',
            pos: (0, exports.friendlyPos)(tokens[0])
        };
    }
    else {
        var allNoun = tokens.every(function (token) { return (posEqualsAndKnown(token, '名詞') || posEqualsAndKnown(token, '接頭詞')); });
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
};
exports.verifyWord = verifyWord;
