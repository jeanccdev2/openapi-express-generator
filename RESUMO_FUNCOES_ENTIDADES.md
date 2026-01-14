# Resumo: Funções de Mapeamento e Geração de Entidades

## 📌 Objetivo

Criar funções para **ler entidades do arquivo openapi.yml** mapeadas em `components/schemas` (que terminam com o sufixo `Entity`) e **gerar código TypeScript** automaticamente a partir dos schemas.

---

## ✅ O que foi criado

### 1. **Módulo de Mapeamento** (`src/openapi/entity-mapper.ts`)

Funções para ler e mapear entidades do OpenAPI:

| Função | Descrição | Retorno |
|--------|-----------|---------|
| `extractEntitiesFromOpenApi(doc)` | Extrai todas as entidades do documento OpenAPI | `EntitySchema[]` |
| `findEntityByName(doc, name)` | Busca uma entidade específica pelo nome | `EntitySchema \| null` |
| `listEntityNames(doc)` | Lista todos os nomes de entidades disponíveis | `string[]` |

**Tipos exportados:**
- `EntitySchema` - Representa uma entidade mapeada
- `EntityProperty` - Representa uma propriedade de uma entidade

---

### 2. **Módulo de Geração** (`src/openapi/entity-generator.ts`)

Funções para gerar código TypeScript a partir das entidades:

| Função | Descrição | Retorno |
|--------|-----------|---------|
| `generateEntityCode(entity, options)` | Gera código TypeScript para uma entidade | `string` |
| `generateEntitiesCode(entities, options)` | Gera código para múltiplas entidades | `Map<string, string>` |
| `generateEntitiesIndex(entities)` | Gera arquivo index.ts que exporta todas as entidades | `string` |

**Opções de geração (`EntityGeneratorOptions`):**
```typescript
{
  useClasses?: boolean;          // true = classes, false = interfaces
  includeValidation?: boolean;   // Adiciona decorators de validação
  includeTypeOrm?: boolean;      // Adiciona decorators do TypeORM
  exportType?: "default" | "named"; // Tipo de export
}
```

---

### 3. **Exemplos de Uso**

#### `src/examples/entity-example.ts`
Script que demonstra todas as funcionalidades:
- Leitura do OpenAPI
- Listagem de entidades
- Exibição de informações detalhadas
- Geração de código em diferentes formatos

#### `src/examples/generate-entities-files.ts`
Script que gera arquivos de entidades em 4 formatos:
- **Interfaces TypeScript** (tipagem simples)
- **Classes com TypeORM** (persistência)
- **Classes com Validação** (validação de dados)
- **Classes Completas** (TypeORM + Validação)

---

## 🎯 Como Usar

### Passo 1: Definir Entidades no OpenAPI

Adicione schemas com sufixo `Entity` em `components/schemas`:

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
        name:
          type: string
        email:
          type: string
          format: email
```

### Passo 2: Usar as Funções

```typescript
import { readOpenApiFile } from "./openapi/loader.js";
import { extractEntitiesFromOpenApi } from "./openapi/entity-mapper.js";
import { generateEntitiesCode } from "./openapi/entity-generator.js";

// Ler OpenAPI
const doc = await readOpenApiFile("./openapi.yml");

// Extrair entidades
const entities = extractEntitiesFromOpenApi(doc);

// Gerar código
const code = generateEntitiesCode(entities, {
  useClasses: true,
  includeTypeOrm: true
});

// Salvar arquivos
for (const [fileName, fileCode] of code) {
  await fs.writeFile(`./entities/${fileName}`, fileCode);
}
```

---

## 📊 Formatos de Geração

### 1. Interface TypeScript
```typescript
export interface User {
  id?: number;
  name: string;
  email: string;
}
```

### 2. Classe com TypeORM
```typescript
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  name: string;

  @Column()
  email: string;
}
```

### 3. Classe com Validação
```typescript
import { IsNotEmpty, IsOptional, IsString, IsEmail } from "class-validator";

export class User {
  @IsOptional()
  @IsNumber()
  id?: number;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;
}
```

### 4. Classe Completa (TypeORM + Validação)
```typescript
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { IsNotEmpty, IsOptional, IsString, IsEmail } from "class-validator";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn()
  @IsOptional()
  @IsNumber()
  id?: number;

  @Column()
  @IsNotEmpty()
  @IsString()
  name: string;

  @Column()
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;
}
```

---

## 🧪 Testar as Funções

### Executar Exemplo Completo
```bash
npm run build
node dist/examples/entity-example.js
```

### Gerar Arquivos de Entidades
```bash
npm run build
node dist/examples/generate-entities-files.js
```

Os arquivos serão gerados em `test-output/`:
- `interfaces/` - Interfaces TypeScript
- `typeorm-entities/` - Classes com TypeORM
- `validation-classes/` - Classes com validação
- `complete-entities/` - Classes completas

---

## 📋 Convenções

### Nomenclatura de Entidades
- ✅ **Correto:** `UserEntity`, `ProductEntity`, `OrderEntity`
- ❌ **Errado:** `User`, `Product`, `Order` (não terminam com "Entity")

### Estrutura no OpenAPI
```yaml
components:
  schemas:
    # ✅ Será mapeado como entidade
    UserEntity:
      type: object
      properties:
        id:
          type: integer
    
    # ❌ NÃO será mapeado (não termina com Entity)
    User:
      type: object
      properties:
        id:
          type: integer
```

---

## 🔄 Mapeamento de Tipos

| OpenAPI | TypeScript | Observações |
|---------|------------|-------------|
| `string` | `string` | - |
| `integer` | `number` | - |
| `number` | `number` | - |
| `boolean` | `boolean` | - |
| `array` | `Type[]` | Baseado no tipo dos items |
| `object` | `object` | Pode ter propriedades aninhadas |
| `enum` | `"A" \| "B"` | Union type |
| `string` (format: email) | `string` | Adiciona `@IsEmail()` |
| `string` (format: date) | `Date` | TypeORM: `type: "date"` |
| `string` (format: date-time) | `Date` | TypeORM: `type: "timestamp"` |

---

## 🎨 Recursos Suportados

### ✅ Implementado
- [x] Leitura de entidades do OpenAPI
- [x] Mapeamento de propriedades
- [x] Geração de interfaces TypeScript
- [x] Geração de classes TypeScript
- [x] Decorators TypeORM
- [x] Decorators de validação (class-validator)
- [x] Suporte a campos obrigatórios
- [x] Suporte a campos opcionais
- [x] Suporte a campos nullable
- [x] Suporte a valores padrão
- [x] Suporte a enums
- [x] Suporte a arrays
- [x] Suporte a objetos aninhados
- [x] Geração de arquivo de índice
- [x] Descrições (JSDoc)
- [x] Múltiplos formatos de saída

---

## 📦 Arquivos Criados

```
src/
├── openapi/
│   ├── entity-mapper.ts          # Funções de mapeamento
│   ├── entity-generator.ts       # Funções de geração de código
│   ├── loader.ts                 # (já existia) Carregamento do OpenAPI
│   └── types.ts                  # (já existia) Tipos do OpenAPI
├── examples/
│   ├── entity-example.ts         # Exemplo completo de uso
│   └── generate-entities-files.ts # Script de geração de arquivos
└── ...

test-output/                      # Arquivos gerados (exemplo)
├── interfaces/
│   ├── user.entity.ts
│   ├── product.entity.ts
│   └── index.ts
├── typeorm-entities/
│   ├── user.entity.ts
│   ├── product.entity.ts
│   └── index.ts
├── validation-classes/
│   ├── user.entity.ts
│   ├── product.entity.ts
│   └── index.ts
└── complete-entities/
    ├── user.entity.ts
    ├── product.entity.ts
    └── index.ts

ENTITY_MAPPER_README.md           # Documentação completa
RESUMO_FUNCOES_ENTIDADES.md       # Este arquivo
```

---

## 🚀 Próximos Passos (Sugestões)

1. **Integrar com CLI existente** - Adicionar comando `oe-generator entities`
2. **Suporte a relacionamentos** - Mapear `$ref` para relações TypeORM
3. **Geração de migrations** - Criar migrations do TypeORM automaticamente
4. **Validação avançada** - Suporte a regex, min/max, etc.
5. **Templates customizáveis** - Permitir templates personalizados
6. **Geração de testes** - Criar testes unitários automaticamente
7. **Suporte a Prisma** - Adicionar geração de schemas Prisma
8. **Documentação automática** - Gerar documentação das entidades

---

## 📚 Documentação Completa

Para mais detalhes, consulte: **[ENTITY_MAPPER_README.md](./ENTITY_MAPPER_README.md)**

---

## 🎉 Conclusão

As funções criadas permitem:

✅ **Ler** entidades do OpenAPI de forma automática  
✅ **Mapear** propriedades com todos os seus metadados  
✅ **Gerar** código TypeScript em múltiplos formatos  
✅ **Suportar** TypeORM e class-validator  
✅ **Economizar** tempo de desenvolvimento  
✅ **Manter** sincronização entre OpenAPI e código  

**Resultado:** Geração automática de entidades TypeScript a partir do OpenAPI, com suporte completo a decorators e múltiplos formatos de saída.
