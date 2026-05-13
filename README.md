# 🌟 Aura — App de Cuidado Premium + Site de Divulgação

> **"Cuidar de quem você ama faz tudo valer mais."**

Projeto completo: aplicativo React Native + Expo Router + Site institucional de divulgação.

Conecta **pacientes**, **cuidadores** e **familiares** com uma experiência acolhedora, premium e acessível — agora com identidade visual completa da marca **Aura**.

---

## 📂 Estrutura do projeto

```
/app/
├── frontend/         # 📱 App React Native + Expo (com logo oficial AURA)
├── backend/          # ⚙️  FastAPI + MongoDB (auth, SOS, lembretes, etc)
├── website/          # 🌐 Site de divulgação premium (HTML/CSS/JS)
├── memory/           # 📋 PRD.md + test_credentials.md
├── GUIA_APK.md       # 📦 Passo a passo para gerar APK Android
└── README.md         # Este arquivo
```

Cada subprojeto tem seu próprio README:
- [`frontend/README.md`](./frontend/README.md) — como rodar o app
- [`website/README.md`](./website/README.md) — como rodar e publicar o site
- [`GUIA_APK.md`](./GUIA_APK.md) — **como gerar e baixar o APK**

---

## ✨ O que mudou (v2.0 — Reformulação Aura)

| Antes (CuidaMais) | Agora (Aura) |
|---|---|
| Paleta terrosa (laranja terracota / verde oliva) | Paleta premium: **Roxo #5B21B6**, **Rosa #EC4899**, **Laranja #FF8A00**, **Verde água #00B894**, **Azul escuro #0F172A** |
| Tela única do paciente (Stack) | **Tabs com 3 abas**: Início · Exercícios da Memória · Ajustes |
| Sem jogo cognitivo | **Jogo da Memória** com 3 níveis (Fácil/Médio/Difícil), pontuação, sequência e feedback animado |
| Sem sons | **Sistema de sons** (toque, sucesso, erro, acerto, flip) com toggle nos Ajustes |
| Tab bar simples | **Tab bar flutuante glassmorphism** com gradiente animado nas abas ativas |
| Logo genérico de coração | **Marca Aura** com logo gradiente personalizado |

---

## 🎨 Identidade Visual

**Fonte**: Manrope (400/500/600/700/800)
**Estilo**: iOS / Glassmorphism (vidro fosco), gradientes suaves, bordas arredondadas, sombras com tom roxo, animações spring.
**Slogan oficial**: *Cuidar de quem você ama faz tudo valer mais.*

Tokens centralizados em `frontend/lib/theme.ts` — basta editar lá para mudar toda a UI.

---

## 📁 Estrutura do Projeto

```
frontend/
├── app/                       # Expo Router (file-based routing)
│   ├── index.tsx              # 🌅 Splash animado Aura
│   ├── _layout.tsx            # Root layout + RouteGuard
│   ├── (auth)/                # Login / Cadastro
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (patient)/             # Área do paciente — Bottom Tabs
│   │   ├── _layout.tsx        # Tabs flutuantes
│   │   ├── index.tsx          # Home: SOS + remédio + localização
│   │   ├── memory.tsx         # 🧠 Jogo da Memória
│   │   └── settings.tsx       # 🔧 Ajustes (som, perfil, sair)
│   ├── (caregiver)/           # Área do cuidador (tabs)
│   └── (responsible)/         # Área do familiar (tabs)
│
├── components/                # 🔄 Componentes reutilizáveis Aura
│   ├── AuraLogo.tsx           # Logo gradiente da marca
│   ├── AuraButton.tsx         # Botão premium (gradient/ghost/glass) com som
│   ├── AuraInput.tsx          # Input glassmorphism com foco animado
│   ├── AuraCard.tsx           # Card vidro + AuraGradientCard
│   └── AuraBackground.tsx     # Background com gradiente + orbs flutuantes
│
├── lib/                       # 📦 Lógica e serviços
│   ├── theme.ts               # 🎨 TODO o tema (cores, gradientes, espaçamentos, fontes, sombras)
│   ├── sounds.ts              # 🔊 Sistema de sons (expo-av) + persistência
│   ├── animations.tsx         # PressableScale, Pulse, SlideUp, Haptics
│   ├── auth.tsx               # AuthProvider (login/cadastro)
│   ├── api.ts                 # Cliente axios com JWT
│   ├── storage.ts             # AsyncStorage wrapper
│   ├── notifications.ts       # Notificações locais
│   └── active-patient.tsx     # Paciente selecionado (cuidador/familiar)
│
├── assets/                    # Ícones, splash, fontes
├── app.json                   # Config Expo (nome "Aura", versão 2.0.0)
├── eas.json                   # 📦 Config para build do APK
└── package.json
```

---

## 🚀 Como rodar localmente no seu Mac

### 1. Pré-requisitos
```bash
# Node 20+
node -v

# Yarn 1.x
npm i -g yarn

# Expo CLI global (opcional, npx funciona)
npm i -g expo
```

### 2. Backend (FastAPI + MongoDB)
```bash
cd backend
python3.11 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# .env (já configurado para uso local)
echo "MONGO_URL=mongodb://localhost:27017" > .env
echo "DB_NAME=aura_db" >> .env
echo "JWT_SECRET=mude-este-segredo" >> .env

# rodar
uvicorn server:app --reload --port 8001
```

### 3. Frontend (React Native + Expo)
```bash
cd frontend
yarn install

# .env (aponte para o backend)
echo "EXPO_PUBLIC_BACKEND_URL=http://SEU_IP_LOCAL:8001" > .env
# Ex no Mac: EXPO_PUBLIC_BACKEND_URL=http://192.168.0.42:8001
# (descubra com: ipconfig getifaddr en0)

# rodar Metro Bundler
yarn start
```

Será exibido um QR code. **Escaneie com o app Expo Go** (Android ou iOS).

#### Variantes:
- `yarn android` → roda direto no emulador Android
- `yarn ios` → roda no Simulator iOS (Mac)
- `yarn web` → roda no navegador

---

## 📱 Como gerar APK Android (a forma MAIS fácil)

### Opção A: **EAS Build na nuvem (recomendado — sem precisar Android Studio!)**

1. **Crie conta no Expo**: https://expo.dev/signup (grátis)
2. **Instale o EAS CLI**:
   ```bash
   npm install -g eas-cli
   ```
3. **Faça login**:
   ```bash
   eas login
   ```
4. **Dentro de `frontend/`**, configure o projeto:
   ```bash
   eas build:configure
   # Aceite os defaults (Android + iOS)
   ```
5. **Gere o APK** (perfil `preview` já configurado em `eas.json`):
   ```bash
   eas build --platform android --profile preview
   ```
6. Aguarde ~10–15 min. Quando terminar, **abra o link gerado** no seu navegador → clique em **"Download APK"** → baixe e instale no celular.

### 🔗 Para compartilhar o APK por link:
- O EAS já gera um link público (ex: `https://expo.dev/artifacts/eas/xxx.apk`)
- Mande esse link no WhatsApp, e-mail, Telegram...
- Quem receber só precisa baixar e **habilitar "Instalar de fontes desconhecidas"** nas configurações do Android.

### Opção B: Build local (precisa Android SDK)
```bash
cd frontend
npx expo prebuild --platform android
cd android && ./gradlew assembleRelease
# APK em: android/app/build/outputs/apk/release/app-release.apk
```

---

## 🍎 Como gerar/distribuir versão iOS

Diferente do Android, a Apple **exige conta de desenvolvedor paga ($99/ano)** para instalar em dispositivos físicos reais. Suas opções:

### 1. **Simulator (grátis, só no Mac)**
```bash
eas build --platform ios --profile preview
# gera um .tar.gz para rodar no Simulator (não no iPhone real)
```

### 2. **TestFlight (distribuição beta — recomendado)**
- Precisa conta Apple Developer ($99/ano)
- Build:
  ```bash
  eas build --platform ios --profile production
  eas submit --platform ios
  ```
- Convide até 10.000 testers por e-mail/link

### 3. **App Store (loja oficial)**
- Mesmo fluxo do TestFlight + review Apple (~24–48h)

---

## 📊 Diferença entre Expo Go, APK, build produção e loja

| Modalidade | Para quê serve | Custo | Velocidade |
|---|---|---|---|
| **Expo Go** | Testar durante desenvolvimento; precisa do app Expo Go instalado | Grátis | ⚡ Instantâneo |
| **APK preview (EAS)** | Compartilhar com pessoas específicas via link | Grátis | 🐢 10–15 min |
| **APK/AAB produção** | Publicar na Google Play Store | Grátis | 🐢 10–15 min |
| **iOS TestFlight** | Distribuir beta no iPhone | $99/ano | 🐢 15–30 min |
| **Apple App Store** | Loja oficial Apple | $99/ano | 🐢 + review |

---

## 🔊 Sistema de Sons

Os sons são **gerados em base64** (embutidos no app, zero peso) e ativados/desativados em **Ajustes → Sons do app**. Para substituir por arquivos próprios, edite `frontend/lib/sounds.ts` — basta trocar as strings base64 por `require('./caminho.mp3')`.

Sons disponíveis:
- `tap` — clique suave em botões
- `flip` — virar carta do jogo da memória
- `match` — acertar par
- `success` — concluir ação positiva (login, jogo completo)
- `error` — erro leve / par errado

---

## 🧠 Jogo da Memória — Como funciona

- **3 níveis**: Fácil (4 pares), Médio (6 pares), Difícil (8 pares)
- **Cartas grandes** com emojis amigáveis (🌻🐶🍎🌈🦋⭐🐱🍀)
- **Pontuação**: jogadas, acertos e sequência (streak)
- **Feedback**: animação spring + som + haptic ao acertar/errar
- **Acessibilidade**: cartas escaláveis, contraste alto, ícones grandes
- **Objetivo**: estimular memória e raciocínio de idosos/pacientes Alzheimer

---

## 🛠️ Resumo das mudanças por arquivo

| Arquivo | O que faz | O que mudou |
|---|---|---|
| `lib/theme.ts` | Tema central (cores, gradientes, fontes) | 🆕 Toda a paleta Aura (roxo, rosa, laranja, verde água, navy) + sombras roxas |
| `lib/sounds.ts` | Sistema de sons | 🆕 Criado — gerencia 5 sons + persistência via AsyncStorage |
| `components/AuraLogo.tsx` | Logo da marca | 🆕 Logo gradient com coração estilizado |
| `components/AuraButton.tsx` | Botão premium | 🆕 6 variantes (primary/pink/orange/teal/ghost/glass/sos) + som + haptic |
| `components/AuraInput.tsx` | Input premium | 🆕 Glassmorphism com foco animado |
| `components/AuraCard.tsx` | Card premium | 🆕 Card padrão + AuraGradientCard com glow |
| `components/AuraBackground.tsx` | Fundo animado | 🆕 4 variantes (light/hero/patient/dark) com orbs flutuantes |
| `app/index.tsx` | Splash | 🆕 Splash animado com logo + halo pulsante + slogan |
| `app/(auth)/login.tsx` | Login | 🔄 Reformulado com novos componentes Aura |
| `app/(auth)/register.tsx` | Cadastro | 🔄 Cards de role com gradiente ativo + inputs glass |
| `app/(patient)/_layout.tsx` | Tabs paciente | 🔄 Tab bar flutuante glass com 3 abas |
| `app/(patient)/index.tsx` | Home paciente | 🔄 SOS pulsante + card de código + Stats animados |
| `app/(patient)/memory.tsx` | Jogo da Memória | 🆕 Jogo completo com 3 níveis |
| `app/(patient)/settings.tsx` | Ajustes | 🆕 Switch de sons, perfil, logout |
| `app/(caregiver)/_layout.tsx` | Tabs cuidador | 🔄 Tab bar flutuante glass |
| `app/(responsible)/_layout.tsx` | Tabs familiar | 🔄 Tab bar flutuante glass |
| `app.json` | Config Expo | 🔄 Nome "Aura", slug, bundleId, adaptive icon roxo |
| `eas.json` | Config EAS Build | 🆕 Perfis preview (APK) e production (AAB) |

---

## 🐛 Solução de Problemas

| Problema | Solução |
|---|---|
| `Network request failed` no login | Verifique `EXPO_PUBLIC_BACKEND_URL` no `.env` e se o backend está rodando |
| Fonts não carregam | Conexão lenta com Google Fonts; aguarde ou rode em modo nativo (não web) |
| `expo: not found` | `yarn install` no diretório `frontend/` |
| ENOSPC: too many watchers (Linux) | `echo fs.inotify.max_user_watches=524288 \| sudo tee -a /etc/sysctl.conf && sudo sysctl -p` |
| iOS Simulator não abre | `xcode-select --install` e abra o Xcode uma vez |

---

## 🤝 Próximos passos sugeridos

- [ ] Adicionar mais jogos cognitivos (sequências, números, palavras)
- [ ] Notificações push para lembretes de remédios
- [ ] Histórico do jogo da memória com gráfico de evolução
- [ ] Sincronização offline com cache
- [ ] Tema escuro completo
- [ ] Versão Apple Watch / Wear OS

---

**Feito com 💜 pela equipe Aura**
*Cuidar de quem você ama faz tudo valer mais.*
