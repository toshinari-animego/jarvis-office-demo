# JARVIS OFFICE｜Revenue v0.6 キャラクター演出レビュー記録

作成日: 2026-11-03 JST
試作ブランチ: `feature/office-v0.6-character-motion`
対象: `index.html` / `docs/revenue-v0.6.html` / `docs/revenue-v0.6.js` / `docs/revenue-v0.6.css`
状態: **SOURCE_REVIEWED / UI_NOT_TESTED / MOBILE_NOT_TESTED / REVENUE_NO-GO**

## 今回の更新

- BOLT: 担当中の微小な充電・稲妻エフェクト（CSS。移動や完全な3Dアニメーションではない）
- SCOUT: ゆっくり浮遊・走査リング（CSS。マントの骨格アニメーションではない）
- TITAN: 重心移動・小刻みな踏み込み（CSS。関節独立制御ではない）
- ATLAS/PULSE: 正式な原画未採用のため、CSS仮造形の思考／数値処理エフェクト
- 各担当の短い吹き出しは**模擬演出**であり、実AIの作業報告ではない
- 直前担当が成果物を送り、現在担当が受け取るイメージを提示する。既存の成果物マーカー・経路表示を維持
- Ownerは専門AIキャラクターに見せかけず、別の「設計判断先」デスクとして表示
- 「演出ON/OFF」の操作を追加し、`prefers-reduced-motion`有効時には演出OFFを優先する
- 既存5シナリオ、HELD履歴と3回目例外ルール、`DESIGN_RESUMED`の設計専用解釈を維持
- 既存の「次へ」操作と別ID `nextRole`を維持。先の`id=next`重複不具合を再導入しない

## 静的確認の結果

| 監査点 | 結果 |
|---|---|
| JSパース（`import`除去後、V8構文コンパイルのみ） | SYNTAX_OK |
| HTMLの重複ID（公開トップ・サブページ） | 0件 |
| `next`ボタンイベントと`nextRole`表示欄の分離 | ソースで確認 |
| JavaScriptが参照する固定DOM IDの欠落 | 0件 |
| CSS定義の括弧数整合 | 整合 |
| 5役割のCSS演出定義 | あり |
| Reduced Motionの制御 | ソースで確認 |
| JS中の外部fetch、通信、localStorage等の呼出し | 未検出 |
| ライブAI・本番Revenue接続 | 設計上なし |

**これらは静的ソースの確認であり、ブラウザでのPASSではない。**

## 未実施／リリース後の手動確認

- iPhone Safariで「次へ」「前へ」「最初から」「シナリオ変更」「演出ON/OFF」をタップした結果（NOT_RUN）
- BOLT雷、SCOUT浮遊、TITAN重心、ATLAS/PULSE仮演出（NOT_RUN）
- 320px、375px、390px、768px、1024px、1156px表示・吹き出しの重なり（NOT_RUN）
- 「動きを減らす」端末設定時にアニメーションが抑制されること（NOT_RUN）
- HELDの色・文字・差戻しが設計停止と本番停止を混同させないこと（NOT_RUN）
- Owner演出は**実際のOwner承認が発生した**と受け取られないこと（NOT_RUN）

## 非変更・安全境界

- 以前のアニメーションデモ`office-v0.3.html`はそのまま保持
- v0.4 Draft PR #1と既存`feature/office-v0.4`、`jarvis-core`、C58復旧コード、Cloudflare/Stripeは変更しない
- GitHub Pagesに掲載する静的デモ。AI起動、外部送信、課金、Revenue/Production再開、C19認定、F01–F22正式受入の証拠にしない
- C19未認定・F01–F22正式受入0/22・本番およびRevenue NO-GO維持

これは正式なアニメーション受入書ではなく、ユーザーによる実機目視確認の前提記録である。
