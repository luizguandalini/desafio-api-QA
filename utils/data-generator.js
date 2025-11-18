/**
 * Gerador de dados para testes
 */

class DataGenerator {
  /**
   * Gera um email único baseado em timestamp
   */
  static generateEmail(prefix = 'user') {
    const timestamp = Date.now();
    return `${prefix}_${timestamp}@test.com`;
  }

  /**
   * Gera um nome de usuário único
   */
  static generateUsername() {
    const timestamp = Date.now();
    return `User ${timestamp}`;
  }

  /**
   * Gera um nome de produto único
   */
  static generateProductName() {
    const timestamp = Date.now();
    return `Produto Teste ${timestamp}`;
  }

  /**
   * Gera dados válidos para criação de usuário
   */
  static generateValidUser(isAdmin = false) {
    return {
      nome: this.generateUsername(),
      email: this.generateEmail('user'),
      password: 'senha123',
      administrador: isAdmin ? 'true' : 'false'
    };
  }

  /**
   * Gera dados válidos para criação de produto
   */
  static generateValidProduct() {
    return {
      nome: this.generateProductName(),
      preco: Math.floor(Math.random() * 1000) + 100,
      descricao: 'Produto de teste automatizado',
      quantidade: Math.floor(Math.random() * 100) + 10
    };
  }

  /**
   * Gera dados para criação de carrinho
   */
  static generateValidCart(productId, quantity = 1) {
    return {
      produtos: [
        {
          idProduto: productId,
          quantidade: quantity
        }
      ]
    };
  }
}

module.exports = DataGenerator;
