#!/usr/bin/env python3
"""检查 PNG txt 导出中 alpha 分布"""
import re
import sys

fname = sys.argv[1]
half = set()
for line in open(fname):
    m = re.match(r'(\d+),(\d+):\s*\((\d+),(\d+),(\d+)(?:\s+([\d.]+))?', line)
    if not m:
        continue
    x, y = int(m.group(1)), int(m.group(2))
    r, g, b = int(m.group(3)), int(m.group(4)), int(m.group(5))
    a = float(m.group(6)) if m.group(6) else 1.0
    if a > 0.01 and a < 0.99:
        half.add((x, y, a))
if half:
    xs = [t[0] for t in half]
    ys = [t[1] for t in half]
    print('半透明像素数:', len(half))
    print('x:[%d..%d] y:[%d..%d]' % (min(xs), max(xs), min(ys), max(ys)))
    for t in sorted(half)[:12]:
        print('  ', t)
else:
    print('无半透明像素')