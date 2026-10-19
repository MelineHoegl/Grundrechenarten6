"""Erzeugt einzeldatei/Rechen-Gipfel.html: die ganze Lernwelt in einer Datei.
Aufruf im Projektordner:  python3 tools/einzeldatei.py
"""
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
html = (ROOT / 'index.html').read_text(encoding='utf-8')

css = (ROOT / 'css' / 'style.css').read_text(encoding='utf-8')
html = html.replace('<link rel="stylesheet" href="css/style.css">', '<style>\n' + css + '\n</style>')


def inline_script(match):
    src = match.group(1)
    code = (ROOT / src).read_text(encoding='utf-8')
    return '<script>\n' + code.replace('</script', '<\\/script') + '\n</script>'


html = re.sub(r'<script src="(js/[^"]+)"></script>', inline_script, html)
out = ROOT / 'einzeldatei' / 'Rechen-Gipfel-6.html'
out.parent.mkdir(exist_ok=True)
out.write_text(html, encoding='utf-8')
print('geschrieben:', out)
