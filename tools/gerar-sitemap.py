#!/usr/bin/env python3
"""
Script para geração automática do sitemap.xml.
Varre as páginas HTML da raiz e de blog/, ignora páginas com noindex e 404,
obtém a data de modificação e regrava o sitemap.xml canônico.
"""

import os
import re
from datetime import datetime, timezone

def find_site_root():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    parent_dir = os.path.dirname(script_dir)
    # Verifica se existe public_html como subdiretório
    public_html = os.path.join(parent_dir, "public_html")
    if os.path.isdir(public_html):
        return public_html
    return parent_dir

def has_noindex(content):
    pattern = r'<meta\s+[^>]*name=["\']robots["\'][^>]*content=["\'][^"\']*noindex[^"\']*["\']'
    pattern_rev = r'<meta\s+[^>]*content=["\'][^"\']*noindex[^"\']*["\'][^>]*name=["\']robots["\']'
    return bool(re.search(pattern, content, re.IGNORECASE) or re.search(pattern_rev, content, re.IGNORECASE))

def get_lastmod(file_path, content):
    # Procura article:modified_time
    m = re.search(r'property=["\']article:modified_time["\']\s+content=["\']([0-9]{4}-[0-9]{2}-[0-9]{2})', content, re.IGNORECASE)
    if not m:
        m = re.search(r'content=["\']([0-9]{4}-[0-9]{2}-[0-9]{2})[^"\']*["\']\s+property=["\']article:modified_time["\']', content, re.IGNORECASE)
    if m:
        return m.group(1)

    # Procura dateModified no JSON-LD
    m = re.search(r'"dateModified"\s*:\s*"([0-9]{4}-[0-9]{2}-[0-9]{2})', content)
    if m:
        return m.group(1)

    # Fallback para a data de modificação do arquivo
    mtime = os.path.getmtime(file_path)
    return datetime.fromtimestamp(mtime, tz=timezone.utc).strftime("%Y-%m-%d")

def generate_sitemap():
    site_root = find_site_root()
    entries = []

    # Páginas na raiz
    for fname in sorted(os.listdir(site_root)):
        if fname.endswith(".html") and os.path.isfile(os.path.join(site_root, fname)):
            if fname == "404.html":
                continue
            path = os.path.join(site_root, fname)
            with open(path, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()
            if has_noindex(content):
                continue

            lastmod = get_lastmod(path, content)
            if fname == "index.html":
                url = "https://samiranunes.com/"
                order = 0
            else:
                url = f"https://samiranunes.com/{fname}"
                order = 1
            entries.append((order, url, lastmod))

    # Páginas no blog
    blog_dir = os.path.join(site_root, "blog")
    if os.path.isdir(blog_dir):
        for fname in sorted(os.listdir(blog_dir)):
            if fname.endswith(".html") and os.path.isfile(os.path.join(blog_dir, fname)):
                path = os.path.join(blog_dir, fname)
                with open(path, "r", encoding="utf-8", errors="ignore") as f:
                    content = f.read()
                if has_noindex(content):
                    continue

                lastmod = get_lastmod(path, content)
                if fname == "index.html":
                    url = "https://samiranunes.com/blog/"
                    order = 2
                else:
                    url = f"https://samiranunes.com/blog/{fname}"
                    order = 3
                entries.append((order, url, lastmod))

    # Ordena: home (0), páginas raiz (1), blog index (2), posts (3)
    entries.sort(key=lambda x: (x[0], x[1]))

    xml_lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
    ]
    for _, url, lastmod in entries:
        xml_lines.append(f"  <url><loc>{url}</loc><lastmod>{lastmod}</lastmod></url>")
    xml_lines.append("</urlset>\n")

    sitemap_path = os.path.join(site_root, "sitemap.xml")
    with open(sitemap_path, "w", encoding="utf-8") as f:
        f.write("\n".join(xml_lines))

    print(f"Sitemap gerado com sucesso em: {sitemap_path} ({len(entries)} URLs)")
    for _, url, lastmod in entries:
        print(f" - {url} ({lastmod})")

if __name__ == "__main__":
    generate_sitemap()
