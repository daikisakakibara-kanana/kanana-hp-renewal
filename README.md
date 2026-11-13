# 株式会社Kanana HPリニューアル

株式会社Kanana コーポレートサイトの刷新用リポジトリ。

## 方針
- トップは要点だけ（ひとこと紹介・相談の例・サービス3つ・会社・お問い合わせ）。詳しい内容は下層ページへ
- 文言は短く具体的に。「代表が直接〜」のような代表を売りにする表現は使わない
- エンジニア向けは、社員採用（SES）よりフリーランスへの案件紹介（Kanana Works）を主にする
- 小田原に本社がある会社として見せる

## ページ構成（`public/`、静的HTML・ビルド不要）
- `index.html` トップ
- `development.html` 受託開発（システム開発・ホームページ制作。できること・相談の例・流れ・料金・ご契約）
- `matching.html` エンジニア案件紹介（企業の方へ: SES・フリーランス紹介／エンジニアの方へ: Kanana Works）
- `contact.html` お問い合わせフォーム（仮置き。送信先は未設定）
- `company.html` 会社概要
- `news.html` お知らせ一覧、`news-*.html` 各記事
- `recruit.html` 採用情報
- `assets/css/style.css` 共通CSS、`assets/js/main.js` メニューとページ移動時のスクロール

ヘッダーとフッターは全ページ同じ内容を直接書いている。変更するときは全ページを直す。

### 文章を編集したら
日本語が言葉の途中で改行されないよう、文節の切れ目に `<wbr>` を入れている（CSS は `word-break: keep-all`）。
文章を書き換えたら、リポジトリの直下で次を実行する（何度実行しても同じ結果になる）。

    python3 tools/add_wbr.py public/*.html


## 画像
- `assets/img/hero-sea-pc.jpg`（と `-pc-1200`）: トップの写真（PC、21:9に切り抜き）。`hero-sea-sp.jpg`: スマホ用（元画像の 3:2 のまま）。元画像は Unsplash の `photo-1518837695005-2083093ee35b` と同じ写真
- `assets/img/representative.jpg`: 代表写真
- `assets/img/work-pioneer.jpg`: 実績（株式会社パイオニア）のスクリーンショット

## 公開（Cloudflare Pages）
Workers & Pages → Create → Pages → Connect to Git → このリポジトリ。Build command は空欄、Build output directory は `public`。

## 残タスク
- [ ] 料金は Claude Docs「Kanana 料金・プラン一覧」が正本。変えたらサイトと `docs/pricing.md` も直す
- [ ] お知らせ「ホームページ制作のご報告（株式会社パイオニア様）」の掲載についてクライアントの了承を得る（日付も公開日に合わせる）
- [ ] お問い合わせフォームの送信先を決め、`contact.html` の `data-endpoint` に設定する（Formspree など）。未設定のあいだは「準備中」と表示して送信しない
- [ ] 公開時に `<meta name="robots" content="noindex">` を外す
