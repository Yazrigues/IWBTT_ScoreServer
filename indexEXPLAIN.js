'use strict'

// Node.js における HTTP のモジュールの読み込み
const http = require('http');

// httpモジュールの機能でサーバーを作成
// サーバーにリクエストがあった際に呼び出される無名関数を設定
// この無名関数は、リクエストを表すオブジェクトの引数 req と、同様にレスポンスを表す res を受け取る
const server = http.createServer((req, res) => {
  const now = new Date();
  // req.connection.remoteAddress は、リクエストが送られた IP 情報を出力する
  console.info('[' + now + '] Requested by ' + req.connection.remoteAddress);
  // リクエストがきた際の挙動。
  // 200 という成功を示すステータスコードと共に、 レスポンスヘッダを書き込む.
  // 「内容の形式が text/plain という通常のテキスト」「文字セットが utf-8」という情報   
  res.writeHead(200, {
    'Content-Type': 'text/html; charset=utf-8'
  });

    // req オブジェクトから HTTP メソッドの文字列 req.method を得て処理を分岐

  switch (req.method) {
    // 'GET' メソッドなら、その URL をコンテンツとしてレスポンスに返して終わり
    case 'GET':
      // fs モジュールの createReadStream でファイルの読み込みストリームを作成
      const fs = require('fs');
      const rs = fs.createReadStream('./form.html');
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
        // data があった場合の処理を定義
        // JSの decodeURIComponent関数。URLエンコードされた値を元のものに直す
        const decoded = decodeURIComponent(rawData);
        // 登録日時 + スコアデータ をログに残す
        console.info('[' + now + '] スコア登録: ' + decoded);
        
        // 投稿内容をHTMLの見出しとして表示
        // res オブジェクトの write 関数は HTTP のレスポンスの内容を書き出す。
        // ここではリクエストヘッダの user-agent の中身をレスポンスの内容として書き出している。
        res.write(
          '<!DOCTYPE html><html lang="ja"><body><h1>'
          + decoded
          + 'が投稿されました</h1></body></html>');
        // 処理の終了時に end メソッドを指定、レスポンスの書き出しを終了 (参：Class: http.ServerResponse)
        res.end();
      });
      break;
    default:
      break;
  }
// 'error' という文字列のイベントが発生 → サーバーエラーが発生としてエラーログを出力。
// Stream と同様、HTTP サーバーがイベントを発行する存在として作られているためこのように記述
}).on('error', (e) => {
  console.error('[' + new Date() + '] Server Error', e);
// 'clientError' という文字列のイベントが発生 → クライアントエラーとしてエラーログに出力。
}).on('clientError', (e) => {
  console.error('[' + new Date() + '] Client Error', e);
});

// この HTTP が起動するポートを宣言
const port = 8000;
// サーバーを起動、起動した際に実行する関数を渡す。
// サーバーを待ち受け状態(特定のポートからのリクエストに聞き耳を立てる)にするため「listen」 
server.listen(port, () => {
  console.info('[' + new Date() + '] Listening on ' + port);
});


const addUser = (user) => {
  const db = require('./database.json') // 実はこれで読める
  if (!db[user.id]) {
    db[user.id] = user
    fs.writeFileSync(__dirname + '/database.json', JSON.stringify(db, null, 2))
  }
}

addUser({id: 'test1'})
addUser({id: 'test2'})
addUser({id: 'test3'})