# 📦 Como gerar e disponibilizar o APK do AURA — Guia visual passo a passo

> **Para iniciantes!** Vou te guiar do zero ao APK no celular em 4 etapas simples.

---

## 🎯 O que você vai conseguir no final
✅ Um arquivo `.apk` que qualquer pessoa pode baixar e instalar no Android
✅ Um link público (do tipo `https://expo.dev/artifacts/eas/xxx.apk`) para colocar no site
✅ O botão "Baixar APK" do seu site funcionando perfeitamente

---

# 🏁 ETAPA 1 — Preparar seu Mac

Abra o **Terminal** (no Mac: Cmd+Espaço → digite "Terminal" → Enter).

### 1.1 Verifique se tem Node.js 20+
```bash
node -v
```
Se aparecer algo como `v20.x.x`, ótimo! Se aparecer "command not found" ou versão antiga, baixe em https://nodejs.org/ (escolha a versão **LTS**).

### 1.2 Instale o Yarn (se ainda não tiver)
```bash
npm install -g yarn
```

### 1.3 Crie sua conta grátis no Expo
Abra no navegador: https://expo.dev/signup
- Cadastre com email + senha (ou Google)
- Confirme o email

---

# 🏁 ETAPA 2 — Configurar o projeto AURA

### 2.1 Entre na pasta do projeto que você baixou
```bash
cd ~/Downloads/aura-app/frontend
# OU onde você descompactou. Ajuste o caminho.
```

### 2.2 Instale as dependências
```bash
yarn install
```
☕ Aguarde 1-2 minutos.

### 2.3 Verifique o arquivo `.env`
Abra o arquivo `frontend/.env` num editor de texto (TextEdit, VS Code...). Ele deve ter:
```
EXPO_PUBLIC_BACKEND_URL=https://b48aab4a-0894-4be8-a9ff-6a46dd524152.preview.emergentagent.com
```

Se vazio, cole essa linha. Pronto, salve.

---

# 🏁 ETAPA 3 — Gerar o APK na nuvem (gratuito!)

### 3.1 Instale o EAS CLI
```bash
npm install -g eas-cli
```

### 3.2 Faça login no Expo
```bash
eas login
```
Digite o email e senha que você criou na Etapa 1.3.

### 3.3 Configure o projeto (só na primeira vez)
```bash
eas build:configure
```
- Pergunta "What would you like your Android application id to be?" → aperte Enter (aceita `com.aura.cuidamais`)
- Pergunta sobre iOS bundle id → aperte Enter
- Pergunta sobre eas.json → diga **N** (já existe no projeto!)

### 3.4 **GERE O APK!** 🚀
```bash
eas build --platform android --profile preview
```

O que vai aparecer:
```
✔ Linked to project @seu-usuario/aura-cuidamais
✔ Using remote Android credentials (Expo server)
✔ Build queued...
✔ Build in progress... (10-15 min)
✔ Build finished!

🤖 Android app: https://expo.dev/accounts/seu-user/projects/aura-cuidamais/builds/abc123xyz
```

**☕ Aguarde 10-15 minutos.** Pode fechar o terminal e ir tomar um café. Quando voltar:

---

# 🏁 ETAPA 4 — Baixar e compartilhar o APK

### 4.1 Abra o link que apareceu no terminal
Algo como `https://expo.dev/accounts/seu-user/projects/aura-cuidamais/builds/abc123xyz`

### 4.2 Você verá a página do build
- Status: ✅ **Finished**
- Botão grande: **"Install"** ou **"Download"**
- Tem um QR code também (legal pra escanear direto no celular!)

### 4.3 Pegue o LINK PÚBLICO do APK

Há **DUAS formas**:

**🔵 Forma A — Link direto do artifact (recomendado para o site):**
- Na página do build, role para baixo
- Procure "Artifacts" ou clique com botão direito no botão Download → "Copiar endereço do link"
- O link tem essa cara: `https://expo.dev/artifacts/eas/abc123xyz.apk`
- ✅ **Esse é o link que vai no site!**

**🔵 Forma B — Página de instalação (pra compartilhar por WhatsApp):**
- O próprio link da página do build (`https://expo.dev/accounts/.../builds/abc123`) é público
- Quem abrir, vê o botão Download
- Use esse pra compartilhar com pessoas comuns

### 4.4 Instalar no seu Android (teste pessoal)
1. Abra o link no celular Android
2. Toque em **Download**
3. Quando terminar, abra o arquivo `.apk`
4. Vai aparecer "Bloqueado por segurança"
5. Vá em **Configurações → Segurança → Permitir instalação de fontes desconhecidas**
6. Volte e toque no APK novamente → **Instalar**
7. 🎉 Pronto! O **Aura** está no celular!

---

# 🌐 ETAPA 5 — Colocar o link no site

Agora a parte mais legal: deixar o botão "Baixar APK" do seu site funcionando.

### 5.1 Abra o arquivo `website/script.js`
No seu editor de texto favorito.

### 5.2 Procure essa linha (perto da linha 47):
```js
const APK_URL = window.AURA_APK_URL || ''; // 👉 cole o link aqui quando o build terminar
```

### 5.3 Substitua a string vazia pelo seu link
**Antes:**
```js
const APK_URL = window.AURA_APK_URL || '';
```

**Depois (exemplo):**
```js
const APK_URL = window.AURA_APK_URL || 'https://expo.dev/artifacts/eas/abc123xyz.apk';
```

⚠️ **Importante**: mantenha as aspas! Cole APENAS o link, sem `<>` ou outros caracteres.

### 5.4 Salve o arquivo
Pronto! Agora o botão "Baixar APK" no site:
- ✅ Não mostra mais "Em breve"
- ✅ Ao clicar, baixa o arquivo diretamente
- ✅ Funciona em celular e desktop

### 5.5 Republique o site (se já estava no ar)
**Se estiver no Vercel:**
```bash
cd website
vercel --prod
```

**Se estiver no Netlify:**
Arraste a pasta `website/` no painel novamente.

**Se estiver no GitHub Pages:**
Faça commit + push do arquivo `script.js`.

---

# 📲 Como compartilhar o APK com outras pessoas

Você tem **3 formas** após o link estar pronto:

### 1. Site oficial (depois do passo 5 acima)
Quem acessar `aura.app` (ou onde você hospedou) clica em "Baixar APK" e baixa.

### 2. WhatsApp / Telegram / Email
Cole o link direto na mensagem. Ex:
```
Oi! Esse é o link pra baixar o Aura no Android:
https://expo.dev/artifacts/eas/abc123xyz.apk

Instruções:
1. Toque no link
2. Baixe o APK
3. Abra o arquivo no celular
4. Aceite "Fontes desconhecidas" se pedir
5. Pronto! 💜
```

### 3. QR Code (para feiras, eventos, cards)
- Acesse https://www.qrcode-monkey.com/
- Cole o link do APK
- Baixe o QR code em PNG
- Use em flyers, cards, etc.

---

# ❓ Perguntas comuns

### "E se o build der erro?"
A maioria dos erros é por causa do `.env`. Verifique se `EXPO_PUBLIC_BACKEND_URL` está preenchido. Se der erro de "projectId", rode `eas init` antes do build.

### "Quanto tempo o link do APK fica disponível?"
Builds **gratuitos**: ficam disponíveis por **30 dias**.
Plano pago Expo: ficam pra sempre.
👉 Recomendação: depois que gerar, baixe o `.apk` e suba pro seu próprio servidor (Google Drive, AWS S3, GitHub Releases) para ter controle.

### "Quantos APKs gratuitos posso gerar?"
30 builds por mês no plano gratuito. Mais que suficiente pra testar.

### "O APK funciona offline?"
Funciona o jogo da memória e sons. As outras funções (SOS, lembretes, localização, chat) precisam de internet.

### "Posso publicar na Google Play?"
Sim! Mas você precisa:
1. Pagar taxa única de $25 no Google Play Console
2. Rodar `eas build --platform android --profile production` (gera `.aab` em vez de `.apk`)
3. Subir o `.aab` no Play Console
4. Aguardar a review (~24h)

---

# 🆘 Precisa de ajuda?

Se algo der errado:
1. Verifique se está na pasta correta (`cd frontend`)
2. Rode `yarn install` de novo
3. Tente `eas build --platform android --profile preview --clear-cache`
4. Se persistir, copie o erro completo e busque no Discord oficial da Expo: https://chat.expo.dev/

---

**🌟 Pronto! Você já tem seu app Aura instalável no Android!**

*Cuidar de quem você ama faz tudo valer mais.* 💜
