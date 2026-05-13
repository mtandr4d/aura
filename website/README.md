# 🌐 Aura — Site de Divulgação

Site institucional premium para divulgação do app **Aura**, com a identidade visual oficial da marca.

---

## 📁 Estrutura

```
website/
├── index.html      # Página única com todas as seções
├── styles.css      # Estilos premium (glassmorphism + paleta Aura)
├── script.js       # Interações (scroll, menu mobile, download APK)
├── aura-logo.png   # Logo oficial da marca
└── aura-brand.jpg  # Brandbook (referência)
```

---

## 📝 O que cada arquivo faz

| Arquivo | Função |
|---|---|
| `index.html` | Todas as seções da landing: hero, sobre, benefícios, Alzheimer, funcionalidades, jogo da memória, depoimentos, download, segurança, FAQ, footer |
| `styles.css` | Variáveis CSS com a paleta Aura (#5B21B6, #EC4899, #FF8A00, #00B894, #0F172A) + glassmorphism + animações + responsividade |
| `script.js` | Comportamento do nav (scroll), menu hamburguer mobile, reveal animado, configuração do link do APK |
| `aura-logo.png` | Logo oficial usada no nav, hero e mockup |

---

## 🚀 Como rodar localmente

**Opção 1 — abrir direto no navegador**
```bash
cd website
open index.html   # macOS
# ou: xdg-open index.html (Linux) / start index.html (Windows)
```

**Opção 2 — servidor local (recomendado para evitar problemas com paths)**
```bash
cd website
python3 -m http.server 5500
# Acesse: http://localhost:5500
```

Ou com Node:
```bash
npx serve website -l 5500
```

---

## ☁️ Como publicar (gratuito)

### Opção A: **Vercel** (mais simples — recomendado)
1. Crie conta grátis em https://vercel.com (login com GitHub)
2. No terminal:
   ```bash
   npm i -g vercel
   cd website
   vercel
   ```
3. Aceite os defaults. Em ~1 min você recebe um link público (`https://aura-xxx.vercel.app`).
4. Para domínio próprio (ex: `aura.app`), configure em Project Settings → Domains.

### Opção B: **Netlify**
1. Crie conta em https://app.netlify.com
2. Arraste a pasta `website/` no painel → site está no ar
3. Domínio personalizado em Domain Settings

### Opção C: **GitHub Pages**
1. Crie repositório `seu-usuario/aura-website` no GitHub
2. Faça commit da pasta `website/` (apenas o conteúdo dentro dela)
3. Repository Settings → Pages → Source: `main` branch → Save
4. Disponível em `https://seu-usuario.github.io/aura-website/`

### Opção D: **Cloudflare Pages**
- Crie projeto em https://pages.cloudflare.com e conecte ao GitHub. Build command: deixe vazio. Output directory: `/`.

---

## 🔗 Como conectar o site ao download do APK

O site já está preparado para receber o link do APK gerado pelo EAS Build.

### Passo 1: Gerar o APK (uma vez)
Veja o guia completo em `/app/GUIA_APK.md` ou no `README.md` do projeto.

Resumo:
```bash
cd /app/frontend
npm i -g eas-cli
eas login                                  # crie conta grátis em expo.dev
eas build:configure                        # primeira vez apenas
eas build --platform android --profile preview
```

### Passo 2: Pegar o link público do APK
Quando o build terminar (10–15 min), o EAS exibe um link do tipo:
```
https://expo.dev/artifacts/eas/abc123xyz.apk
```

### Passo 3: Colar o link no site
Edite `website/script.js`, na linha:
```js
const APK_URL = window.AURA_APK_URL || ''; // ex: 'https://expo.dev/artifacts/eas/xxx.apk'
```
Troque por:
```js
const APK_URL = window.AURA_APK_URL || 'https://expo.dev/artifacts/eas/abc123xyz.apk';
```

Republique o site (vercel, netlify, etc.). O botão "Baixar APK" agora abrirá o arquivo direto.

### Alternativa: injetar via console / hospedar APK em outro lugar
```html
<!-- antes de </body> em index.html -->
<script>window.AURA_APK_URL = 'https://seu-cdn.com/aura.apk';</script>
```

---

## 🎨 Identidade visual aplicada

- **Cores**: Roxo (#5B21B6), Rosa (#EC4899), Laranja (#FF8A00), Verde água (#00B894), Azul escuro (#0F172A)
- **Fonte**: Manrope 400/500/600/700/800
- **Estilo**: Glassmorphism (vidro fosco), gradientes diagonais, sombras com tom roxo, animações suaves
- **Componentes**: Cards translúcidos com `backdrop-filter`, orbs flutuantes animados, mockups de iPhone 3D, gradient text

---

## 📱 Seções incluídas

1. **Nav** (fixa, glass, com burger menu mobile)
2. **Hero** — título grande, slogan, CTAs, stats de confiança, mockup duplo de iPhone com app rodando
3. **Sobre o Aura** — significado da marca (Amor + Pessoas + Proteção = Aura)
4. **Benefícios** — 3 cards (idoso, cuidador, família)
5. **Alzheimer / Cuidado inteligente** — section dark com estatísticas
6. **Funcionalidades** — grid de 8 ícones e descrições
7. **Jogo da Memória** — section gradient com mini-board interativo visual
8. **Depoimentos** — 3 cards com avatares gradient
9. **Download** — botões Android (APK) e iOS (TestFlight em breve)
10. **Segurança e Privacidade** — 4 pilares (criptografia, sem venda, controle, LGPD)
11. **FAQ** — 6 perguntas em accordion
12. **Footer** — brand, links, copyright

---

## 🐛 Solução de problemas

| Problema | Solução |
|---|---|
| `Backdrop-filter` não funciona | Use navegador moderno (Chrome 76+, Safari 14+, Firefox 103+) |
| Imagens não carregam | Confira se está rodando via http (não `file://`) — use `python3 -m http.server` |
| Fontes Manrope não aparecem | Verifique sua conexão com fonts.googleapis.com |

---

**Feito com 💜 pela equipe Aura**
