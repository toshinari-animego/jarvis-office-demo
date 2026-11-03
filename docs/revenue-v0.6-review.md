# JARVIS OFFICE｜Revenue v0.6 表示改善レビュー記録

更新日: 2026-11-03 JST
対象ブランチ: `feature/office-revenue-v0.6`
対象ファイル: `docs/revenue-v0.6.html`, `docs/revenue-v0.6.css`, `docs/revenue-v0.6.js`
対象元版: `feature/office-v0.4` / Draft PR #1（変更なし）
判定: **SOURCE_PREPARED / BROWSER_NOT_RUN / MOBILE_NOT_RUN / CI_NOT_RUN / NO-GO**

## 1. 今回の変更内容（実装したソース仕様）

- 既存採用原画のBOLT・SCOUT・TITANを`../approved-image-data.js`から利用し、画像データ本体は変更しない。
- ATLAS・PULSEは正式承認されたキャラクター画像がないため、仮のCSS造形とラベルで識別する。
- 通常の役割引き継ぎ、HELD→修正→独立レビュー→設計復帰、通常2回→例外3回目、例外不許可、安全保留の5シナリオを持つ。
- 実際の担当キャラクターの場所に、成果物を表すマーカーが移動するようなCSS遷移を定義（表示上のみ）。
- 前担当から現担当へのルートを表示し、選択した工程に移動できるタイムラインボタンを追加。
- モバイル向けにボタン最小高さ、タイムラインの横スクロール、説明文、縮小表示を調整。
- OSの`prefers-reduced-motion`ではキャラクターとマーカーの動きを無効化するCSSを定義。
- HELDから戻るまでの設計修正中は、見かけの担当・工程進行に関わらず`HELD継続`を表示する。
- 第3回目は画面中で**「仮定のOwner承認」**と明記。表示操作は実際の承認を発行しない。
- `execution_permission=DENIED`、Revenue NO-GO、送信・課金・実行再試行0回の表示を維持する。

## 2. 未実施の検証と目視確認項目

以下は**すべてNOT_RUN**。結果が未確認であることをPASS扱いしない。

| 項目 | 確認のポイント | 現在 |
|---|---|---|
| iPhone Safari 320px相当 | キャラクター5役割が画面外へはみ出さない・マーカー視認性 | NOT_RUN |
| iPhone Safari 375px相当 | ボタンのタップ領域・ルート表示の重なり | NOT_RUN |
| iPhone Safari 390px相当 | タイムラインのスクロールと選択状態 | NOT_RUN |
| iPad Safari 768px相当 | 3＋2のキャラクター配置とコンソールの順序 | NOT_RUN |
| PC Chrome 1024px相当 | 司令基地と横のInspectorの分割表示 | NOT_RUN |
| PC Chrome 1156px相当 | 担当間のマーカー移動・高さ・余白 | NOT_RUN |
| 正常連携 | BOLT→SCOUT→ATLAS→PULSE→BOLT→TITAN→Ownerの画面切替 | NOT_RUN |
| 修正成功 | HELD継続表示→TITANレビュー→設計のみ復帰 | NOT_RUN |
| 第3回審査 | 2/2時の保留、架空のOwner承認、3/3、実行権限DENIED | NOT_RUN |
| 第3回拒否 | 根拠なしならHELD継続・Owner報告 | NOT_RUN |
| 安全保留 | 送信結果UNKNOWNで再試行や設計復帰の画面を出さない | NOT_RUN |
| アクセシビリティ | reduced motion、キーボード、スクリーンリーダー、コントラスト | NOT_RUN |
| 実接続 | Provider / Cloudflare / Secret / D1等との非接続を独立環境で確認 | NOT_RUN |

## 3. 実装境界（重要）

- 本ページは`docs/`配下の静的表示試作で、v0.4の`index.html`、`app.js`、`simulation.js`、キャラクター画像本体は変更していない。
- JavaScriptはローカルの合成シナリオ・DOM表示操作のみを想定。AI・ネットワーク・認証情報・Live Revenue・課金・Webhook・投稿等を要求しない。
- HTMLのCSPは`connect-src 'none'`、スクリプト・スタイル・画像は`'self'`に制限した設計。
- 本番の通信遮断や隔離を実証したという意味ではない。ブラウザ実行もC19の承認条件を尊重して未実施。
- `.github/workflows/v04-motion-tests.yml`のpush対象は`feature/office-v0.4`であり、今回の作業ブランチではない。既存PR #1の更新、mainマージ、GitHub Pages公開設定変更はしない。
- 仮のOwner承認を実物の承認と誤認させない。将来の証拠付きUI試験ではOwnerの明示的なレビューが必要。
- 実コードの動作保証はしていないため、表示・操作・アニメーション・崩れの問題が見つかれば公開前に修正する。

## 4. 今後の受入基準（未実施）

1. 確認する機器・隔離条件と固定コミットを明示し、C19およびOwner個別承認の有無を判断する。
2. 許可された範囲で、上記デバイス幅と5シナリオをブラウザから目視検証する。
3. 文字重なり、色覚・低動作モード、HELD表示と実行許可の誤認を修正し、変更前後の画面証拠を残す。
4. TITANレビューとOwnerによる**表示設計の採否**を記録。デモを本番接続やRevenue再開と混同しない。
5. 本番／Revenue／CI／C58の正式受入は引き続き別工程でNO-GO。

この資料の保存自体はテスト実行や認定ではない。
