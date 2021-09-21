'use strict'

const { Pool } = require('pg');

// ===== データベースに関するモジュール =====

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});

const updateUserLastKana = (userId, lastKana) => {
  console.log("start updating");
  const sql = 'INSERT INTO "UserLastLetter" (user_id, last_letter) VALUES ($1, $2) ON CONFLICT (user_id) DO UPDATE SET last_letter = $2';
  return pool.connect()
    .query(sql, [userId, lastKana])
    .then(res => {
      console.log(res);
    })
    .catch(err => {
      console.error("エラー: updateUserLastKana()");
      console.error(err);
    });
}

const obtainUserLastKana = (userId) => {
  console.log("start obtaining");
  const sql = 'SELECT last_letter from "UserLastLetter" WHERE user_id = $1 LIMIT 1';
  return pool.connect()
    .query(sql, [userId])
    .then(res => {
      console.log(res);
      return res.rows[0];
    })
    .catch(err => {
      console.error("エラー: obtainUserLastKana()");
      console.error(err);
    });
}

const removeUserLastKana = (userId) => {
  const sql = 'DELETE FROM "UserLastLetter" WHERE user_id = $1';
  return pool.connect()
    .query(sql, [userId])
    .then(res => {
      console.log(res);
    })
    .catch(err => {
      console.error("エラー: removeUserLastKana()");
      console.error(err);
    });
}

module.exports.updateUserLastKana = updateUserLastKana;
module.exports.obtainUserLastKana = obtainUserLastKana;
module.exports.removeUserLastKana = removeUserLastKana;