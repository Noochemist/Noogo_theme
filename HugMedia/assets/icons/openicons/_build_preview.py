import glob, os

ICON_THEME = {
    'lucide': ('Lucide', '#e11d48', '描边线形'),
    'tabler': ('Tabler Icons', '#2563eb', '描边线形'),
    'bootstrap': ('Bootstrap Icons', '#7952b3', '实心填充'),
    'heroicons': ('Heroicons', '#06b6d4', '描边线形'),
    'feather': ('Feather', '#f59e0b', '描边线形'),
}

home = ('home', 'house')
posts_n = ('file', 'file-text', 'document', 'newspaper', 'news', 'bookmark')
proj = ('folder', 'briefcase')
aboutrec = ('info', 'info-circle', 'star', 'heart', 'sparkles', 'magic', 'trending-up')
cats = ('tag', 'tags', 'category')
layout = ('chat', 'layout', 'grid', 'layers', 'duplicate', 'layout-grid', 'squares-2x2', 'card-heading', 'grid')

def suggest(name):
    s = []
    if name in home: s.append('首页')
    if name in posts_n: s.append('文章')
    if name in proj: s.append('项目')
    if name in aboutrec: s.append('关于/推荐')
    if name in cats: s.append('分类')
    if name in layout: s.append('布局/常用')
    return '、'.join(s) if s else '—'

rows_html = ''
total = 0
for d in ('lucide', 'tabler', 'bootstrap', 'heroicons', 'feather'):
    name, color, kind = ICON_THEME[d]
    files = sorted(glob.glob(f'icom/{d}/*.svg'))
    total += len(files)
    r = ''
    for f in files:
        base = os.path.basename(f)[:-4]
        svg = open(f, encoding='utf-8').read()
        svg = svg.replace('width="24"', 'width="22"').replace('height="24"', 'height="22"')
        svg = svg.replace('width="16"', 'width="22"').replace('height="16"', 'height="22"')
        r += f'<tr><td class="ico">{svg}</td><td><code>{base}.svg</code></td><td>{suggest(base)}</td></tr>\n'
    rows_html += f'<h2><span class="badge" style="background:{color}">{name}</span> <span class="kind">{kind} · {len(files)} 个</span></h2>\n'
    rows_html += '<table><tr><th>预览</th><th>文件名</th><th>建议用途</th></tr>\n' + r + '</table>\n'

html = f'''<!DOCTYPE html>
<html lang="zh-CN"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>导航图标候选集预览</title>
<style>
 body{{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"PingFang SC",sans-serif;background:#f7f7f9;color:#1f2328;margin:0;padding:24px;}}
 h1{{font-size:20px;}} h2{{font-size:16px;margin:34px 0 10px;border-bottom:1px solid #e3e3e6;padding-bottom:8px;}}
 .badge{{font-size:12px;padding:3px 10px;border-radius:10px;color:#fff;font-weight:600;}}
 .kind{{font-size:12px;color:#888;font-weight:400;}}
 .info{{color:#555;font-size:13px;margin:0 0 22px;line-height:1.7;background:#fffbe6;border:1px solid #ffe58f;border-radius:8px;padding:12px 16px;}}
 table{{border-collapse:collapse;width:100%;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.06);}}
 th,td{{border:1px solid #ececf0;padding:8px 12px;text-align:left;font-size:13px;}}
 th{{background:#f4f4f7;font-weight:600;color:#555;}}
 td.ico{{text-align:center;width:56px;}} td.ico svg{{color:#333;}}
 code{{background:#f1f1f4;padding:1px 6px;border-radius:4px;font-size:12px;}}
</style></head><body>
<h1>开源图标库 · 导航图标候选集</h1>
<p class="info">共 {len(ICON_THEME)} 个开源库、{total} 个导航相关图标。挑选后把文件复制到目标风格目录 <code>assets/icons/&lt;风格&gt;/</code> 下，并按菜单 <code>identifier</code> 命名（如 <code>home.svg</code>、<code>posts.svg</code>），渲染逻辑自动读取同名 SVG。本页为临时预览文件，挑选结束后可删除。</p>
{rows_html}
</body></html>'''
open('icom/_preview.html', 'w', encoding='utf-8').write(html)
print('generated', len(html), 'bytes,', total, 'icons')