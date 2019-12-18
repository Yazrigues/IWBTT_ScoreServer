'use strict'

const http = require('http');
const fs = require('fs');
const db = require('./database.json');

const addScoreData = (user) => {
  if (!db[user.name]) {
    db[user.name] = user
    // JSON.stringify(JSON 文字列に変換する値, 文字列化の手順の挙動を変更する関数, 空白文字の数)
    fs.writeFileSync('./database.json', JSON.stringify(db, null, 2))
  }
}

const server = http.createServer((req, res) => {
  // 現在時刻、リクエストが送られた IP情報をログ出力
  const now = new Date();
  console.info('[' + now + '] Requested by ' + req.connection.remoteAddress);
  // 200 という成功を示すステータスコードと共に、レスポンスヘッダを書き込む。
  res.writeHead(200, {
    'Content-Type': 'text/plain; charset=utf-8'
  });

  // req オブジェクトから HTTP メソッドの文字列 req.method を得て処理を分岐
  switch (req.method) {
    // 'GET' メソッドなら、その URL をコンテンツとしてレスポンスに返して終わり
    case 'GET':
      // fs モジュールの createReadStream でファイルの読み込みストリームを作成
      const rs = fs.createReadStream('./database.json');
      // レスポンスのオブジェクト res に対して pipe 関数でパイプする
      // pipe 関数を利用した場合は res.end 関数を呼ぶ必要がなくなる
      rs.pipe(res);
      break;
    // 'POST' の際には追加して送られてくるデータがあるので、URL返す + その処理。
    // req というリクエストオブジェクトも、Stream と同様にイベントを発行するオブジェクト
    // データを受けとった際には data というイベントが発生する。
    // データは細切れな状態で chunk 変数に入れて受け取り、元の rawData に繋げる。
    // 全て受信したら、文字列データを info ログとして出力。
    case 'POST':
      let rawData = '';
      req.on('data', (chunk) => {
        rawData = rawData + chunk;
      }).on('end', () => {
        // JSの decodeURIComponent関数。URLエンコードされた値を元のものに直す。
        // デコード完了をログ出力
        const decoded = decodeURIComponent(rawData);
        addScoreData(decoded);
        console.info('[' + now + '] スコア登録: ' + decoded);
        
        // res オブジェクトの write 関数は HTTP のレスポンスの内容を書き出す。
        res.write(
          '<!DOCTYPE html><html lang="ja"><body><h1>'
          + decoded
          + 'が登録されました</h1></body></html>');
        res.end();
      });
      break;
    default:
      break;
  }
}).on('error', (e) => {
  console.error('[' + new Date() + '] Server Error', e);
}).on('clientError', (e) => {
  console.error('[' + new Date() + '] Client Error', e);
});

// この HTTP が起動するポートを宣言
const port = 8000;
server.listen(port, () => {
  console.info('[' + new Date() + '] Listening on ' + port);
});
