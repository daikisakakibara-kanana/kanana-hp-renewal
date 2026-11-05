# 株式会社Kanana HPリニューアル

株式会社Kanana コーポレートサイトの刷新用リポジトリ。

## 方針
- トップは要点だけ（ひとこと紹介・相談の例・サービス3つ・会社・お問い合わせ）。詳しい内容は下層ページへ
- 文言は短く具体的に。「代表が直接〜」のような代表を売りにする表現は使わない
- エンジニア向けは、社員採用（SES）よりフリーランスへの案件紹介（Kanana Works）を主にする
- 小田原に本社がある会社として見せる

## ページ構成（`public/`、静的HTML・ビルド不要）
- `index.html` トップ（事業・相談の例・進め方・実績・お知らせ・会社・採用への導線）
- `business.html` 事業（事業内容4つ・相談の例・費用の目安・ご依頼の流れ・実績）
- `company.html` 会社概要（代表・会社情報・拠点）
- `news.html` お知らせ一覧
- `recruit.html` 採用情報（フリーランス案件紹介を主に、社員の募集）
- `assets/css/style.css` 共通CSS。色・文字サイズ・余白は冒頭の `:root` の値だけを使う

ヘッダーとフッターは全ページ共通の内容。変更するときは全ページを直す。お知らせを追加するときは `index.html` と `news.html` の両方に書く。

色は紺（文字）と青緑（アクセント1色）。書体は M PLUS 2（和文）と Outfit（英数字）。

## 公開（Cloudflare Pages）
Workers & Pages → Create → Pages → Connect to Git → このリポジトリ。Build command は空欄、Build output directory は `public`。

## 残タスク
- [ ] トップの横長写真（21:9）を選んで `public/assets/img/` に配置し、`index.html` の `hero__photo--empty` を差し替える
- [ ] 料金は仮の金額。確定させる（根拠と条件は `docs/pricing.md`）
- [ ] 制作実績（株式会社パイオニア）の掲載についてクライアントの了承を得る
- [ ] お問い合わせフォームの方式決定（現状は現行サイトのフォームへリンク）
- [ ] 公開時に `<meta name="robots" content="noindex">` を外す
