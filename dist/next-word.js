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
var word_verifier = __importStar(require("./word-verifier"));
var freqlist = require('../rsc/freqlist_ja.json');
// ===== 次の言葉を考えるモジュール =====
function randomRanged(begin, end) {
    begin = Math.ceil(begin);
    end = Math.floor(end);
    return Math.floor(Math.random() * (end - begin) + begin);
}
var MAX_TRIAL = 12;
var nextWord = function (tokenizer, lastKana) {
    if (!freqlist[lastKana]) {
        console.assert(false, "not implemented next-word (lastKana: " + lastKana + ")");
        return undefined;
    }
    var word;
    var numWords = freqlist[lastKana].length;
    var trial = 0;
    do {
        word = freqlist[lastKana][randomRanged(0, numWords)];
        ++trial;
        if (trial > 12) {
            word = undefined;
            break;
        }
    } while (!word_verifier.verifyWord(tokenizer, word[1]).succeeded);
    console.log("next-word trial", trial);
    if (!word)
        return undefined;
    return {
        kana: word[0],
        word: word[1]
    };
};
exports.default = nextWord;
