"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeUserLastKana = exports.obtainUserLastKana = exports.updateUserLastKana = void 0;
var pg_1 = require("pg");
// ===== データベースに関するモジュール =====
var pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});
var updateUserLastKana = function (userId, lastKana) {
    var sql = 'INSERT INTO "UserLastLetter" (user_id, last_letter) VALUES ($1, $2) ON CONFLICT (user_id) DO UPDATE SET last_letter = $2';
    return pool
        .query(sql, [userId, lastKana])
        .then(function (res) {
        // pass
    })
        .catch(function (err) {
        console.error("エラー: updateUserLastKana()");
        console.error(err);
    });
};
exports.updateUserLastKana = updateUserLastKana;
var obtainUserLastKana = function (userId) {
    var sql = 'SELECT last_letter from "UserLastLetter" WHERE user_id = $1 LIMIT 1';
    return pool
        .query(sql, [userId])
        .then(function (res) {
        return res.rows[0].last_letter;
    })
        .catch(function (_) {
        // pass
        // ゲーム開始時は必ずエラーになるのでエラーログは出力しない
    });
};
exports.obtainUserLastKana = obtainUserLastKana;
var removeUserLastKana = function (userId) {
    var sql = 'DELETE FROM "UserLastLetter" WHERE user_id = $1';
    return pool
        .query(sql, [userId])
        .then(function (_) {
        // pass
    })
        .catch(function (err) {
        console.error("エラー: removeUserLastKana()");
        console.error(err);
    });
};
exports.removeUserLastKana = removeUserLastKana;
