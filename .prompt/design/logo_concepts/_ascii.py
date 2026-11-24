#!/usr/bin/env python3
"""ASCII 可视化 PNG 文本转储"""
import re
import sys

fname = sys.argv[1]
mode = sys.argv[2] if len(sys.argv) > 2 else 'gray'
rows = {}
for line in open(fname):
    m = re.match(r'(\d+),(\d+):\s*', line)
    if not m:
        continue
    x, y = int(m.group(1)), int(m.group(2))
    rest = line[m.end():]
    m2 = re.search(r'srgba?\((\d+)[,\s](\d+)[,\s](\d+)(?:[,\s]([\d.]+))?', rest)
    if m2:
        r, g, b = int(m2.group(1)), int(m2.group(2)), int(m2.group(3))
        a = float(m2.group(4)) if m2.group(4) else 1.0
    else:
        m3 = re.search(r'graya?\((\d+)[,\s]([\d.]+)', rest)
        if m3:
            gv = int(m3.group(1))
            a = float(m3.group(2)) if len(m3.groups()) > 1 and m3.group(2) else 1.0
            r = g = b = gv
        else:
            m4 = re.search(r'\((\d+)[,\s](\d+)[,\s](\d+)', rest)
            if m4:
                r, g, b = int(m4.group(1)), int(m4.group(2)), int(m4.group(3))
                a = 1.0
            else:
                continue
    if a < 0.5:
        ch = ' '  # transparent
    else:
        if mode == 'dark':
            # 正确: 深色=黑/粉色, 白背景
            ch = '#' if (r < 100 and g < 100 and b < 100) else ('W' if r > 230 and g > 230 and b > 230 else 'o')
        else:
            ch = '#' if (r + g + b) / 3 < 100 else ('W' if r > 230 and g > 230 and b > 230 else 'o')
    rows[(x, y)] = ch

# 找出尺寸
maxx = max(k[0] for k in rows) + 1
maxy = max(k[1] for k in rows) + 1
for y in range(maxy):
    print(''.join(rows.get((x, y), ' ') for x in range(maxx)))