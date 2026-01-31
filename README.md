# OpenAPI Fastify Generator

Uma CLI robusta para acelerar o desenvolvimento de backends utilizando **Fastify**, gerando código boilerplate e estruturas completas a partir de especificações **OpenAPI**.

## 🚀 Instalação

Você pode instalar a CLI globalmente via npm:

```bash
npm install -g openapi-fastify-generator
```

Ou utilizar diretamente via `npx` sem instalação prévia:

```bash
npx oe-generator <comando>
```

## 🛠️ Comandos Disponíveis

A ferramenta expõe dois binários: `openapi-fastify-generator` e o alias curto `oe-generator`.

### 1. Criar um Novo Projeto (`create`)

Inicia um assistente interativo (wizard) para criar a estrutura base de um novo projeto.

```bash
oe-generator create
```

**O que será solicitado:**
- **Nome do Projeto**: Define o nome do diretório e do package.json.
- **ORM**: Escolha o ORM de sua preferência (atualmente suporta **TypeORM**, **Sequelize**, **Prisma**).

### 2. Gerar Código (`generate`)

Gera módulos completos (Rotas, Controllers, Services, Entidades) a partir de um arquivo de especificação OpenAPI.

```bash
oe-generator generate
```

**Comportamento Atual:**
- O comando busca automaticamente por um arquivo **`openapi.yml`** no diretório atual.
- Gera os arquivos na pasta `generated/my-app`.
- Cria a estrutura completa de:
  - `Routes`
  - `Controllers`
  - `Services`
  - `Repositories`
  - `Models` (Entidades compatíveis com o ORM selecionado, padrão TypeORM)

## 📐 Regras e Convenções do Projeto

Para que o gerador funcione corretamente e aproveite todos os recursos (como geração de Entidades de Banco de Dados), seu arquivo `openapi.yml` deve seguir algumas convenções específicas.

### Geração de Entidades (TypeORM)

Para que uma entidade de banco de dados seja gerada automaticamente a partir de um schema do OpenAPI, duas regras devem ser atendidas no `components/schemas`:

1.  **Sufixo do Nome**: O nome do schema deve terminar com `Entity` (ex: `UsersEntity`).
2.  **Tag de Módulo na Descrição**: A descrição do schema deve conter a tag `module:<nome_do_modulo>`.

**Exemplo:**
```yaml
components:
  schemas:
    UsersEntity:
      type: object
      description: "Representa um usuário do sistema _module:users_"
      properties:
        id:
          type: integer
          description: "pk:increment" # Define como Chave Primária Auto Incremento
        name:
          type: string
          description: "length:100_nullable" # Define tamanho 100 e permite NULL
```

### Configuração de Colunas via Descrição

Você pode controlar as propriedades da coluna do banco de dados adicionando flags na `description` do campo no OpenAPI. As flags devem ser separadas por `_` (underscore).

| Flag | Descrição | Exemplo |
|------|-----------|---------|
| `pk:<tipo>` | Define chave primária. Tipos: `increment`, `uuid`, `rowid`, `identity`. | `pk:uuid` |
| `type:<tipo>` | Força um tipo de coluna específico do banco. | `type:text` |
| `length:<n>` | Define o tamanho da coluna (para strings). Padrão: 255. | `length:100` |
| `nullable` | Permite valores nulos na coluna. | `nullable` |
| `unique` | Adiciona constraint de unicidade (UNIQUE). | `unique` |
| `name:<nome>` | Define um nome de coluna no banco diferente do nome da propriedade. | `name:user_full_name` |
| `default:<valor>` | Define um valor padrão. | `default:ATIVO` |

### Autenticação JWT Automática

O gerador suporta a configuração automática de middleware JWT nas rotas geradas.

- **Como ativar**: Adicione `jwt` na lista de propriedades do método da rota (o gerador verifica `method.jwt`).
- **Resultado**: A rota gerada incluirá automaticamente o `jwtMiddleware` no array `preHandler`.

*(Nota: Esta funcionalidade depende de como o parser OpenAPI preenche a propriedade `jwt` no objeto `Method` interno, geralmente inferido de `security` schemes no OpenAPI).*

### Responses e Status Codes

O gerador configura automaticamente o código de status HTTP de sucesso nos Controllers com base no verbo HTTP:

- **POST**: Retorna `201 Created`.
- **DELETE**: Retorna `200 OK`.
- **Outros (GET, PUT, PATCH)**: Retornam `200 OK`.

Além disso, as respostas são encapsuladas em uma classe `ApiResponse` padronizada, garantindo consistência no retorno da API.

### Convenções de Nomenclatura Gerada

O gerador aplica automaticamente padrões de nomenclatura para manter o código limpo e previsível:

- **Classes de Entidade**: `NomeModulo + Entity` (ex: `UsersEntity`).
- **Tabelas do Banco**: O nome do módulo em minúsculo (ex: `@Entity("users")`).
- **Controllers**: Arquivo `users.controller.ts`, exporta métodos baseados no verbo HTTP + Rota (ex: `getUsers`, `postUsers`).
- **Services**: Arquivo `users.service.ts`, gera funções vazias tipadas com `Params`, `Query` e `Body` prontos para implementação.
- **Schemas de Validação**: Gerados em `@<module>/schemas/` com formato `<Verbo><Rota>Schema` (ex: `PostUsersSchema`).

## 📦 Estrutura Gerada

A CLI foca em uma arquitetura modular e limpa. Exemplo de estrutura gerada:

```text
src/
  ├── modules/
  │   ├── users/
  │   │   ├── users.controller.ts
  │   │   ├── users.service.ts
  │   │   ├── users.routes.ts
  │   │   ├── users.entity-typeorm.ts # Se TypeORM for escolhido
  │   │   └── schemas/
  │   │       └── GetUsers.schema.ts
  │   └── ...
```

## 📋 Pré-requisitos

- Node.js (versão LTS recomendada)
- Arquivo `openapi.yml` válido (para o comando `generate`)

## 📄 Licença

ISC
