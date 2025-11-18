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
