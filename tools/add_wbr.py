"""日本語の文を、文節の切れ目でだけ折り返すための <wbr> を HTML に入れる。

使い方（リポジトリの直下で）:
    python3 tools/add_wbr.py public/*.html

- <main> と <footer> の中の文字だけを対象にする（タグ・属性・script・style・svg・option は触らない）
- すでに入っている <wbr> は一度消してから入れ直すので、何度実行しても同じ結果になる
- CSS 側で word-break: keep-all を指定しているので、<wbr> の位置以外では折り返さない
"""
import re
import sys

HIRA = re.compile(r'[ぁ-ゟ]')
OPEN = '「『（(〈《【'
CLOSE = '」』）)〉》】'
PUNCT = '、。，．！？!?・'
OKURI = 'いしみちきりけえせげびじ'


def kind(ch):
    if HIRA.match(ch):
        return 'h'
    if ch in OPEN:
        return 'open'
    if ch in CLOSE:
        return 'close'
    if ch in PUNCT:
        return 'punct'
    if ch.isspace():
        return 'space'
    return 'o'  # 漢字・カタカナ・英数字など


def inside_short_quote(text, i):
    """位置 i が 20 文字以内の「」の内側なら True（短い引用は1かたまりで扱う）"""
    left = max(text.rfind(c, 0, i + 1) for c in OPEN)
    if left < 0:
        return False
    if any(text.find(c, left, i + 1) >= 0 for c in CLOSE):
        return False
    rights = [text.find(c, i + 1) for c in CLOSE]
    rights = [r for r in rights if r >= 0]
    return bool(rights) and min(rights) - left <= 20


def segment(text):
    if not re.search(r'[぀-ヿ一-鿿]', text):
        return text
    out = []
    n = len(text)
    i = 0
    while i < n:
        ch = text[i]
        out.append(ch)
        if ch == '&':  # 文字参照の途中では区切らない
            m = re.match(r'&[#\w]+;', text[i:])
            if m:
                out.append(m.group(0)[1:])
                i += len(m.group(0))
                continue
        if i + 1 < n:
            a, b = kind(ch), kind(text[i + 1])
            prev = text[i - 1] if i > 0 else ''
            brk = False
            if a == 'punct' and b not in ('punct', 'close', 'space'):
                brk = True
            elif a == 'close' and b not in ('punct', 'close', 'space', 'h'):
                brk = True
            elif b == 'open' and a not in ('open', 'space'):
                brk = True
            elif a == 'h' and b == 'o':
                run_start = i
                while run_start > 0 and kind(text[run_start - 1]) == 'h':
                    run_start -= 1
                run = text[run_start:i + 1]
                if ch in 'おご':
                    pass  # 「お受け」「ご相談」の「お」「ご」の直後では区切らない
                elif len(run) == 1 and run in OKURI and run_start > 0 and kind(text[run_start - 1]) == 'o':
                    pass  # 「問い合わせ」「使い方」など、漢字にはさまれた送り仮名では区切らない
                else:
                    brk = True
            elif a == 'h' and b == 'h' and text[i + 1] in 'おご' and i + 2 < n and kind(text[i + 2]) == 'o':
                brk = True  # 「〜から｜ご相談」のように「お」「ご」の前で区切る
            if brk and inside_short_quote(text, i):
                brk = False
            if brk:
                out.append('<wbr>')
        i += 1
    # 短いカギカッコは途中で折り返さない（「、」の後ろでも折れないように nowrap で囲む）
    joined = re.sub(r'「[^「」<]{1,18}」', lambda m: f'<span class="nw">{m.group(0)}</span>', ''.join(out))
    # お問い合わせの帯の見出しは「から」までを1かたまりにする
    if joined == '<span class="nw">「これ、なんとかならない？」</span>から':
        return '<span class="nw">「これ、なんとかならない？」から</span>'
    return joined


SKIP = ('script', 'style', 'svg', 'option', 'textarea', 'title', 'head')


def process(html):
    html = html.replace('<wbr>', '')
    html = re.sub(r'<span class="nw">(「[^「」<]*」)</span>', r'\1', html)
    html = html.replace('<span class="nw">「これ、なんとかならない？」から</span>', '「これ、なんとかならない？」から')
    parts = re.split(r'(<[^>]+>)', html)
    in_scope = 0
    skip = []
    for idx, part in enumerate(parts):
        if part.startswith('<'):
            m = re.match(r'<(/?)([a-zA-Z0-9]+)', part)
            if not m:
                continue
            closing, tag = m.group(1) == '/', m.group(2).lower()
            if tag in ('main', 'footer'):
                in_scope += -1 if closing else 1
            if tag in SKIP:
                if closing:
                    if skip and skip[-1] == tag:
                        skip.pop()
                elif not part.endswith('/>'):
                    skip.append(tag)
            continue
        if in_scope > 0 and not skip and part.strip():
            parts[idx] = segment(part)
    return ''.join(parts)


if __name__ == '__main__':
    for path in sys.argv[1:]:
        with open(path, encoding='utf-8') as f:
            src = f.read()
        dst = process(src)
        if dst != src:
            with open(path, 'w', encoding='utf-8') as f:
                f.write(dst)
            print('updated', path)
