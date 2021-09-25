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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = __importDefault(require("path"));
var express_1 = __importDefault(require("express"));
var line = __importStar(require("@line/bot-sdk"));
var kuromoji_1 = __importDefault(require("kuromoji"));
var word_verifier = __importStar(require("./word-verifier"));
var kana_util = __importStar(require("./kana-util"));
var next_word_1 = __importDefault(require("./next-word"));
var db = __importStar(require("./db"));
var dic_path = path_1.default.join(__dirname, '../node_modules/kuromoji/dict') + '/';
var port = process.env.PORT || 3000;
var config = {
    channelAccessToken: process.env.LINE_ACCESS_TOKEN || 'LINE ACCESS TOKEN IS NOT SET',
    channelSecret: process.env.CHANNEL_SECRET || 'CHANNEL SECRET IS NOT SET'
};
var client = new line.Client(config);
var tokenizer;
var app = (0, express_1.default)();
app.get('/', function (req, res) {
    res.sendStatus(200);
});
app.post('/webhook', line.middleware(config), function (req, res) {
    Promise
        .all(req.body.events.map(handleEvent))
        .then(function (result) { return res.json(result); })
        .catch(function (err) {
        console.error(err);
        res.status(500).end();
    });
});
function textResponse(text) {
    return {
        'type': 'text',
        'text': text
    };
}
function handleEvent(event) {
    return __awaiter(this, void 0, void 0, function () {
        var reply, result, firstKana, lastKana, wordInfoResponse, botLastKana, nextWord, nextBotLastKana, surfaces, tokens;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('event:', JSON.stringify(event));
                    reply = function (response) { return client.replyMessage(event.replyToken, response); };
                    if (event.type !== 'message' || event.message.type !== 'text' || event.source.type !== 'user') {
                        return [2 /*return*/, Promise.resolve(null)];
                    }
                    result = word_verifier.verifyWord(tokenizer, event.message.text);
                    if (!result.succeeded) return [3 /*break*/, 7];
                    firstKana = kana_util.firstKana(result.kana);
                    lastKana = kana_util.lastKana(result.kana);
                    wordInfoResponse = textResponse("\u5358\u8A9E: " + result.surface + "\u3001\u3088\u307F: " + result.kana + "\u3001\u6700\u5F8C\u306E\u6587\u5B57\u306F" + lastKana);
                    if (!(lastKana === 'ン')) return [3 /*break*/, 2];
                    return [4 /*yield*/, db.removeUserLastKana(event.source.userId)];
                case 1:
                    _a.sent();
                    return [2 /*return*/, reply([
                            wordInfoResponse,
                            textResponse('ンなので終了します'),
                            textResponse('再開するには適当な単語を言ってください')
                        ])];
                case 2: return [4 /*yield*/, db.obtainUserLastKana(event.source.userId)];
                case 3:
                    botLastKana = _a.sent();
                    if (!(!botLastKana || firstKana === botLastKana)) return [3 /*break*/, 5];
                    nextWord = (0, next_word_1.default)(tokenizer, lastKana);
                    if (!nextWord) {
                        return [2 /*return*/, reply(textResponse("参りました"))];
                    }
                    nextBotLastKana = kana_util.lastKana(nextWord.kana);
                    return [4 /*yield*/, db.updateUserLastKana(event.source.userId, nextBotLastKana)];
                case 4:
                    _a.sent();
                    return [2 /*return*/, reply([
                            wordInfoResponse,
                            textResponse(nextWord.word + " (" + nextWord.kana + " : " + nextBotLastKana + ") ")
                        ])];
                case 5: return [2 /*return*/, reply([
                        textResponse("\u524D\u306E\u5358\u8A9E\u306F" + botLastKana + "\u3067\u7D42\u308F\u308A\u307E\u3057\u305F\u304C\u3001" + event.message.text + " (" + result.kana + ") \u306F" + firstKana + "\u304B\u3089\u59CB\u307E\u308A\u307E\u3059"),
                        textResponse(botLastKana + "\u304B\u3089\u59CB\u307E\u308B\u5358\u8A9E\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044")
                    ])];
                case 6: return [3 /*break*/, 8];
                case 7:
                    if (result.error_reason === 'COMPOUND_NOUN') {
                        surfaces = result.tokens.map(function (token) { return token.surface_form; });
                        return [2 /*return*/, reply([
                                textResponse(event.message.text + "\u306F " + surfaces.join(' + ') + " \u306E\u8907\u5408\u8A9E\u3067\u3059\u3002"),
                                textResponse('実在する言葉かどうか判定できないので、複合語は使えません。')
                            ])];
                    }
                    else if (result.error_reason === 'UNKNOWN_WORD') {
                        return [2 /*return*/, reply([
                                textResponse(event.message.text + "\u306F\u8F9E\u66F8\u306B\u8F09\u3063\u3066\u3044\u307E\u305B\u3093\u3002"),
                                textResponse('辞書に載っている名詞しか使えません')
                            ])];
                    }
                    else if (result.error_reason === 'NOT_A_NOUN') {
                        return [2 /*return*/, reply([
                                textResponse("\u300C" + event.message.text + "\u300D\u306F" + result.pos + "\u3067\u3059\u3002"),
                                textResponse('名詞しか使えません。')
                            ])];
                    }
                    else if (result.error_reason === 'NOT_A_WORD') {
                        tokens = result.tokens.map(function (token) { return token.surface_form + " : " + word_verifier.friendlyPos(token); });
                        return [2 /*return*/, reply([
                                textResponse("\u5F62\u614B\u7D20\u89E3\u6790\u306E\u7D50\u679C\u3001\n" + tokens.join('\n') + "\n\u3068\u306A\u308A\u307E\u3057\u305F\u3002"),
                                textResponse("\u300C" + event.message.text + "\u300D\u306F\u540D\u8A5E\u3067\u306F\u306A\u3044\u306E\u3067\u3057\u308A\u3068\u308A\u306B\u306F\u4F7F\u3048\u307E\u305B\u3093\u3002")
                            ])];
                    }
                    else {
                        console.assert(false);
                        return [2 /*return*/, reply(textResponse("[\u5B9F\u7E3E\u89E3\u9664] \u6709\u80FD\u30C7\u30D0\u30C3\u30AC\u30FC\n\u3042\u306A\u305F\u306F\u3053\u306EBOT\u306E\u958B\u767A\u8005\u304C\u6C17\u3065\u304B\u306A\u304B\u3063\u305F\u30D0\u30B0\u3092\u898B\u3064\u3051\u51FA\u3057\u305F\uFF01"))];
                    }
                    _a.label = 8;
                case 8: return [2 /*return*/];
            }
        });
    });
}
function getTokenizerPromise() {
    console.log('Loading Kuromoji.js');
    return new Promise(function (resolve) {
        kuromoji_1.default.builder({ dicPath: dic_path }).build(function (err, tokenizer) {
            // tokenizer is ready
            resolve(tokenizer);
            console.log('Loaded Kuromoji.js');
            if (err) {
                console.error(err);
            }
        });
    });
}
getTokenizerPromise().then(function (tokenizer_) {
    tokenizer = tokenizer_;
    app.listen(port, function () { return console.log("Listening on :" + port); });
});
