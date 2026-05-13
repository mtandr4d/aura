# 🔗 Onde colar o link do APK

> **Atalho rápido**: depois de gerar o APK pelo EAS Build, é só editar UMA linha.

## 📍 Arquivo a editar
```
/app/website/script.js
```

## 🔍 Linha a alterar (perto da linha 47)

**ANTES:**
```js
const APK_URL = window.AURA_APK_URL || ''; // 👉 cole o link aqui quando o build terminar
```

**DEPOIS:**
```js
const APK_URL = window.AURA_APK_URL || 'COLE_SEU_LINK_AQUI';
```

## 📝 Exemplo real
```js
const APK_URL = window.AURA_APK_URL || 'https://expo.dev/artifacts/eas/abc123xyz.apk';
```

## ✅ Pronto!
Salve o arquivo e republique o site. O botão "Baixar APK" agora funciona.

---

📖 Guia completo (passo a passo do zero ao APK): **`/app/GUIA_APK.md`**
