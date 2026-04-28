# NEPERG - site institucional com backend

Este projeto roda como um site institucional com backend em Node.js, painel administrativo, persistencia server-side e envio de mensagens pelo formulario de contato.

## O que ja esta pronto

- painel administrativo com login no servidor
- criacao do primeiro acesso direto pela tela de admin
- multiplos acessos administrativos com separacao por pessoa
- nivel `owner` para gerenciar acessos e nivel `editor` para editar conteudo
- noticias, eventos e avisos salvos no backend
- formulario de contato salvo no servidor
- upload de imagens com persistencia em `uploads/`
- backup autenticado em `/api/export`
- protecoes basicas de origem, sessao, CSRF e links/imagens
- bloqueio de setup inseguro em producao sem `ADMIN_SETUP_TOKEN`
- exigencia de armazenamento persistente em producao com `CMS_STORAGE_DIR`
- limitacao de tentativas de login e setup
- historico de autoria no painel para saber quem atualizou o conteudo

## Como rodar localmente

1. Tenha Node.js 18+ instalado.
2. Copie `.env.example` para `.env.local` se quiser testar com variaveis de ambiente.
3. Rode:

```bash
npm start
```

4. Abra:

```text
http://127.0.0.1:3000
```

## Primeiro acesso administrativo

1. Acesse `http://127.0.0.1:3000/admin/index.html`
2. Se `ADMIN_SETUP_TOKEN` estiver configurado, informe a chave
3. Crie o primeiro usuario e a senha inicial
4. Esse primeiro acesso nasce como `owner`
5. Entre no painel
6. Cadastre outros usuarios para a equipe, se necessario
7. Cadastre ou edite noticias, eventos e avisos

## Modelo de acessos

Para um projeto institucional com varias pessoas, o fluxo recomendado e:

- `owner`: responsavel tecnico ou coordenacao; cria e remove acessos
- `editor`: professores e equipe que vao atualizar conteudo

Boa pratica:

- cada pessoa usa o proprio login
- evite compartilhar senha
- mantenha pelo menos dois `owners` ativos para evitar dependencia de uma unica pessoa

## Variaveis de ambiente

Use `.env.example` como base.

- `NODE_ENV`: use `production` no deploy
- `PORT`: porta do servidor
- `HOST`: host do servidor, normalmente `0.0.0.0`
- `COOKIE_SECURE=1`: exige cookie seguro em HTTPS
- `ADMIN_SETUP_TOKEN`: chave obrigatoria para liberar o primeiro acesso em producao
- `CMS_STORAGE_DIR`: diretorio persistente onde ficam dados e uploads

## Persistencia

O sistema salva:

- conteudo administrativo em `data/runtime/cms.json`
- uploads em `uploads/`

Em producao, nao deixe isso na raiz efemera do container. Configure:

- `CMS_STORAGE_DIR=/app/storage`

Assim o sistema passa a usar:

- `/app/storage/data/runtime/cms.json`
- `/app/storage/uploads/`

## Deploy recomendado

Para deixar o site no ar sem depender do seu PC, o caminho mais seguro para a arquitetura atual e:

1. subir o codigo para o GitHub
2. conectar o repositorio ao Railway
3. anexar um volume/disco persistente montado em `/app/storage`
4. definir as variaveis de ambiente de producao
5. publicar um dominio HTTPS
6. criar o primeiro acesso pelo painel admin

Plataforma recomendada para esta versao:

- Railway

Este repositorio ja inclui:

- `Dockerfile`
- `railway.json`

Isso deixa o build por container, o healthcheck e a politica de restart mais previsiveis no deploy.

## Configuracao minima de producao

Defina no painel da hospedagem:

```text
NODE_ENV=production
HOST=0.0.0.0
PORT=3000
COOKIE_SECURE=1
CMS_STORAGE_DIR=/app/storage
ADMIN_SETUP_TOKEN=<chave-forte-e-unica>
```

## Health check

Use:

```text
/healthz
```

## Railway

Passo a passo recomendado:

1. criar um novo projeto no Railway a partir do repositorio GitHub
2. deixar o Railway usar o `Dockerfile`
3. montar um volume persistente em `/app/storage`
4. configurar as variaveis de ambiente de producao
5. gerar o dominio publico HTTPS
6. acessar `/admin/index.html` e criar o primeiro `owner`

Variaveis minimas:

```text
NODE_ENV=production
HOST=0.0.0.0
PORT=3000
COOKIE_SECURE=1
CMS_STORAGE_DIR=/app/storage
ADMIN_SETUP_TOKEN=<chave-forte>
```

Observacao importante:

- servicos com volume persistente podem ter pequena indisponibilidade durante redeploy
- mantenha apenas uma instancia enquanto a persistencia continuar em volume local

## Backup

Depois de entrar no painel administrativo:

- use o botao `Baixar backup JSON`
- ou acesse `/api/export`

O backup exporta:

- usuarios administrativos sem hashes de senha
- conteudos
- mensagens de contato

## Subindo para o GitHub

Exemplo basico:

```bash
git add .
git commit -m "Prepara deploy do CMS do NEPERG"
git branch -M main
git remote add origin <URL_DO_REPOSITORIO>
git push -u origin main
```

## Estrutura principal

```text
server.js            Servidor HTTP, API, autenticacao e persistencia
admin/index.html     Painel administrativo
js/admin.js          Logica do painel
js/cms-core.js       Cliente da API
js/main.js           Integracao das paginas publicas com a API
uploads/             Imagens enviadas pelo painel
data/runtime/        Dados gerados em execucao
Dockerfile           Deploy em container
railway.json         Configuracao de deploy do Railway
.env.example         Modelo de configuracao
```

## Observacoes importantes

- GitHub hospeda o codigo, nao o backend
- GitHub Pages serve apenas site estatico
- a arquitetura atual nao e ideal para Vercel porque o projeto depende de escrita persistente em disco
- para colocar esta versao na Vercel, seria preciso migrar uploads e dados para servicos externos como Blob + banco
- o modelo atual foi preparado para equipe: cada pessoa pode ter o proprio acesso
- use uma unica instancia do servico enquanto a persistencia estiver baseada em volume local
