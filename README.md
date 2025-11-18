# Desafio - API Rest

### Instalação

1. Clone o repositório
2.
3. Instale as dependências:

```bash
npm install
```

### Executando os Testes

```bash
# Executar todos os testes
npm test

# Executar testes com interface visual
npm run test:ui

# Executar testes em modo headed (visualiza o browser)
npm run test:headed

# Visualizar relatório de testes
npm run test:report
```

### Executar Testes Específicos

```bash
# Apenas testes de Login
npx playwright test login.spec.js

# Apenas testes de Usuários
npx playwright test usuarios.spec.js

# Apenas testes de Produtos
npx playwright test produtos.spec.js

# Apenas testes de Carrinhos
npx playwright test carrinhos.spec.js
```

## 📈 Relatórios

Após a execução dos testes, os relatórios são gerados em:

- **HTML Report**: `test-results/html-report/index.html`
- **JSON Report**: `test-results/results.json`

Para visualizar o relatório HTML:

```bash
npm run test:report
```

## 📋 Cenários de Teste

### Login
- [CRÍTICO] Deve realizar login com credenciais válidas de usuário administrador
- [CRÍTICO] Deve realizar login com credenciais válidas de usuário comum
- Deve retornar erro ao fazer login com email inválido
- Deve retornar erro ao fazer login com senha incorreta
- Deve retornar erro ao fazer login sem informar email
- Deve retornar erro ao fazer login sem informar senha

### Usuários
- [CRÍTICO] Deve cadastrar novo usuário com dados válidos
- [CRÍTICO] Deve listar todos os usuários cadastrados
- Deve retornar erro ao cadastrar usuário com email já existente
- Deve retornar erro ao cadastrar usuário sem informar nome
- Deve retornar erro ao cadastrar usuário sem informar email
- Deve retornar erro ao cadastrar usuário com email em formato inválido
- Deve buscar usuário por ID válido
- Deve retornar erro ao buscar usuário com ID inexistente
- Deve deletar usuário com sucesso

### Produtos
- [CRÍTICO] Deve cadastrar novo produto com token de administrador
- [CRÍTICO] Deve listar todos os produtos cadastrados
- Deve retornar erro ao cadastrar produto sem autenticação
- Deve retornar erro ao cadastrar produto com token de usuário comum (não admin)
- Deve retornar erro ao cadastrar produto com nome já existente
- Deve retornar erro ao cadastrar produto sem informar nome
- Deve retornar erro ao cadastrar produto sem informar preço
- Deve buscar produto por ID válido
- Deve retornar erro ao buscar produto com ID inexistente
- Deve deletar produto com sucesso
- Deve retornar erro ao deletar produto sem autenticação

### Carrinhos
- [CRÍTICO] Deve criar carrinho com produtos válidos
- [CRÍTICO] Deve listar todos os carrinhos cadastrados
- Deve retornar erro ao criar carrinho sem autenticação
- Deve retornar erro ao criar carrinho com produto inexistente
- Deve retornar erro ao criar carrinho quando usuário já possui carrinho ativo
- Deve validar cálculo de preço total do carrinho
- Deve concluir compra (DELETE) de um carrinho com sucesso
- Deve cancelar compra de um carrinho com sucesso
- Deve retornar erro ao concluir compra sem autenticação
- Deve retornar erro ao cancelar compra sem autenticação
