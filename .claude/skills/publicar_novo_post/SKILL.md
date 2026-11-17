---
name: publicar_novo_post
description: Publica um novo post no blog de samiranunes.com a partir de um tema ou link de referência. Escreve o post no padrão do site, mostra para aprovação, atualiza índice do blog, sitemap, llms.txt e links internos, faz commit e push no GitHub e envia para a Hostinger por FTP. Use quando pedirem para escrever, criar ou publicar um post, artigo ou texto no blog.
---

# Publicar novo post no blog

Entrada: um **tema** (ex.: "diferença entre make e do") ou um **link** de referência (artigo, vídeo, post do Instagram). Se vier um link, leia a página e use como inspiração de assunto. Nunca copie o texto: escreva um post original, na voz da Samira.

Siga as etapas na ordem. **Não publique nada sem aprovação explícita** (etapa 4).

## 1. Planejar

1. Leia os posts que já existem em `blog/*.html` para seguir o tom, a estrutura e as classes de CSS. O post de referência mais completo é `blog/como-responder-how-are-you.html`.
2. Defina e mostre à usuária, em poucas linhas:
   - **slug** (minúsculas, sem acento, palavras separadas por hífen, ex.: `diferenca-entre-make-e-do`). O arquivo será `blog/<slug>.html`.
   - **palavra-chave principal** (como um brasileiro buscaria no Google) e 3 a 5 secundárias.
   - **título** (H1), **title** (até ~60 caracteres, com a palavra-chave no começo) e **meta description** (140 a 160 caracteres).
   - **categoria** (`Gramática`, `Conversação`, `Pronúncia`, `Vocabulário` ou outra que faça sentido).
   - esboço dos H2.
3. Verifique se já existe post sobre o mesmo tema (`grep -ril "<palavra>" blog/`). Se existir, avise e sugira atualizar o post antigo em vez de criar outro.

## 2. Escrever o post

Copie a estrutura de `blog/como-responder-how-are-you.html` e troque o conteúdo. Regras:

**Voz e estilo**
- Português do Brasil, falando com "você", tom acolhedor e direto, como a professora explicando.
- A Samira morou mais de 5 anos nos EUA como tradutora e intérprete. Pode usar experiência pessoal **só quando for plausível e genérica**. Nunca invente fatos, números, estudos ou citações.
- Frases em inglês sempre em `<span class="en">`. Tradução nas listas com `<ul class="examples"><li><span class="en">…</span><span class="pt">…</span></li>`.
- Sem travessão (—) no texto. Use vírgula, dois-pontos ou ponto.

**Estrutura obrigatória (para SEO, GEO e AEO)**
1. Breadcrumb (`<nav class="breadcrumb">`).
2. `<header class="post-header">` com kicker da categoria, H1, autora, `<time datetime>` e tempo de leitura (~200 palavras por minuto).
3. Imagem de capa em `<picture>` com WebP e JPG, `width="1200" height="630"` e `alt` descritivo.
4. **Resposta rápida** logo no começo (`<div class="quick-answer">`): 2 a 4 frases que respondem direto à pergunta do título. É o trecho que o Google e as IAs costumam citar.
5. H2 em forma de pergunta ou de tópico claro. Use tabelas (`<div class="table-wrap"><table>`) para comparações, `<div class="tip">` para dicas e `<div class="mistake">` para erros comuns.
6. Exercício "Pratique agora" com `<div class="quiz"><details><summary>`.
7. "Perguntas frequentes" com `<div class="faq"><details>`, 3 a 5 perguntas reais de busca.
8. Conclusão curta com chamada para praticar.
9. `<aside class="post-cta">` com link para Aulas VIP ou inscrição e **pelo menos um "Leia também"** para outro post.
10. `<div class="author-box">` igual aos outros posts.
11. Pelo menos 1 link interno no corpo do texto para outro post ou página do site, quando fizer sentido.

**`<head>` obrigatório**
- `title`, `meta description`, `meta author`, `robots` (`index, follow, max-image-preview:large`), `canonical` com URL absoluta `https://samiranunes.com/blog/<slug>.html`.
- Open Graph completo (`og:type` article, `og:url`, `og:title`, `og:description`, `og:image` absoluto, `og:image:width/height/alt`, `article:published_time`, `article:modified_time`, `article:section`) e Twitter card.
- JSON-LD com `@graph` contendo **BlogPosting** (author e publisher completos, iguais ao post de referência, sem `@id` soltos), **BreadcrumbList** e **FAQPage**. O texto das perguntas no FAQPage tem que ser **idêntico** ao do FAQ visível na página.
- Datas no formato `2026-11-08T14:00:00-03:00` (horário de Brasília).
- Menu de navegação igual ao de `blog/index.html` (inclui Nivelamento).

## 3. Imagem de capa

- Tamanho 1200×630, arquivos `blog/img/<slug>.jpg` e `blog/img/<slug>.webp`.
- Peça a imagem à usuária. Se ela não tiver, ofereça criar uma capa simples no estilo das existentes (fundo escuro, título em destaque, nome "Teacher Samira Nunes") e mostre antes de usar.
- Para converter: JPG com `sips -s format jpeg -s formatOptions 82 -z 630 1200 entrada --out blog/img/<slug>.jpg`. WebP com `cwebp -q 80 blog/img/<slug>.jpg -o blog/img/<slug>.webp`. Se o `cwebp` não estiver instalado, peça permissão para rodar `brew install webp`.

## 4. Aprovação (obrigatória)

1. Abra o post no navegador do app (`file://` do arquivo ou um servidor local na pasta do projeto) e mostre à usuária.
2. Liste o que vai mudar: arquivos novos e alterados.
3. **Espere a usuária aprovar.** Faça os ajustes que ela pedir e mostre de novo. Sem um "pode publicar" claro, não siga para as próximas etapas.

## 5. Atualizar o resto do site

Depois de aprovado:

1. **`blog/index.html`**: novo card no **topo** da lista (logo abaixo do comentário `<!-- POSTS: o mais recente sempre no topo -->`) e novo item no **início** do array `blogPost` do JSON-LD.
2. **`sitemap.xml`**: nova `<url>` do post com `lastmod` = data de publicação. Atualize o `lastmod` de `https://samiranunes.com/blog/` para hoje.
3. **`llms.txt`**: nova linha na seção Blog (no topo da lista) com título, URL absoluta e um resumo de uma linha.
4. **Links internos**: adicione um "Leia também" para o novo post no `post-cta` de 1 ou 2 posts antigos do mesmo assunto.
5. Rode a checagem:
   ```bash
   python3 .claude/skills/publicar_novo_post/scripts/checar.py blog/<slug>.html
   ```
   Corrija tudo que aparecer como ERRO antes de continuar.

## 6. GitHub (commit e push)

```bash
git add blog/ sitemap.xml llms.txt
git commit -m "feat(blog): publish post <título curto>"
git push origin main
```

Inclua no final da mensagem a linha de coautoria indicada nas instruções da sessão. Se o push falhar por falta de login no GitHub, **não peça token nem senha**. Avise a usuária e diga para ela rodar `git push origin main` no terminal (o macOS vai pedir o login dela) ou configurar o GitHub Desktop.

## 7. Enviar para a Hostinger

As credenciais de FTP ficam em `~/.netrc` (configurado pela usuária). **Nunca peça, leia, mostre ou digite a senha.** Se o `~/.netrc` não existir, oriente a usuária a criá-lo, como na configuração original (`machine 147.79.84.183 login <usuario> password <senha>` e `chmod 600 ~/.netrc`).

A pasta do site no servidor é `domains/samiranunes.com/public_html` (**não** a raiz, que tem o aviso `DO_NOT_UPLOAD_HERE`).

Envie só os arquivos do post e os que foram alterados:

```bash
.claude/skills/publicar_novo_post/scripts/enviar_hostinger.sh \
  blog/<slug>.html blog/img/<slug>.jpg blog/img/<slug>.webp \
  blog/index.html sitemap.xml llms.txt <posts antigos alterados>
```

O script envia cada arquivo e depois confere se a URL do post responde 200 no site.

**Nunca apague arquivos no servidor.** Ele tem arquivos que não estão no repositório (404.html, favicons, inscricao.html, tools/).

## 8. Conferir e avisar

1. Abra `https://samiranunes.com/blog/<slug>.html` e `https://samiranunes.com/blog/` e confira se aparecem certos.
2. Diga à usuária:
   - o link do post;
   - que o commit foi feito e se o push foi para o GitHub ou ficou pendente;
   - sugestão: enviar o sitemap no Google Search Console (Sitemaps → `sitemap.xml`) e pedir a indexação da URL nova (Inspeção de URL → Solicitar indexação).
