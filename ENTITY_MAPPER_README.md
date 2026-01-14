# Entity Mapper - Documentação

Este documento descreve as funções criadas para ler e mapear entidades do arquivo `openapi.yml` e gerar código TypeScript a partir dos schemas.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Módulos Criados](#módulos-criados)
- [Funções Principais](#funções-principais)
- [Como Usar](#como-usar)
- [Exemplos](#exemplos)
- [Tipos de Geração](#tipos-de-geração)

---

## 🎯 Visão Geral

O **Entity Mapper** é um conjunto de funções que permite:

1. **Ler** o arquivo `openapi.yml` e extrair schemas que terminam com `Entity`
2. **Mapear** as propriedades dos schemas para estruturas TypeScript
3. **Gerar** código TypeScript automaticamente (interfaces, classes, decorators)

### Convenção de Nomenclatura

Para que um schema seja reconhecido como entidade, ele **deve terminar com o sufixo `Entity`**.

**Exemplo:**
```yaml
components:
  schemas:
    UserEntity:      # ✅ Será mapeado como entidade
      type: object
      properties:
        id:
          type: integer
        name:
          type: string
    
    User:            # ❌ NÃO será mapeado (não termina com Entity)
      type: object
      properties:
        id:
          type: integer
```

---

## 📦 Módulos Criados

### 1. `src/openapi/entity-mapper.ts`

Responsável por ler e mapear entidades do documento OpenAPI.

**Tipos exportados:**
- `EntitySchema` - Representa uma entidade mapeada
- `EntityProperty` - Representa uma propriedade de uma entidade

**Funções exportadas:**
- `extractEntitiesFromOpenApi()` - Extrai todas as entidades do documento
- `findEntityByName()` - Busca uma entidade específica pelo nome
- `listEntityNames()` - Lista todos os nomes de entidades disponíveis

### 2. `src/openapi/entity-generator.ts`

Responsável por gerar código TypeScript a partir das entidades mapeadas.

**Tipos exportados:**
- `EntityGeneratorOptions` - Opções de configuração para geração de código

**Funções exportadas:**
- `generateEntityCode()` - Gera código para uma única entidade
- `generateEntitiesCode()` - Gera código para múltiplas entidades
- `generateEntitiesIndex()` - Gera arquivo de índice que exporta todas as entidades

### 3. `src/examples/entity-example.ts`

Exemplo completo de uso das funções de mapeamento e geração de entidades.

---

## 🔧 Funções Principais

### `extractEntitiesFromOpenApi(doc: OpenApiDocument): EntitySchema[]`

Extrai todas as entidades (schemas que terminam com "Entity") do documento OpenAPI.

**Parâmetros:**
- `doc` - Documento OpenAPI carregado

**Retorno:**
- Array de `EntitySchema` contendo todas as entidades encontradas

**Exemplo:**
```typescript
import { readOpenApiFile } from "./openapi/loader.js";
import { extractEntitiesFromOpenApi } from "./openapi/entity-mapper.js";

const doc = await readOpenApiFile("./openapi.yml");
const entities = extractEntitiesFromOpenApi(doc);

console.log(`Encontradas ${entities.length} entidades`);
```

---

### `findEntityByName(doc: OpenApiDocument, entityName: string): EntitySchema | null`

Busca uma entidade específica pelo nome.

**Parâmetros:**
- `doc` - Documento OpenAPI carregado
- `entityName` - Nome da entidade (com ou sem sufixo "Entity")

**Retorno:**
- `EntitySchema` se encontrada, `null` caso contrário

**Exemplo:**
```typescript
const userEntity = findEntityByName(doc, "User");
// ou
const userEntity = findEntityByName(doc, "UserEntity");

if (userEntity) {
  console.log(`Entidade: ${userEntity.name}`);
  console.log(`Propriedades: ${userEntity.properties.length}`);
}
```

---

### `listEntityNames(doc: OpenApiDocument): string[]`

Lista todos os nomes de entidades disponíveis no documento.

**Parâmetros:**
- `doc` - Documento OpenAPI carregado

**Retorno:**
- Array de strings com os nomes das entidades (incluindo sufixo "Entity")

**Exemplo:**
```typescript
const entityNames = listEntityNames(doc);
console.log("Entidades disponíveis:", entityNames);
// Output: ["UserEntity", "ProductEntity"]
```

---

### `generateEntityCode(entity: EntitySchema, options?: EntityGeneratorOptions): string`

Gera o código TypeScript completo para uma entidade.

**Parâmetros:**
- `entity` - Entidade mapeada
- `options` - Opções de geração (opcional)

**Opções disponíveis:**
```typescript
{
  useClasses?: boolean;          // true = classes, false = interfaces (padrão: true)
  includeValidation?: boolean;   // Inclui decorators de validação (padrão: false)
  includeTypeOrm?: boolean;      // Inclui decorators do TypeORM (padrão: false)
  exportType?: "default" | "named"; // Tipo de export (padrão: "named")
}
```

**Retorno:**
- String contendo o código TypeScript gerado

**Exemplo:**
```typescript
import { generateEntityCode } from "./openapi/entity-generator.js";

// Gerar interface simples
const interfaceCode = generateEntityCode(entity, {
  useClasses: false
});

// Gerar classe com TypeORM
const classCode = generateEntityCode(entity, {
  useClasses: true,
  includeTypeOrm: true
});

// Gerar classe com validação
const validatedCode = generateEntityCode(entity, {
  useClasses: true,
  includeValidation: true
});
```

---

### `generateEntitiesCode(entities: EntitySchema[], options?: EntityGeneratorOptions): Map<string, string>`

Gera código para múltiplas entidades de uma vez.

**Parâmetros:**
- `entities` - Array de entidades mapeadas
- `options` - Opções de geração (opcional)

**Retorno:**
- `Map<string, string>` onde a chave é o nome do arquivo e o valor é o código gerado

**Exemplo:**
```typescript
import { generateEntitiesCode } from "./openapi/entity-generator.js";

const entitiesCode = generateEntitiesCode(entities, {
  useClasses: true,
  includeTypeOrm: true
});

// Salvar arquivos
for (const [fileName, code] of entitiesCode) {
  await fs.writeFile(`./entities/${fileName}`, code);
}
```

---

### `generateEntitiesIndex(entities: EntitySchema[]): string`

Gera um arquivo de índice que exporta todas as entidades.

**Parâmetros:**
- `entities` - Array de entidades mapeadas

**Retorno:**
- String contendo o código do arquivo `index.ts`

**Exemplo:**
```typescript
import { generateEntitiesIndex } from "./openapi/entity-generator.js";

const indexCode = generateEntitiesIndex(entities);
await fs.writeFile("./entities/index.ts", indexCode);
```

**Código gerado:**
```typescript
export { User } from "./user.entity";
export { Product } from "./product.entity";
```

---

## 🚀 Como Usar

### Passo 1: Definir Entidades no OpenAPI

Adicione schemas com sufixo `Entity` no arquivo `openapi.yml`:

```yaml
components:
  schemas:
    UserEntity:
      type: object
      required:
        - name
        - email
      properties:
        id:
          type: integer
          description: ID único do usuário
        name:
          type: string
          description: Nome completo do usuário
        email:
          type: string
          format: email
          description: Email do usuário
        age:
          type: integer
        isActive:
          type: boolean
          default: true
        role:
          type: string
          enum: [ADMIN, USER, GUEST]
          default: USER
        createdAt:
          type: string
          format: date-time
```

### Passo 2: Ler e Mapear Entidades

```typescript
import { readOpenApiFile } from "./openapi/loader.js";
import { extractEntitiesFromOpenApi } from "./openapi/entity-mapper.js";

// Ler o arquivo OpenAPI
const doc = await readOpenApiFile("./openapi.yml");

// Extrair entidades
const entities = extractEntitiesFromOpenApi(doc);

console.log(`Encontradas ${entities.length} entidades`);
```

### Passo 3: Gerar Código

```typescript
import { generateEntitiesCode, generateEntitiesIndex } from "./openapi/entity-generator.js";
import fs from "node:fs/promises";

// Gerar código das entidades
const entitiesCode = generateEntitiesCode(entities, {
  useClasses: true,
  includeTypeOrm: true
});

// Criar diretório de entidades
await fs.mkdir("./src/entities", { recursive: true });

// Salvar arquivos
for (const [fileName, code] of entitiesCode) {
  await fs.writeFile(`./src/entities/${fileName}`, code);
  console.log(`✅ Arquivo criado: ${fileName}`);
}

// Gerar e salvar arquivo de índice
const indexCode = generateEntitiesIndex(entities);
await fs.writeFile("./src/entities/index.ts", indexCode);
console.log("✅ Arquivo index.ts criado");
```

---

## 📝 Exemplos

### Exemplo 1: Interface TypeScript Simples

**Configuração:**
```typescript
const code = generateEntityCode(entity, {
  useClasses: false,
  includeValidation: false,
  includeTypeOrm: false
});
```

**Código gerado:**
```typescript
export interface User {
  /**
   * ID único do usuário
   */
  id?: number;

  /**
   * Nome completo do usuário
   */
  name: string;

  /**
   * Email do usuário
   */
  email: string;

  age?: number;

  isActive?: boolean;

  role?: "ADMIN" | "USER" | "GUEST";

  createdAt?: Date;
}
```

---

### Exemplo 2: Classe com TypeORM

**Configuração:**
```typescript
const code = generateEntityCode(entity, {
  useClasses: true,
  includeTypeOrm: true,
  includeValidation: false
});
```

**Código gerado:**
```typescript
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("users")
export class User {
  /**
   * ID único do usuário
   */
  @PrimaryGeneratedColumn()
  id?: number;

  /**
   * Nome completo do usuário
   */
  @Column()
  name: string;

  /**
   * Email do usuário
   */
  @Column()
  email: string;

  @Column()
  age?: number;

  @Column({ default: true })
  isActive?: boolean;

  @Column({ default: "USER", type: "enum", enum: ["ADMIN", "USER", "GUEST"] })
  role?: "ADMIN" | "USER" | "GUEST";

  @Column({ type: "timestamp" })
  createdAt?: Date;
}
```

---

### Exemplo 3: Classe com Validação

**Configuração:**
```typescript
const code = generateEntityCode(entity, {
  useClasses: true,
  includeValidation: true,
  includeTypeOrm: false
});
```

**Código gerado:**
```typescript
import { IsNotEmpty, IsOptional, IsString, IsNumber, IsBoolean, IsEmail, IsDate, IsArray, IsEnum } from "class-validator";

export class User {
  /**
   * ID único do usuário
   */
  @IsOptional()
  @IsNumber()
  id?: number;

  /**
   * Nome completo do usuário
   */
  @IsNotEmpty()
  @IsString()
  name: string;

  /**
   * Email do usuário
   */
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsNumber()
  age?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsEnum(["ADMIN", "USER", "GUEST"])
  role?: "ADMIN" | "USER" | "GUEST";

  @IsOptional()
  @IsDate()
  createdAt?: Date;
}
```

---

## 🎨 Tipos de Geração

### 1. Interface TypeScript
- **Uso:** Definições de tipos simples
- **Vantagens:** Leve, sem overhead de runtime
- **Quando usar:** Apenas tipagem, sem necessidade de decorators

### 2. Classe com TypeORM
- **Uso:** Integração com banco de dados usando TypeORM
- **Vantagens:** Mapeamento automático para tabelas
- **Quando usar:** Projetos que usam TypeORM como ORM

### 3. Classe com Validação
- **Uso:** Validação de dados de entrada (DTOs)
- **Vantagens:** Validação automática com class-validator
- **Quando usar:** APIs que precisam validar dados de entrada

### 4. Classe Completa (TypeORM + Validação)
- **Uso:** Entidades completas com validação e persistência
- **Vantagens:** Máxima funcionalidade
- **Quando usar:** Projetos complexos que precisam de ambos

**Configuração:**
```typescript
const code = generateEntityCode(entity, {
  useClasses: true,
  includeValidation: true,
  includeTypeOrm: true
});
```

---

## 🔄 Mapeamento de Tipos

O Entity Mapper converte automaticamente os tipos do OpenAPI para TypeScript:

| OpenAPI Type | TypeScript Type | Observações |
|--------------|-----------------|-------------|
| `string` | `string` | - |
| `string` (format: email) | `string` | Adiciona decorator `@IsEmail()` |
| `string` (format: date) | `Date` | TypeORM: `type: "date"` |
| `string` (format: date-time) | `Date` | TypeORM: `type: "timestamp"` |
| `integer` | `number` | - |
| `number` | `number` | - |
| `boolean` | `boolean` | - |
| `array` | `Type[]` | Baseado no tipo dos items |
| `object` | `object` | Pode ter propriedades aninhadas |
| `enum` | `"VALUE1" \| "VALUE2"` | Union type |
| `$ref` | Nome do schema referenciado | - |

---

## 📌 Propriedades Especiais

### Campos Obrigatórios
Definidos no array `required` do schema:
```yaml
UserEntity:
  type: object
  required:
    - name
    - email
  properties:
    name:
      type: string
    email:
      type: string
```

**Resultado:**
```typescript
name: string;    // Sem "?"
email: string;   // Sem "?"
```

### Campos Opcionais
Campos não listados em `required`:
```typescript
age?: number;    // Com "?"
```

### Campos Nullable
Definidos com `nullable: true`:
```yaml
description:
  type: string
  nullable: true
```

**Resultado:**
```typescript
description?: string | null;
```

### Valores Padrão
Definidos com `default`:
```yaml
isActive:
  type: boolean
  default: true
```

**TypeORM:**
```typescript
@Column({ default: true })
isActive?: boolean;
```

### Enums
Definidos com `enum`:
```yaml
role:
  type: string
  enum: [ADMIN, USER, GUEST]
```

**Resultado:**
```typescript
role?: "ADMIN" | "USER" | "GUEST";
```

**TypeORM:**
```typescript
@Column({ type: "enum", enum: ["ADMIN", "USER", "GUEST"] })
role?: "ADMIN" | "USER" | "GUEST";
```

---

## 🧪 Executar Exemplo

Para testar as funções criadas, execute o exemplo:

```bash
# Compilar o projeto
npm run build

# Executar o exemplo
node dist/examples/entity-example.js
```

O exemplo irá:
1. Ler o arquivo `openapi.yml`
2. Listar todas as entidades encontradas
3. Exibir informações detalhadas sobre cada entidade
4. Gerar código em diferentes formatos (interface, classe com TypeORM, classe com validação)
5. Gerar arquivo de índice

---

## 📚 Estrutura de Dados

### EntitySchema

```typescript
type EntitySchema = {
  name: string;              // Nome da entidade sem sufixo "Entity"
  originalName: string;      // Nome original com sufixo "Entity"
  schema: SchemaObject;      // Schema original do OpenAPI
  properties: EntityProperty[]; // Propriedades mapeadas
};
```

### EntityProperty

```typescript
type EntityProperty = {
  name: string;              // Nome da propriedade
  type: string;              // Tipo TypeScript
  required: boolean;         // Se é obrigatório
  nullable?: boolean;        // Se aceita null
  format?: string;           // Formato (email, date, date-time, etc.)
  description?: string;      // Descrição da propriedade
  isArray?: boolean;         // Se é um array
  isObject?: boolean;        // Se é um objeto
  nestedProperties?: EntityProperty[]; // Propriedades aninhadas
  enum?: unknown[];          // Valores possíveis (para enums)
  default?: unknown;         // Valor padrão
  example?: unknown;         // Exemplo de valor
};
```

---

## 🎯 Casos de Uso

### 1. Geração Automática de DTOs
Gere DTOs (Data Transfer Objects) automaticamente a partir do OpenAPI:

```typescript
const dtos = generateEntitiesCode(entities, {
  useClasses: true,
  includeValidation: true,
  includeTypeOrm: false
});
```

### 2. Geração de Entidades de Banco de Dados
Gere entidades TypeORM prontas para uso:

```typescript
const dbEntities = generateEntitiesCode(entities, {
  useClasses: true,
  includeTypeOrm: true,
  includeValidation: false
});
```

### 3. Geração de Tipos TypeScript
Gere apenas interfaces para tipagem:

```typescript
const types = generateEntitiesCode(entities, {
  useClasses: false,
  includeValidation: false,
  includeTypeOrm: false
});
```

---

## ✅ Checklist de Implementação

- [x] Função para ler entidades do OpenAPI
- [x] Função para mapear propriedades
- [x] Função para gerar interfaces TypeScript
- [x] Função para gerar classes TypeScript
- [x] Suporte a decorators TypeORM
- [x] Suporte a decorators de validação
- [x] Mapeamento de tipos OpenAPI para TypeScript
- [x] Suporte a propriedades aninhadas
- [x] Suporte a enums
- [x] Suporte a valores padrão
- [x] Suporte a campos nullable
- [x] Geração de arquivo de índice
- [x] Exemplo completo de uso
- [x] Documentação completa

---

## 🔗 Referências

- [OpenAPI Specification](https://swagger.io/specification/)
- [TypeORM Documentation](https://typeorm.io/)
- [class-validator Documentation](https://github.com/typestack/class-validator)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

---

## 📄 Licença

Este código faz parte do projeto `openapi-express-generator`.
