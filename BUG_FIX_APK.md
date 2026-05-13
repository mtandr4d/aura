# 🔄 IMPORTANTE: Gerar um NOVO APK com as correções

## O bug que você reportou

> "Não deixa selecionar o teclado nem cadastrar"

**Causa identificada e corrigida** ✅

Era um bug conhecido do `react-native-reanimated` em production builds Android: o `AnimatedPressable` com `transform: scale` cria uma camada de gesture interceptor que bloqueia TODOS os toques (TextInput não abre teclado, botões não respondem).

## Correções aplicadas

1. ✅ **`PressableScale`** agora usa `Pressable` puro + `Animated.View` interno com wrapper `View` (não bloqueia mais touches)
2. ✅ **`Pulse`** agora tem `pointerEvents="box-none"` (deixa toques passarem pros filhos)
3. ✅ **`SlideUpView`/`SlideDownView`** desabilitadas no Android (animações em iOS apenas)
4. ✅ **`KeyboardAvoidingView`** com `behavior="height"` no Android em 6 telas
5. ✅ **`PressableScale`** sem `AnimatedPressable` (substituído por Pressable + View wrapper)

## 🚀 Como gerar o NOVO APK

No seu Mac, **dentro da pasta `frontend/`**:

```bash
# 1. Pegue o código atualizado (Save to GitHub + git pull / re-download ZIP)

# 2. Reinstale dependências se necessário
yarn install

# 3. Gere o novo build
eas build --platform android --profile preview
```

⏱️ Aguarda 10-15 min e baixa o novo APK.

## ⚠️ Importante: APK antigo NÃO funciona

O APK do build `6c819fe9-c11d-4bfc-81b1-9ba7d367727d` que está no site **ainda tem o bug**. Você precisa:

1. Gerar o NOVO build com `eas build`
2. Pegar o link público do novo build
3. **Atualizar o link no site** em `website/script.js`:
   ```js
   const APK_URL = 'NOVO_LINK_AQUI';
   ```
4. Também atualizar no `website/index.html` a tag `<a id="apkDownload" href="...">` com o novo link

## ✅ Como validar que o novo APK funciona

Depois de instalar o novo APK no Android:
- [ ] Toque no campo de **email** → o teclado deve abrir
- [ ] Digite o email → texto deve aparecer
- [ ] Toque no campo de **senha** → teclado abre
- [ ] Toque no botão **Entrar** → deve fazer login (precisa de conta cadastrada)
- [ ] Toque em **"Criar conta"** → deve abrir a tela de cadastro
- [ ] Botões dos cards de role (Paciente / Cuidador / Familiar) → respondem ao toque
- [ ] **SOS** na home (com Pulse + PressableScale aninhado) → responde ao toque

## 🐛 Se mesmo assim não funcionar

Pode rodar um log via USB:
```bash
adb logcat *:E | grep -i "aura\|reanimated\|expo"
```

E me mandar o output que eu analiso!
