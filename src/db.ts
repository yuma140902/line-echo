import { Pool } from 'pg'

// ===== データベースに関するモジュール =====

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export const updateUserLastKana = (userId: string, lastKana: string): Promise<void> => {
  const sql = 'INSERT INTO "UserLastLetter" (user_id, last_letter) VALUES ($1, $2) ON CONFLICT (user_id) DO UPDATE SET last_letter = $2';
  return pool
    .query(sql, [userId, lastKana])
    .then(res => {
      // pass
    })
    .catch(err => {
      console.error("エラー: updateUserLastKana()");
      console.error(err);
    });
}

export const obtainUserLastKana = (userId: string): Promise<string | undefined> => {
  const sql = 'SELECT last_letter from "UserLastLetter" WHERE user_id = $1 LIMIT 1';
  return pool
    .query(sql, [userId])
    .then(res => {
      return res.rows[0].last_letter;
    })
    .catch(_ => {
      // pass
      // ゲーム開始時は必ずエラーになるのでエラーログは出力しない
    });
}

export const removeUserLastKana = (userId: string): Promise<void> => {
  const sql = 'DELETE FROM "UserLastLetter" WHERE user_id = $1';
  return pool
    .query(sql, [userId])
    .then(_ => {
      // pass
    })
    .catch(err => {
      console.error("エラー: removeUserLastKana()");
      console.error(err);
    });
}
