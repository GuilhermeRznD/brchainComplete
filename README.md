# BRChain - Ecossistema Integrado de Notícias (Porto Digital)

Este repositório contém a solução completa desenvolvida em parceria com a **BRChain**: uma plataforma de agregação, moderação e recomendação de notícias da área da saúde.

A arquitetura une três frentes em um único repositório:
1. **`brchain_API-backend`**: API FastAPI (Python) para persistência, recomendação e ingestão.
2. **`brchain-dashboard-master`**: Painel administrativo Web (Next.js) para triagem e moderação.
3. **`brchainFrontend-master`**: Aplicativo móvel (React Native/Expo) para consumo do feed.

---

## Pré-requisitos

* [Node.js LTS](https://nodejs.org/) e [Python 3.10+](https://www.python.org/downloads/)
* [MongoDB](https://www.mongodb.com/try/download/community) rodando localmente na porta padrão (`27017`)
* Aplicativo **[Expo Go](https://expo.dev/go)** no celular

---

##  Inicialização Rápida (Windows)

1. Clone o repositório e acesse a pasta raiz.
2. Certifique-se de que o MongoDB local está ativo.
3. Dê dois cliques em **`Iniciar BRChain.bat`**.

> **Nota:** O script `.bat` configura automaticamente os ambientes virtuais, instala todas as dependências de IA, Python e Node.js, gerencia os túneis do Cloudflare e limpa as portas do sistema.

---

## População do Banco (Database Seeding)

Ao iniciar pela primeira vez, o backend popula o MongoDB automaticamente com artigos de teste e duas contas padrão para facilitar a avaliação do ecossistema:
* **Admin (Dashboard Web):** `admin@brchain.com` (Senha: `123`)
* **User (App Mobile):** `joao@gmail.com` (Senha: `123`)
  
---

## Visualização no Banco de Dados


Para visualizar os dados salvos no banco de dados, utilize a ferramenta [MongoDB Compass](https://www.mongodb.com/products/tools/compass)

## Ativando Notícias em Tempo Real

Por padrão, o app roda com dados simulados. Para puxar notícias reais do mundo inteiro em tempo real:

1. Crie uma conta gratuita em [gnews.io](https://gnews.io/) e copie sua **API Key**.
2. Na pasta `brchain_API-backend`, faça uma cópia do arquivo `.env.example` e renomeie-a para **`.env`**.
3. Insira sua chave na variável correspondente:
```env
GNEWS_API_KEY=sua_chave_aqui

