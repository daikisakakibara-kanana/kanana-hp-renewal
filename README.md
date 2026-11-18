# 株式会社Kanana コーポレートサイト

https://kanana-tech.jp （公開先: Cloudflare Pages。ドメインの契約はお名前.com、DNS は Cloudflare）

## 構成（`public/`、静的HTML・ビルド不要）
- `index.html` トップ
- `development.html` 受託開発（できること・相談の例・流れ・料金・ご依頼にあたって）
- `matching.html` エンジニア案件紹介（企業の方へ／エンジニアの方へ）
- `company.html` 会社概要
- `news.html` お知らせ一覧、`news-*.html` 各記事
- `recruit.html` 採用情報
- `contact.html` お問い合わせフォーム
- `404.html` 見つからないページ
- `_redirects` 旧サイト（STUDIO）のURLからの転送
- `robots.txt`、`sitemap.xml`
- `assets/css/style.css`、`assets/js/main.js`、`assets/img/`（`v2/` は各ページの見出しなどの写真）

ヘッダーとフッターは全ページに同じ内容を直接書いている。変更するときは全ページを直す。
お知らせを追加するときは、記事ページ（`news-*.html`）を作り、`news.html`・`index.html`（新しい3件）・`sitemap.xml` に追記する。

### 文章を編集したら
日本語が言葉の途中で改行されないよう、文節の切れ目に `<wbr>` を入れている（CSS は `word-break: keep-all`）。
文章を書き換えたら、リポジトリの直下で次を実行する（何度実行しても同じ結果になる）。

    python3 tools/add_wbr.py public/*.html

## 公開の手順（初回）
1. Cloudflare Pages: Workers & Pages → Create → Pages → Connect to Git → このリポジトリ。Build command は空欄、Build output directory は `public`
2. `〜.pages.dev` で表示を確認
3. Cloudflare に `kanana-tech.jp` を追加（Free）。読み込まれた DNS レコードに、メール（MX）や認証用の TXT が入っているか確認
4. お名前.com Navi →「ネームサーバーの変更」→「他のネームサーバーを利用」に Cloudflare のネームサーバー2つを設定
5. Cloudflare で Active になったら、Pages の Custom domains に `kanana-tech.jp` と `www.kanana-tech.jp` を追加
6. `https://kanana-tech.jp` で新サイトを確認してから、STUDIO の独自ドメイン設定を外し、有料プランを解約

以後は `main` に push すると自動で公開される。

## 画像
- `assets/img/hero-sea-*.jpg`: トップの写真
- `assets/img/representative.jpg`: 代表写真
- `assets/img/v2/*.jpg`: 各ページの写真（Unsplash、images.unsplash.com から取得、Unsplash License）
- `assets/img/ogp.jpg`: SNSで共有されたときの画像（1200×630）
- `assets/img/work-*.jpg`: お知らせ記事のスクリーンショット

## お問い合わせフォーム（Formspree）
- 送信先: daiki.sakakibara@kanana-tech.jp（Formspree のフォーム設定で指定。HTML にメールアドレスは書かない）
- 件名は `_subject`、迷惑投稿よけは `_gotcha`（見えない欄）。返信先はお客様が入力したメールアドレス（`email`）
- 自動返信は使わない（送信後の画面にお礼を表示する）
- フォームIDの設定: `public/contact.html` の `data-endpoint="https://formspree.io/f/<フォームID>"`

## 料金
正本は Claude Docs「Kanana 料金・プラン一覧」。変えたら `development.html`・`index.html`・`docs/pricing.md` も直す。

## 残タスク
- [x] Formspree のフォームを作成し、`contact.html` に設定（https://formspree.io/f/mnpddyql）
- [ ] 公開後、本番のフォームからテスト送信して daiki.sakakibara@kanana-tech.jp に届くか確認
- [ ] 料金・プラン一覧の修正案（入口のプラン・モニター価格など）の承認
- [ ] 公開後、Google Search Console に `sitemap.xml` を登録
