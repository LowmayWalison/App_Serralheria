# Guia de Geração do Pacote APK / AAB (Google Play Store) — LW Serralheria Pro

Este aplicativo é um **Progressive Web App (PWA) de Nível A**, 100% pronto para compilação em **APK** e **AAB (Android App Bundle)** para distribuição direta ou publicação na **Google Play Store**.

---

## Opção 1: Geração Automática sem Instalar Nada (Recomendado)

1. Acesse o gerador oficial da Microsoft / Google: **[https://www.pwabuilder.com](https://www.pwabuilder.com)**
2. Cole a URL pública do seu aplicativo:
   `https://ais-dev-bzuvd5ygmq24wgfwlycisc-683424798708.us-west2.run.app` (ou seu domínio de produção)
3. Clique em **"Start"** e depois em **"Package for Android"**.
4. Defina:
   - **Package ID**: `com.lwserralheria.app`
   - **App Name**: `LW Serralheria Pro`
   - **Version Code**: `1`
   - **Version Name**: `1.0.0`
5. Clique em **"Generate Package"** e baixe o arquivo `.aab` (para Play Store) e `.apk` (para teste direto no celular).

---

## Opção 2: Gerar com Google Bubblewrap CLI (Linha de Comando)

Requisitos: Node.js (v18+) e Java JDK / Android SDK instalados.

```bash
# 1. Instalar o Bubblewrap CLI globalmente
npm install -g @bubblewrap/cli

# 2. Inicializar o projeto usando o manifest do app
bubblewrap init --manifest=https://ais-dev-bzuvd5ygmq24wgfwlycisc-683424798708.us-west2.run.app/manifest.json

# 3. Compilar o APK e AAB assinado
bubblewrap build
```

O comando gerará:
- `app-release-signed.apk` (para instalar em qualquer celular Android)
- `app-release-bundle.aab` (para fazer upload no Google Play Console)

---

## Opção 3: Instalação Instantânea no Celular (WebAPK - Sem compilação)

Qualquer usuário com celular Android pode instalar o aplicativo como APK nativo instantaneamente:
1. Abra o link do aplicativo no **Google Chrome** no celular.
2. Toque no botão **"Instalar App"** no topo da tela ou no menu ⋮ > **"Instalar aplicativo"**.
3. O Android gera o WebAPK com ícone na gaveta de aplicativos e suporte a tela cheia e offline!

---

## Arquivos de Configuração Inclusos no Projeto:
- `/public/manifest.json`: Manifesto PWA completo com atalhos e ícones
- `/public/.well-known/assetlinks.json`: Verificação Digital Asset Links (TWA)
- `/public/twa-manifest.json`: Configuração pré-formatada do Bubblewrap
- `/public/privacy-policy.html`: Política de Privacidade exigida pelo Google Play
- `/public/sw.js`: Service Worker com cache offline avançado
