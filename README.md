# Iluminato — Espaço de Eventos

Site institucional + geração de leads, construído a partir do PRD v1.0.
Stack: **HTML + CSS + JavaScript puros**, sem dependências, sem build obrigatório.

---

## 1. Como abrir o site

Basta abrir o arquivo `index.html` no navegador (duplo clique).

Para testar do jeito ideal (recomendado antes de publicar):

```powershell
# na pasta do projeto
powershell -ExecutionPolicy Bypass -File _build\servir-local.ps1
# abra http://localhost:8080
```

> Um servidor local evita que o navegador bloqueie carregamentos por segurança
> (`file://`) e permite testar lightbox, menu e formulário com realismo.

---

## 2. Estrutura

```text
ILUMINATO/
├── index.html            HOME
├── espaco.html           O ESPAÇO
├── eventos.html          EVENTOS
├── casamentos.html       └── Casamentos
├── celebracoes.html      └── Celebrações
├── corporativos.html     └── Corporativos
├── galeria.html          GALERIA
├── experiencia.html      EXPERIÊNCIA
├── sobre.html            SOBRE
├── faq.html              FAQ
├── contato.html          CONTATO
│
├── css/styles.css        Design system completo
├── js/site.js            Menu, animações, lightbox, formulário, analytics
├── assets/img/           Imagens otimizadas (WebP/JPEG)
│
├── robots.txt
├── sitemap.xml           Gerado automaticamente
│
└── _build/               FONTE das páginas (edite aqui)
    ├── build.ps1         Gera os HTML finais + sitemap
    ├── layout.html       Head, schema, estrutura base
    ├── header.html       Menu
    ├── footer.html       Rodapé + botão flutuante de WhatsApp
    └── pages/*.html      Conteúdo de cada página
```

### Como funciona a geração

Os arquivos `.html` da raiz são **gerados**. O conteúdo editável fica em
`_build/pages/` e o menu/rodapé em `_build/header.html` e `_build/footer.html`.

Depois de editar qualquer arquivo dentro de `_build/`, rode:

```powershell
powershell -ExecutionPolicy Bypass -File _build\build.ps1
```

Isso reescreve os 11 HTML da raiz e o `sitemap.xml`.

> **Atenção:** não edite os HTML da raiz manualmente — a próxima execução do
> build sobrescreve. Edite em `_build/` e rode o build.

Cada página em `_build/pages/` começa com um bloco de metadados:

```html
<!--
titulo: ...
descricao: ...
og: assets/img/hero-casal-1440.jpg
-->
```

O build usa esse bloco para preencher `<title>`, meta description, Open Graph,
canonical e URL do sitemap.

---

## 3. Placeholders a substituir antes de publicar

Todas as informações de contato estão marcadas com comentários `<!-- TROCAR: ... -->`.
Busque por **`TROCAR`** no projeto para localizar todos.

| Onde | O quê | Onde editar |
|---|---|---|
| Domínio | `https://www.seudominio.com.br/` | `_build/build.ps1` (variável `$base`) e `robots.txt` |
| WhatsApp | `550000000000` | `_build/header.html`, `_build/footer.html`, CTAs em `_build/pages/*.html` |
| Telefone | `(00) 0000-0000` / `+550000000000` | `_build/footer.html`, `_build/pages/contato.html` |
| E-mail | `contato@seudominio.com.br` | `_build/layout.html` (schema), `header/footer`, `contato.html` |
| Endereço | `Rua Exemplo, 000 — Bairro`, `[Cidade]`, `[UF]`, CEP | `_build/layout.html`, `sobre.html`, `contato.html` |
| Coordenadas | `latitude/longitude` | `_build/layout.html` (JSON-LD) |
| Instagram | `@seuperfil` / `instagram.com/seuperfil` | `_build/footer.html`, `contato.html`, `_build/layout.html` |
| Horários | `Seg a Sex, 9h às 19h` | `_build/header.html`, `footer.html`, `contato.html`, schema |
| Capacidade | `[XXX] convidados` | `espaco.html`, `eventos.html`, `faq.html` |
| Google Maps | link de busca | `_build/pages/contato.html` |
| Google Analytics | `ga4Id: ""` | `js/site.js` (primeiras linhas) |
| Formulário | `var ENDPOINT = ""` | `js/site.js` (função `initForm`) |

> Regra de ouro: **não publique números, endereço ou capacidade inventados.**
> Onde o dado ainda não existe, mantemos `[XXX]` ou `[Cidade]` para você preencher.

---

## 4. Conectar o formulário (RF03)

O formulário já valida **nome, WhatsApp e tipo de evento** (mais e-mail, se preenchido),
mostra mensagens de erro acessíveis (`aria-invalid` + `role="alert"`) e dispara
`contact_form_start` / `contact_form_submit`.

Para receber os envios, abra `js/site.js` e preencha:

```js
var ENDPOINT = "https://formspree.io/f/SEU_CODIGO";
```

Aceita qualquer serviço que devolva JSON (Formspree, Basin, Web3Forms, endpoint
próprio). Enquanto `ENDPOINT` for `""`, o site roda em modo demonstração e apenas
exibe a confirmação.

---

## 5. Google Analytics 4 (RF06 / §31)

Em `js/site.js`:

```js
window.ILUMINATO = { ga4Id: "G-XXXXXXXXXX" };
```

Eventos já disparados:

| Evento | Quando |
|---|---|
| `page_view` | automaticamente pelo gtag |
| `whatsapp_click` | botão flutuante, header, footer, CTAs |
| `schedule_visit_click` | botões "Agendar uma visita" |
| `contact_form_start` | primeiro foco no formulário |
| `contact_form_submit` | envio bem-sucedido (envia `event_type`) |
| `gallery_open` | lightbox (índice e legenda) |
| `phone_click` | telefone |
| `instagram_click` | Instagram |

Enquanto o ID estiver vazio, nada é enviado — os eventos aparecem no console
em modo `debug`.

---

## 6. Fotos

As imagens em `assets/img/` são **fotos reais do espaço** fornecidas na pasta de
origem, já redimensionadas e comprimidas (JPEG ~76–85 de qualidade, com versões
pequenas e grandes para `srcset`).

Para trocar:

1. coloque os novos arquivos em `assets/img/`;
2. atualize `src`/`srcset` em `_build/pages/*.html`;
3. mantenha `width`, `height` e `alt` descritivos (evita CLS e melhora SEO);
4. rode o build.

Orientação do PRD: alta resolução, luz natural, tons quentes, baixa saturação,
pessoas reais, composição arquitetônica. Evitar HDR, filtros pesados e banco de
imagens genérico.

---

## 7. Depoimentos (§16)

O site **não publica depoimentos inventados**. O componente `.testimonial` está
pronto e documentado em comentários dentro de `_build/pages/index.html` e
`_build/pages/casamentos.html`. Basta descomentar e inserir avaliações reais,
autorizadas pelos autores.

---

## 8. CMS / edição pelo cliente (§32)

Para editar textos sem tocar em código, a troca mais simples é publicar em uma
hospedagem com **CMS estático** (Netlify CMS / Decap, TinaCMS ou Payload) apontando
para `_build/pages/*.html`. Todo o conteúdo textual está isolado nessa pasta —
não há texto embarcado em JavaScript.

Se a hospedagem for simples (Hostinger, Locaweb), dá para editar direto os HTML
gerados pelo painel da hospedagem; nesse caso, **desligue o build** depois da
primeira edição para não sobrescrever.

---

## 9. Checklist antes de publicar

- [ ] Substituir todos os placeholders da seção 3
- [ ] Rodar `_build\build.ps1` e conferir `sitemap.xml`
- [ ] Trocar o domínio em `robots.txt` e no `$base` do build
- [ ] Preencher `ga4Id` em `js/site.js`
- [ ] Preencher `ENDPOINT` do formulário
- [ ] Substituir as fotos e revisar todos os `alt`
- [ ] Preencher capacidade real em `[XXX]`
- [ ] Publicar no Google Business Profile (endereço, telefone, horário, fotos)
- [ ] Pedir avaliações reais e autorizadas para o Google
- [ ] Testar desktop, tablet e celular
- [ ] Testar WhatsApp, telefone e formulário em produção

---

## 10. Padrões técnicos adotados

- **Responsividade (RF05):** breakpoints em 1180 / 1024 / 860 / 640 px, menu
  hambúrguer com foco preso, `Esc` para fechar e bloqueio de scroll.
- **SEO (RF06):** `<title>` e meta description únicos, H1 único por página,
  canonical, Open Graph + Twitter Card, JSON-LD `EventVenue` (SEO local),
  `alt` em todas as imagens, `sitemap.xml` e `robots.txt`.
- **Acessibilidade (WCAG 2.1 AA):** skip link, foco visível, semântica correta,
  labels associados, erros de formulário anunciados por `role="alert"`,
  lightbox em `role="dialog"` com navegação por teclado, contraste auditado.
- **Performance:** imagens redimensionadas e comprimidas, `srcset`/`sizes`,
  `loading="lazy"` + `decoding="async"`, `fetchpriority="high"` no hero,
  fontes com `display=swap` e preconnect, sem bibliotecas externas.
- **Movimento:** transições de 250–400 ms, revelações de 700 ms, zoom discreto
  na galeria, `prefers-reduced-motion` respeitado e fallback que garante conteúdo
  visível caso o JavaScript não carregue.
# site-iluminato
