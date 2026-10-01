# Iluminato Eventos — Site Institucional

Site one-page premium para a **Iluminato Eventos** (Santiago/RS), construído com
HTML, CSS e JavaScript puros — sem dependências, sem etapa de build, pronto para
publicar em qualquer hospedagem estática.

## Como visualizar

Abra `index.html` direto no navegador, ou use um servidor local:

```powershell
# PowerShell (Windows)
Start-Process "C:\Users\Pichau\Desktop\ILUMINATO\index.html"
```

## Estrutura

```
ILUMINATO/
├── index.html          → página única (todas as seções)
├── css/styles.css      → identidade visual completa
├── js/content.js       → DADOS CONFIGURÁVEIS (telefone, WhatsApp, endereço, redes)
├── js/site.js          → interações (menu, reveal, lightbox, carrossel, parallax)
├── robots.txt
├── sitemap.xml
└── assets/
    ├── logo/           → logo oficial (wordmark, emblem, original)
    ├── hero/           → imagem do hero (+ versão mobile 640px)
    ├── sobre/          → equipe
    ├── casamentos/     → cerimônia ao ar livre
    ├── 15-anos/        → festa de 15 anos
    ├── eventos/        → festa infantil, salão decorado, noite (LOVE)
    ├── estrutura/      → área externa
    └── depoimentos/    → cards reais de clientes (PNG originais + JPG)
```

Cada foto existe em duas versões: `.png` (original preservada) e `.jpg`
(otimizada, usada pelo site).

## O que é editável sem tocar no layout

### 1. Contato e redes — `js/content.js`

- telefone, WhatsApp (número + mensagem automática)
- endereço e consulta do mapa
- Instagram e Facebook (preencha a URL para os ícones aparecerem no rodapé)
- tagline institucional

### 2. Textos e seções — `index.html`

Todos os textos estão em português e são fáceis de localizar:

| Seção | Como achar |
|---|---|
| Hero | `<section class="hero"` |
| Sobre | `id="espaco"` |
| Experiência | `id="experiencia"` |
| Eventos | `id="eventos"` (cards) |
| Estrutura | `id="estrutura"` (lista) |
| Galeria | `id="galeria"` (botões `data-lightbox`) |
| Depoimentos | `id="depoimentos"` (citações reais) |
| Localização | `id="localizacao"` |
| CTA final | `id="contato"` |

### 3. Fotos

Para trocar uma foto: substitua o arquivo `.jpg` mantendo o mesmo nome.

> **REGRA DE OURO:** usar exclusivamente fotografias reais da Iluminato.
> Nunca gerar, buscar ou substituir por imagens de IA ou bancos de imagens.
> Sem foto adequada? Use composição da identidade (fundo verde + ornamento),
> como já acontece nos cards de **Formaturas** e **Corporativos**.

## Antes de publicar

1. **Domínio:** troque `iluminatoeventos.com.br` em `index.html` (canonical,
   Open Graph, JSON-LD), `robots.txt` e `sitemap.xml` pelo domínio real.
2. **Imagens sociais:** o `og:image` usa a foto do hero — confirme se outra
   imagem rende melhor no compartilhamento.
3. **Instagram/Facebook:** preencha `social.instagram` e `social.facebook`
   em `js/content.js`.
4. **Estrutura:** a lista de `id="estrutura"` deve ser confirmada com o
   proprietário — ajuste os itens ao que realmente existe no espaço.
5. **Favicon:** hoje usa o logo original. Ideal: gerar 32×32 e 180×180.

## Acessibilidade e SEO

- H1 único, headings hierárquicos, `alt` descritivo em todas as fotos
- navegação por teclado, foco visível, lightbox com `Esc`/setas/swipe
- `prefers-reduced-motion` desliga zoom, parallax e animações
- dados estruturados `EventVenue` (SEO local), Open Graph e sitemap
- imagens com `loading="lazy"` (exceto hero, que tem `preload` + `fetchpriority`)

## Anotações de conteúdo

- Os depoimentos são citações reais, extraídas dos cards de clientes fornecidos.
- Nenhuma foto foi gerada: todas vêm dos assets originais do projeto.

# site-iluminato-1
