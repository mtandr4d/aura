# 📦 Guia Completo: Gerar e Baixar APK do Aura

> Forma **mais fácil possível**, passo a passo, sem precisar instalar Android Studio.

---

## 🎯 Por que não posso enviar o APK direto pra você?

**Importante esclarecer**: o ambiente Emergent (onde o app foi desenvolvido) é um **servidor Linux na nuvem**, sem Android SDK / Java instalados. Gerar um APK exige um ambiente especializado de build.

A **boa notícia** é que a Expo tem um serviço de build em nuvem **gratuito** chamado **EAS Build** que faz isso pra você em 10-15 minutos. Você só precisa:
1. Baixar o projeto pro seu Mac
2. Criar conta grátis em expo.dev
3. Rodar **3 comandos** no terminal
4. Receber um link público pra baixar o APK

---

## 🧰 Pré-requisitos no seu Mac

1. **Node.js 20+**
   ```bash
   node -v  # deve mostrar v20 ou superior
   ```
   Se não tiver: https://nodejs.org/

2. **Yarn**
   ```bash
   npm install -g yarn
   ```

3. **Conta no Expo (grátis)**
   - Crie em: https://expo.dev/signup
   - Confirme o email

---

## 🚀 Passo a passo (do zero ao APK no celular)

### 1️⃣ Baixe o projeto pro seu Mac

No Emergent, clique em **"Download Code"** ou **"Save to GitHub"** para obter o código. Depois descompacte numa pasta.

```bash
cd ~/Desktop/aura-app/frontend  # ou onde você salvou
```

### 2️⃣ Instale as dependências
```bash
yarn install
```

### 3️⃣ Configure o backend (.env)

Edite `frontend/.env` apontando para o backend que vai consumir:

**Para usar o backend hospedado no Emergent (mais fácil pra testar):**
```bash
EXPO_PUBLIC_BACKEND_URL=https://b48aab4a-0894-4be8-a9ff-6a46dd524152.preview.emergentagent.com
```

**Para usar backend próprio (quando publicar):**
```bash
EXPO_PUBLIC_BACKEND_URL=https://api.aura.app
```

### 4️⃣ Instale o EAS CLI
```bash
npm install -g eas-cli
```

### 5️⃣ Faça login no Expo
```bash
eas login
```
Digite seu email e senha do expo.dev.

### 6️⃣ Configure o projeto EAS (primeira vez apenas)

Dentro de `frontend/`:
```bash
eas build:configure
```
Aceite tudo com Enter. Isso vai:
- Atualizar o `eas.json` (já está pronto no projeto)
- Vincular seu projeto à sua conta Expo
- Gerar um `projectId` único

### 7️⃣ **Gere o APK** 🎉
```bash
eas build --platform android --profile preview
```

O terminal vai mostrar:
- ✅ Compactando código...
- ✅ Enviando para servidores Expo...
- ✅ Build na fila...
- ✅ Build em progresso (~10-15 min)
- ✅ **Build finished!**

E vai te dar um link tipo:
```
https://expo.dev/accounts/seu-user/projects/aura-cuidamais/builds/xyz123
```

### 8️⃣ Baixe o APK

Abra o link no navegador. Você verá:
- Status: ✅ Finished
- Botão grande verde: **"Install"** ou **"Download"**
- Um QR code que você pode escanear com o celular pra baixar direto

Clique em **Download APK** → baixa um arquivo `.apk` (~50 MB).

### 9️⃣ Instale no celular Android

**No celular:**
1. Transfira o APK (USB, Google Drive, WhatsApp pra si mesmo...)
2. Abra o arquivo no celular
3. Aparecerá: *"Instalação bloqueada por segurança"*
4. Vá em **Configurações → Segurança → Permitir instalação de fontes desconhecidas** (varia por modelo) → permita pro app de Arquivos / Chrome
5. Volte e clique no APK novamente → **Instalar**
6. Pronto! Abra o app Aura na home do celular 🎉

---

## 🔗 Como compartilhar o APK por link (qualquer pessoa baixar)

O link que o EAS te dá (`https://expo.dev/artifacts/eas/xxx.apk`) é **público**. Você pode:

- Enviar por WhatsApp / Telegram / Email
- Colar no site oficial (já está preparado em `website/script.js` — só substituir a constante `APK_URL`)
- Postar nas redes sociais
- Gerar QR code com https://www.qrcode-monkey.com/ apontando pro link

Quem receber é só:
1. Clicar no link
2. Baixar o APK
3. Habilitar fontes desconhecidas
4. Instalar

---

## 🌐 Conectar o APK ao site

Depois que o build terminar:

1. Copie o link público do APK (botão "Download" no expo.dev → copiar URL)
2. Abra `website/script.js`
3. Encontre a linha:
   ```js
   const APK_URL = window.AURA_APK_URL || '';
   ```
4. Substitua por:
   ```js
   const APK_URL = window.AURA_APK_URL || 'https://expo.dev/artifacts/eas/SEU_LINK.apk';
   ```
5. Republique o site (vercel deploy / netlify / github pages)

Pronto! O botão "Baixar APK" no site agora baixa o arquivo diretamente.

---

## 🍎 E pra iOS?

Diferente do Android, a Apple **exige conta paga de desenvolvedor ($99/ano)**.

### Opção 1: Testar no Simulator (grátis, só no Mac)
```bash
eas build --platform ios --profile preview
```
Isso gera um `.tar.gz` que você roda no Xcode Simulator.

### Opção 2: TestFlight (recomendado para distribuir beta)
1. Criar conta Apple Developer ($99/ano): https://developer.apple.com/programs/
2. ```bash
   eas build --platform ios --profile production
   eas submit --platform ios
   ```
3. Convide até 10.000 testers por email no TestFlight

### Opção 3: App Store oficial
Mesmo fluxo do TestFlight, mas passa pela review da Apple (~24-48h).

---

## ❓ Diferenças entre Expo Go, APK, build de produção e loja

| Modalidade | Para quê serve | Custo | Tempo |
|---|---|---|---|
| **Expo Go** | Testar durante desenvolvimento (precisa do app Expo Go instalado) | Grátis | ⚡ Instantâneo |
| **APK preview (EAS)** | Compartilhar com pessoas via link, instalar manualmente | Grátis | 🐢 10-15 min |
| **APK/AAB produção** | Publicar na Google Play Store | Grátis (taxa Play: $25 únicos) | 🐢 10-15 min |
| **iOS Simulator build** | Testar no Mac sem iPhone | Grátis | 🐢 10-15 min |
| **iOS TestFlight** | Distribuir beta no iPhone real | $99/ano | 🐢 15-30 min + review |
| **Apple App Store** | Loja oficial Apple | $99/ano | 🐢 + review Apple |

---

## 🐛 Problemas comuns

| Erro | Solução |
|---|---|
| `eas: command not found` | `npm install -g eas-cli` |
| Build falha com `Cannot find name 'projectId'` | Rode `eas init` antes do build |
| APK abre tela branca | Confira se `EXPO_PUBLIC_BACKEND_URL` no `.env` está acessível pela internet (não localhost) |
| Login não funciona no APK instalado | Backend precisa estar online + URL no .env precisa ser HTTPS pública |
| Build muito demorado | Plano grátis tem fila — geralmente até 30 min. Plano pago é instantâneo |

---

## 🎓 Próximo nível: Builds automáticos

Quer que toda vez que você fizer commit no GitHub o APK seja gerado automaticamente? Configure GitHub Actions com:
```yaml
# .github/workflows/eas-build.yml
on: push
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      - run: cd frontend && eas build --platform android --profile preview --non-interactive
```

---

**Feito com 💜 pela equipe Aura**
*Cuidar de quem você ama faz tudo valer mais.*
