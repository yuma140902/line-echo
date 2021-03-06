// ===== 仮名に関するユーティリティモジュール =====

interface CharToCharMap {
  [key: string]: string;
}

const han2zenMap: CharToCharMap = {
  'ｶﾞ': 'ガ', 'ｷﾞ': 'ギ', 'ｸﾞ': 'グ', 'ｹﾞ': 'ゲ', 'ｺﾞ': 'ゴ',
  'ｻﾞ': 'ザ', 'ｼﾞ': 'ジ', 'ｽﾞ': 'ズ', 'ｾﾞ': 'ゼ', 'ｿﾞ': 'ゾ',
  'ﾀﾞ': 'ダ', 'ﾁﾞ': 'ヂ', 'ﾂﾞ': 'ヅ', 'ﾃﾞ': 'デ', 'ﾄﾞ': 'ド',
  'ﾊﾞ': 'バ', 'ﾋﾞ': 'ビ', 'ﾌﾞ': 'ブ', 'ﾍﾞ': 'ベ', 'ﾎﾞ': 'ボ',
  'ﾊﾟ': 'パ', 'ﾋﾟ': 'ピ', 'ﾌﾟ': 'プ', 'ﾍﾟ': 'ペ', 'ﾎﾟ': 'ポ',
  'ｳﾞ': 'ヴ', 'ﾜﾞ': 'ヷ', 'ｦﾞ': 'ヺ',
  'ｱ': 'ア', 'ｲ': 'イ', 'ｳ': 'ウ', 'ｴ': 'エ', 'ｵ': 'オ',
  'ｶ': 'カ', 'ｷ': 'キ', 'ｸ': 'ク', 'ｹ': 'ケ', 'ｺ': 'コ',
  'ｻ': 'サ', 'ｼ': 'シ', 'ｽ': 'ス', 'ｾ': 'セ', 'ｿ': 'ソ',
  'ﾀ': 'タ', 'ﾁ': 'チ', 'ﾂ': 'ツ', 'ﾃ': 'テ', 'ﾄ': 'ト',
  'ﾅ': 'ナ', 'ﾆ': 'ニ', 'ﾇ': 'ヌ', 'ﾈ': 'ネ', 'ﾉ': 'ノ',
  'ﾊ': 'ハ', 'ﾋ': 'ヒ', 'ﾌ': 'フ', 'ﾍ': 'ヘ', 'ﾎ': 'ホ',
  'ﾏ': 'マ', 'ﾐ': 'ミ', 'ﾑ': 'ム', 'ﾒ': 'メ', 'ﾓ': 'モ',
  'ﾔ': 'ヤ', 'ﾕ': 'ユ', 'ﾖ': 'ヨ',
  'ﾗ': 'ラ', 'ﾘ': 'リ', 'ﾙ': 'ル', 'ﾚ': 'レ', 'ﾛ': 'ロ',
  'ﾜ': 'ワ', 'ｦ': 'ヲ', 'ﾝ': 'ン',
  'ｧ': 'ァ', 'ｨ': 'ィ', 'ｩ': 'ゥ', 'ｪ': 'ェ', 'ｫ': 'ォ',
  'ｯ': 'ッ', 'ｬ': 'ャ', 'ｭ': 'ュ', 'ｮ': 'ョ',
  '｡': '。', '､': '、', 'ｰ': 'ー', '｢': '「', '｣': '」', '･': '・'
};
const han2zenReg = new RegExp('(' + Object.keys(han2zenMap).join('|') + ')', 'g');

const small2bigMap: CharToCharMap = {
  'ァ': 'ア', 'ィ': 'イ', 'ゥ': 'ウ', 'ェ': 'エ', 'ォ': 'オ',
  'ヵ': 'カ', 'ヶ': 'ケ', 'ッ': 'ツ',
  'ャ': 'ヤ', 'ュ': 'ユ', 'ョ': 'ヨ', 'ヮ': 'ワ'
};
const small2bigReg = new RegExp('(' + Object.keys(small2bigMap).join('|') + ')', 'g');

// textの中の半角の文字(英数字・カタカナ)を全角に変換する
export const han2zen = (text: string) => {
  return text
    .replace(han2zenReg, c => han2zenMap[c])
    .replace(/[A-Za-z0-9]/g, c => String.fromCharCode(c.charCodeAt(0) + 0xFEE0))
    .replace(/ﾞ/g, '゛')
    .replace(/ﾟ/g, '゜');
}

// 小さいカタカナを大きいカタカナにする
export const small2big = (text: string) =>
  text.replace(small2bigReg, c => small2bigMap[c]);


// 最初のカタカナを取得する
// kanaTextはカタカナと長音(ー)のみから成る文字列
// 最初のカタカナとは
// リンゴ -> リ
// ジャンプ -> ジ
export const firstKana = (kanaText: string) => kanaText[0];

// 最後のカタカナを取得する
// kanaTextはカタカナと長音(ー)のみから成る文字列
// 最後のカタカナとは
// バナナ -> ナ
// リンゴ -> ゴ
// トレーナー -> ナ
// ニンジャ -> ヤ
// ジンジャー -> ヤ
// ウワッ -> ツ
export const lastKana = (kanaText: string) => {
  while (kanaText.slice(-1) === 'ー') {
    kanaText = kanaText.slice(0, -1);
  }
  const lastKana = kanaText.slice(-1);
  return small2big(lastKana);
}
