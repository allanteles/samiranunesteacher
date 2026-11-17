#!/usr/bin/env python3
"""Checa um post do blog antes de publicar.
Uso: python3 .claude/skills/publicar_novo_post/scripts/checar.py blog/<slug>.html
"""
import json, os, re, sys
import xml.dom.minidom

SITE = "https://samiranunes.com"
erros, avisos = [], []

def erro(m): erros.append(m)
def aviso(m): avisos.append(m)

if len(sys.argv) != 2:
    sys.exit(__doc__)
path = sys.argv[1]
root = os.popen("git rev-parse --show-toplevel").read().strip() or "."
os.chdir(root)
slug = os.path.splitext(os.path.basename(path))[0]
url = f"{SITE}/blog/{slug}.html"
s = open(path, encoding="utf-8").read()

def meta(attr, name):
    m = re.search(rf'<meta {attr}="{re.escape(name)}" content="([^"]*)"', s)
    return m.group(1) if m else None

title = re.search(r"<title>(.*?)</title>", s, re.S)
if not title: erro("sem <title>")
elif len(title.group(1)) > 65: aviso(f"title com {len(title.group(1))} caracteres (ideal até ~60)")
desc = meta("name", "description")
if not desc: erro("sem meta description")
elif not 120 <= len(desc) <= 165: aviso(f"meta description com {len(desc)} caracteres (ideal 140 a 160)")
if f'<link rel="canonical" href="{url}">' not in s: erro(f"canonical diferente de {url}")
for p in ["og:title", "og:description", "og:image", "og:url", "article:published_time"]:
    if not meta("property", p): erro(f"falta {p}")
if meta("property", "og:url") not in (None, url): erro("og:url diferente do canonical")
if s.count("<h1") != 1: erro("o post deve ter exatamente um <h1>")
if "quick-answer" not in s: erro("falta a Resposta rápida (div.quick-answer)")
if "—" in s: aviso("há travessão (—) no texto")
if 'href="../nivelamento.html"' not in s: aviso("menu sem link para Nivelamento")

# Imagens
for ext in ("jpg", "webp"):
    img = f"blog/img/{slug}.{ext}"
    if not os.path.exists(img) and f"img/{slug}.{ext}" in s: erro(f"imagem não encontrada: {img}")
for m in re.findall(r'<img [^>]*>', s):
    if 'alt="' not in m: erro(f"imagem sem alt: {m[:80]}")

# Links internos
for href in re.findall(r'href="([^"#:]+\.html)"', s):
    alvo = os.path.normpath(os.path.join(os.path.dirname(path), href))
    if not os.path.exists(alvo): erro(f"link interno quebrado: {href}")

# JSON-LD
tipos, faq_ld = set(), []
for bloco in re.findall(r'<script type="application/ld\+json">(.*?)</script>', s, re.S):
    try:
        d = json.loads(bloco)
    except json.JSONDecodeError as e:
        erro(f"JSON-LD inválido: {e}"); continue
    for item in d.get("@graph", [d]):
        tipos.add(item.get("@type"))
        if item.get("@type") == "FAQPage":
            faq_ld = [q["name"] for q in item.get("mainEntity", [])]
        if item.get("@type") == "BlogPosting":
            if item.get("mainEntityOfPage") != url: erro("BlogPosting.mainEntityOfPage diferente do canonical")
            if "name" not in item.get("publisher", {}): erro("publisher do BlogPosting incompleto")
for t in ("BlogPosting", "BreadcrumbList", "FAQPage"):
    if t not in tipos: erro(f"JSON-LD sem {t}")
faq_html = [re.sub(r'<[^>]+>|"', "", q).strip()
            for q in re.findall(r'<div class="faq">.*?</div>', s, re.S)
            for q in re.findall(r"<summary>(.*?)</summary>", q, re.S)]
norm = lambda x: re.sub(r"[^\w]+", " ", x.lower()).strip()  # ignora aspas e pontuação
if faq_ld and sorted(map(norm, faq_ld)) != sorted(map(norm, faq_html)):
    erro("perguntas do FAQPage (JSON-LD) diferentes das do FAQ visível")

# Integração com o resto do site
idx = open("blog/index.html", encoding="utf-8").read()
if f'href="{slug}.html"' not in idx: erro("post não está no card do blog/index.html")
if url not in idx: erro("post não está no JSON-LD do blog/index.html")
sm = open("sitemap.xml", encoding="utf-8").read()
xml.dom.minidom.parseString(sm)
if f"<loc>{url}</loc>" not in sm: erro("post não está no sitemap.xml")
if os.path.exists("llms.txt") and url not in open("llms.txt", encoding="utf-8").read():
    erro("post não está no llms.txt")
outros = [f for f in os.listdir("blog") if f.endswith(".html") and f not in ("index.html", f"{slug}.html")]
if outros and not any(f'href="{slug}.html"' in open(f"blog/{f}", encoding="utf-8").read() for f in outros):
    aviso("nenhum post antigo tem link para o novo post")

for m in avisos: print("AVISO:", m)
for m in erros: print("ERRO: ", m)
print("OK, tudo certo." if not erros else f"\n{len(erros)} erro(s).")
sys.exit(1 if erros else 0)
