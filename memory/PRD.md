# Aura — Product Requirements Document

## Problem Statement (original)
Reformular COMPLETAMENTE o app React Native/Expo (cuidamais) com a identidade visual da marca **AURA**:
- Paleta Roxo (#5B21B6), Rosa (#EC4899), Laranja (#FF8A00), Verde água (#00B894), Azul escuro (#0F172A)
- Visual moderno iOS / Glassmorphism, gradientes suaves, bordas arredondadas
- Fonte Manrope
- Slogan: "Cuidar de quem você ama faz tudo valer mais."
- Nova aba "Exercícios da Memória" com jogo da memória
- Sistema de sons (toque, sucesso, erro, acerto, flip) com toggle
- Tela de configurações
- Site de divulgação premium (HTML/CSS/JS)
- Instruções claras de APK Android via EAS

## User personas
1. **Paciente (idoso)** — usa botão SOS, vê próximo remédio, joga memória, ajustes simples
2. **Cuidador profissional** — gerencia medicamentos, reporta atividades, chat com família
3. **Familiar/Responsável** — acompanha localização, agenda visitas, gerencia lista de compras

## Core Requirements
- React Native + Expo Router (mantido)
- Backend FastAPI + MongoDB com JWT (mantido)
- Identidade visual AURA aplicada em 100% das telas
- 3 áreas separadas por role com tabs flutuantes glassmorphism
- Jogo da memória acessível (3 níveis, cartas grandes, feedback)
- Sons opcionais (acessibilidade)
- Logo OFICIAL AURA da marca (não desenhado em código)
- Site de divulgação responsivo

## What's been implemented (2026-05-13)
- ✅ **Tema central AURA** (`lib/theme.ts`) — paleta, gradientes, sombras roxas
- ✅ **Sistema de sons** (`lib/sounds.ts`) — 5 sons base64 + AsyncStorage toggle
- ✅ **Componentes reutilizáveis**: AuraLogo, AuraButton, AuraInput, AuraCard, AuraGradientCard, AuraBackground
- ✅ **Splash animado** com logo oficial + halo pulsante + slogan
- ✅ **Login / Cadastro** reformulados com glassmorphism e logo oficial
- ✅ **Tab bars flutuantes glassmorphism** (paciente, cuidador, familiar)
- ✅ **Patient Home** premium: SOS pulsante, código de vínculo gradient, próximo remédio
- ✅ **Memory Game** (`memory.tsx`) — 3 níveis, 8 emojis, animação flip, pontuação
- ✅ **Settings** (`settings.tsx`) — perfil avatar gradient, toggle de sons, logout
- ✅ **app.json** atualizado para "Aura", bundleId `com.aura.cuidamais`, ícone roxo
- ✅ **eas.json** com perfis preview (APK) e production (AAB)
- ✅ **Logo OFICIAL da marca** (versão atualizada) salva em assets/images
- ✅ **Backend** auth registration/login/me/link funcionando 100%
- ✅ **Site de divulgação v2 (DARK PREMIUM)** em `/app/website`
   - Tema escuro com fundo navy + gradientes profundos
   - Logo em destaque com efeito glow + ring rotativo + chips flutuantes
   - Wordmark "aura" com último "a" em gradiente rosa→laranja
   - 13 seções: Nav, Hero, Sobre, Benefícios, Alzheimer, Funcionalidades, Memory Game, Depoimentos, Download, Segurança, FAQ, Footer
   - Modal "Em breve" para lista de espera do APK
   - 100% responsivo
- ✅ **GUIA_APK.md** + **APK_LINK.md** com passo a passo claro para gerar APK

## Backlog (P1)
- Verificar visualmente o site (atualmente só dá pra preview localmente)
- Notificações push reais para lembretes
- Histórico do jogo da memória com gráfico
- Tema escuro completo
- Tela /memory para cuidador/familiar acompanhar progresso cognitivo

## Backlog (P2)
- Mais jogos cognitivos (sequências, números, palavras)
- Versão Apple Watch / Wear OS
- Modo offline com sincronização
- Integração com wearables (frequência cardíaca)

## Next Tasks (Sessão futura)
1. Conectar link real do APK no site (após user rodar `eas build`)
2. Publicar website em Vercel/Netlify
3. Implementar push notifications nativas
4. Adicionar mais variações de jogos cognitivos

## Notas técnicas
- Web preview no Emergent pode mostrar splash lento devido às fontes Manrope vir de Google Fonts CDN. No app nativo (Expo Go / APK) isso é instantâneo.
- O EAS Build é a forma recomendada para gerar APK — gratuito, ~10-15 min na nuvem.
- ENV: `EXPO_PUBLIC_BACKEND_URL` no `.env` aponta para o backend FastAPI.
