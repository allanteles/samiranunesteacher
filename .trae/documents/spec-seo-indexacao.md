# Especificação de Implementação: Indexação no Google e Identidade da Marca

**Projeto:** samiranunes.com (Teacher Samira Nunes)
**Objetivo:** fazer o site ser indexado pelo Google e aparecer em primeiro lugar nas buscas pelo nome "Teacher Samira Nunes" e variações.
**Escopo:** (1) preparação técnica para o Google Search Console e (2) dados estruturados e sinais de identidade da marca.

---

## 0. Instruções para a ferramenta de desenvolvimento

Você é um desenvolvedor web sênior especializado em SEO técnico. Implemente esta especificação no site estático descrito abaixo.

Regras obrigatórias:

1. **Não altere o design visual** (cores, fontes, layout, textos visíveis), exceto quando esta especificação pedir explicitamente.
2. **Não remova conteúdo existente.** Faça apenas inserções e ajustes pontuais no `<head>`, além de criar os arquivos novos indicados.
3. Todo texto novo em português do Brasil. **Nunca use travessões (traços longos, caracteres Unicode U+2014 e U+2013)** em nenhum texto; use vírgula, dois-pontos ou ponto.
4. Valide todo JSON-LD (JSON válido, sem vírgulas sobrando).
5. Ao final, entregue: lista de arquivos alterados ou criados, o diff de cada alteração e o resultado dos testes da seção 6.
6. Onde houver `{{TOKEN_...}}`, deixe o espaço reservado e avise no relatório que a dona do site precisa fornecer o valor. Nunca invente tokens.

---

## 1. Contexto técnico

- **Hospedagem:** Hostinger (Apache/LiteSpeed, suporta `.htaccess`). Raiz pública: `public_html/`.
- **Tipo de site:** HTML estático, sem CMS e sem build.
- **Domínio canônico:** `https://samiranunes.com` (sem www, com HTTPS).

Estrutura atual (referência; em produção vira `public_html/`, no repositório os arquivos ficam na raiz do projeto):

```
public_html/
├── index.html                 Página inicial
├── aulas-vip.html             Aulas particulares
├── materiais.html             Materiais e cursos
├── the-english-circle.html    Página do The English Circle
├── styles.css
├── script.js
├── sitemap.xml                Já existe
├── robots.txt                 Já existe
├── assets/
│   ├── logos/
│   │   ├── logo-white.png
│   │   ├── logo.png
│   │   ├── og-icon.png
│   │   ├── icon.png
│   │   ├── icon-white.png
│   │   └── icon-black.png
│   ├── favicons/
│   │   └── favicon-16x16.png   (único favicon atual)
│   ├── persona/               (fotos da Samira)
│   │   ├── photo-hold-mug.jpg
│   │   ├── photo-hold-book.jpg
│   │   ├── photo-my-book.jpg
│   │   ├── photo-seat.jpg
│   │   ├── photo-suite.jpg
│   │   └── photo-suite-edited.jpg
│   ├── avatar/                (fotos de depoimentos)
│   │   ├── cecilia.png
│   │   ├── danielly.png
│   │   ├── gabriel.png
│   │   ├── joao.png
│   │   ├── josi.png
│   │   ├── juciara.png
│   │   └── depoimentos.md
│   └── products/              (imagens dos produtos)
│       ├── book.png
│       ├── fluency-commmand.png
│       ├── independente-ingles.png
│       └── travel-course.png
└── blog/
    ├── index.html
    ├── blog.css
    ├── diferenca-entre-ive-been-e-i-was.html
    ├── entendo-ingles-mas-nao-consigo-falar.html
    └── img/
        ├── ive-been-ou-i-was.jpg
        ├── ive-been-ou-i-was.webp
        ├── entendo-ingles-mas-nao-consigo-falar.jpg
        └── entendo-ingles-mas-nao-consigo-falar.webp
```

Dados da marca:

| Campo | Valor |
|---|---|
| Nome | Samira Nunes |
| Nome de marca | Teacher Samira Nunes |
| Variações buscadas | Samira Nunes, Teacher Samira, Teacher Samira Nunes inglês |
| Profissão | Professora de inglês |
| Diferenciais | Mais de 15 anos de carreira; morou mais de 5 anos nos EUA como tradutora e intérprete; aulas online com foco em conversação e neurociência da aprendizagem |
| Instagram | https://www.instagram.com/samiranunes_teacher/ |
| Facebook | https://www.facebook.com/TeacherSamiraNunes |
| YouTube | https://www.youtube.com/teachersamiranunes |
| TikTok | https://vm.tiktok.com/ZMeak2FRv/ |
| Foto oficial | https://samiranunes.com/assets/persona/photo-hold-mug.jpg |
| Logo | https://samiranunes.com/assets/logos/og-icon.png |
| Formulário de inscrição | https://docs.google.com/forms/d/e/1FAIpQLSdjXtaFmyb0NbWZVFo7Jm8wRYstNIxMfv3YBfl4gnNmKUO0Qw/viewform |

---

## 2. Parte 1: preparação para o Google Search Console

### 2.1 Verificação de propriedade

A forma recomendada é por **DNS**, feita manualmente pela dona do site (seção 7). Como alternativa, implemente também a verificação por meta tag:

- Em `index.html`, dentro do `<head>`, logo após `<meta name="viewport">`, insira:

```html
<meta name="google-site-verification" content="{{TOKEN_GOOGLE}}">
<meta name="msvalidate.01" content="{{TOKEN_BING}}">
```

- Se os tokens não forem fornecidos, mantenha as linhas comentadas (`<!-- -->`) e registre a pendência no relatório.

### 2.2 Redirecionamentos e URL canônica (`.htaccess`)

Crie ou atualize `public_html/.htaccess`. Se já existir, **preserve as regras atuais** e acrescente estas no topo:

```apache
# Força HTTPS e domínio sem www
RewriteEngine On
RewriteCond %{HTTPS} off [OR]
RewriteCond %{HTTP_HOST} ^www\. [NC]
RewriteRule ^(.*)$ https://samiranunes.com/$1 [L,R=301]

# /index.html vira /
RewriteCond %{THE_REQUEST} \s/index\.html[\s?] [NC]
RewriteRule ^index\.html$ / [L,R=301]

# /blog/index.html vira /blog/
RewriteCond %{THE_REQUEST} \s/blog/index\.html[\s?] [NC]
RewriteRule ^blog/index\.html$ /blog/ [L,R=301]

# Endereço antigo do blog
Redirect 301 /blog.html /blog/

# Página de erro
ErrorDocument 404 /404.html
```

Crie também `public_html/404.html` com o mesmo cabeçalho, menu e rodapé do site (copie de `index.html`), contendo:

- H1: "Página não encontrada"
- Texto: "O conteúdo que você procura pode ter mudado de endereço. Que tal começar pelo blog?"
- Links para `/` e `/blog/`
- `<meta name="robots" content="noindex, follow">`

### 2.3 Sitemap

Atualize `sitemap.xml` para conter **todas** as páginas indexáveis, com URLs absolutas e canônicas:

- `https://samiranunes.com/` (não usar `/index.html`)
- `https://samiranunes.com/aulas-vip.html`
- `https://samiranunes.com/materiais.html`
- `https://samiranunes.com/blog/`
- Cada post em `blog/*.html`

Regras:

- `<lastmod>` no formato `AAAA-MM-DD`, com a data real da última alteração de cada página.
- Não incluir `404.html` nem páginas com `noindex`.
- Crie o script `tools/gerar-sitemap.py` (fora de `public_html`), que varre `public_html/*.html` e `public_html/blog/*.html`, ignora páginas com `noindex`, lê a data de `article:modified_time` quando existir (senão usa a data de modificação do arquivo) e regrava o `sitemap.xml`. O script será usado a cada post novo.

### 2.4 robots.txt

Conteúdo final:

```
User-agent: *
Allow: /
Disallow: /404.html

Sitemap: https://samiranunes.com/sitemap.xml
```

---

## 3. Parte 2: dados estruturados e identidade da marca

### 3.1 Página inicial (`index.html`)

**a) Título e descrição.** Mantenha o nome da marca no início:

```html
<title>Teacher Samira Nunes | Aulas de Inglês Online</title>
<meta name="description" content="Teacher Samira Nunes: aulas de inglês online com foco em conversação e neurociência da aprendizagem. Mais de 15 anos de experiência. Fale inglês com segurança.">
```

A descrição deve ter entre 140 e 160 caracteres. Remova a meta `keywords`, que o Google ignora.

**b) Canonical e Open Graph completos:**

```html
<link rel="canonical" href="https://samiranunes.com/">
<meta property="og:site_name" content="Teacher Samira Nunes">
<meta property="og:locale" content="pt_BR">
<meta name="twitter:card" content="summary_large_image">
```

Mantenha as tags `og:` que já existem.

**c) JSON-LD de identidade.** Insira logo antes de `</head>`:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://samiranunes.com/#website",
      "url": "https://samiranunes.com/",
      "name": "Teacher Samira Nunes",
      "alternateName": ["Samira Nunes", "Teacher Samira"],
      "inLanguage": "pt-BR",
      "publisher": { "@id": "https://samiranunes.com/#samira" }
    },
    {
      "@type": "Person",
      "@id": "https://samiranunes.com/#samira",
      "name": "Samira Nunes",
      "alternateName": "Teacher Samira Nunes",
      "jobTitle": "Professora de inglês",
      "description": "Professora de inglês com mais de 15 anos de carreira. Morou mais de cinco anos nos Estados Unidos trabalhando como tradutora e intérprete e ensina inglês online com foco em conversação e neurociência da aprendizagem.",
      "url": "https://samiranunes.com/",
      "image": "https://samiranunes.com/assets/persona/photo-hold-mug.jpg",
      "knowsLanguage": ["pt-BR", "en"],
      "sameAs": [
        "https://www.instagram.com/samiranunes_teacher/",
        "https://www.facebook.com/TeacherSamiraNunes",
        "https://www.youtube.com/teachersamiranunes",
        "https://vm.tiktok.com/ZMeak2FRv/"
      ]
    },
    {
      "@type": "EducationalOrganization",
      "@id": "https://samiranunes.com/#escola",
      "name": "Teacher Samira Nunes",
      "url": "https://samiranunes.com/",
      "logo": "https://samiranunes.com/assets/logos/og-icon.png",
      "founder": { "@id": "https://samiranunes.com/#samira" },
      "areaServed": "BR",
      "sameAs": [
        "https://www.instagram.com/samiranunes_teacher/",
        "https://www.facebook.com/TeacherSamiraNunes",
        "https://www.youtube.com/teachersamiranunes"
      ]
    }
  ]
}
</script>
```

**d) Texto visível com o nome completo.** O Google precisa ver o nome em texto, não só no logotipo em imagem. Logo abaixo do H1 "Fale inglês com segurança.", insira uma linha discreta, com o estilo do parágrafo já existente:

```html
<p class="hero-signature">Com Teacher Samira Nunes, professora de inglês há mais de 15 anos.</p>
```

Também troque o `alt` dos logotipos de "Teacher Samira Nunes Logo" para "Teacher Samira Nunes, professora de inglês".

### 3.2 Páginas `aulas-vip.html` e `materiais.html`

Em cada uma:

- `<link rel="canonical">` com a URL absoluta da própria página.
- Título no formato `[Assunto da página] | Teacher Samira Nunes`, com até 60 caracteres.
- Meta description própria, entre 140 e 160 caracteres, escrita a partir do conteúdo da página.
- Tags `og:title`, `og:description`, `og:url`, `og:image`, `og:site_name` e `og:locale`.
- JSON-LD `BreadcrumbList` (Início › Página).
- Em `aulas-vip.html`, acrescente JSON-LD `Service` com `"provider": {"@id": "https://samiranunes.com/#samira"}`, `"serviceType": "Aulas particulares de inglês online"`, `"areaServed": "BR"` e `"availableChannel"` apontando para o formulário de inscrição.

### 3.3 Posts do blog (`blog/*.html`) e `blog/index.html`

Ligue todos os autores à mesma entidade da página inicial. No JSON-LD de cada post, substitua o objeto `author` por:

```json
"author": { "@type": "Person", "@id": "https://samiranunes.com/#samira", "name": "Samira Nunes", "url": "https://samiranunes.com/" }
```

e o `publisher` por:

```json
"publisher": { "@id": "https://samiranunes.com/#escola" }
```

Nos posts, transforme o nome no `.author-box` em link para a página inicial:

```html
<a href="../index.html" rel="author">Teacher Samira Nunes</a>
```

### 3.4 Favicon e ícones (aparecem nos resultados do Google)

O Google exige um favicon de **pelo menos 48×48 px**. Hoje só existe um de 16×16.

- A partir de `assets/logos/og-icon.png`, gere: `favicon-48x48.png`, `favicon-192x192.png`, `apple-touch-icon.png` (180×180) e `favicon.ico` (16, 32 e 48 px) na **raiz** do site.
- Em **todas** as páginas, substitua a linha atual do favicon por:

```html
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png">
<link rel="icon" type="image/png" sizes="192x192" href="/favicon-192x192.png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
```

Use caminhos absolutos (começando com `/`) para funcionar dentro de `/blog/`.

### 3.5 Imagem de compartilhamento da página inicial

Se `og-icon.png` não tiver 1200×630 px, crie `assets/og/home.jpg` (1200×630, menos de 300 KB) no visual do site: fundo #292929, destaque em #D2B48C, texto "Teacher Samira Nunes" e "Aulas de inglês online". Aponte `og:image` da página inicial para essa imagem e acrescente `og:image:width` e `og:image:height`.

---

## 4. Fora do escopo

- Alterar textos de venda, preços ou o layout das páginas.
- Mexer no conteúdo dos posts (exceto o JSON-LD e o link do autor indicados acima).
- Instalar ferramentas de análise ou cookies.

---

## 5. Critérios de aceite

1. `http://samiranunes.com`, `http://www.samiranunes.com` e `https://www.samiranunes.com` redirecionam com 301 para `https://samiranunes.com/`.
2. `/index.html` redireciona com 301 para `/` e `/blog.html` para `/blog/`.
3. Uma URL inexistente devolve status 404 com a página `404.html`.
4. Toda página indexável tem `<title>` único, meta description única, canonical absoluto e tags Open Graph.
5. O JSON-LD de todas as páginas é válido e passa no Teste de Pesquisa Aprimorada do Google sem erros.
6. `sitemap.xml` lista todas as páginas indexáveis e nenhuma página com `noindex`.
7. Favicon de 48×48 ou maior acessível em `/favicon-48x48.png` e referenciado em todas as páginas.
8. Nenhum texto novo contém travessão (U+2014 ou U+2013).
9. O visual das páginas continua idêntico (compare capturas de tela antes e depois, no celular e no computador).

---

## 6. Testes que a ferramenta deve executar

```bash
# Redirecionamentos e status
curl -sI http://samiranunes.com | head -3
curl -sI https://www.samiranunes.com | head -3
curl -sI https://samiranunes.com/index.html | head -3
curl -sI https://samiranunes.com/blog.html | head -3
curl -sI https://samiranunes.com/pagina-que-nao-existe | head -3

# Arquivos essenciais
curl -s https://samiranunes.com/robots.txt
curl -s https://samiranunes.com/sitemap.xml
curl -sI https://samiranunes.com/favicon-48x48.png | head -1

# Travessões em arquivos novos ou alterados
grep -rnP "\x{2014}|\x{2013}" public_html --include=*.html
```

Valide também, localmente, cada bloco JSON-LD com um parser JSON e, se possível, no validador do schema.org.

---

## 7. Passos manuais da dona do site (depois do deploy)

1. **Search Console:** acesse search.google.com/search-console e adicione a propriedade do tipo **Domínio** `samiranunes.com`.
2. **Verificação DNS:** copie o registro TXT informado pelo Google e adicione em hPanel › Domínios › samiranunes.com › DNS / Nameservers › novo registro **TXT**, com nome `@`. Aguarde alguns minutos e clique em **Verificar**.
3. **Sitemap:** no Search Console, em **Sitemaps**, envie `sitemap.xml`.
4. **Solicitar indexação:** em **Inspeção de URL**, solicite a indexação da página inicial, de `/blog/` e de cada post.
5. **Bing:** em bing.com/webmasters, use a opção **Importar do Google Search Console**.
6. **Perfil da Empresa no Google:** crie em business.google.com, categoria "Professor de idiomas", atendimento online e link para o site.
7. **Redes sociais:** coloque `https://samiranunes.com` na bio do Instagram, no YouTube, no Facebook e no TikTok.

---

## 8. Formato do relatório final

1. Resumo do que foi feito.
2. Tabela de arquivos criados ou alterados.
3. Diffs.
4. Saída dos testes da seção 6.
5. Pendências (tokens não fornecidos, itens que dependem da dona do site).
