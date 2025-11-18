class ApiHelper {
  constructor(request) {
    this.request = request;
    this.baseURL = "https://serverest.dev";
  }

  async login(email, password) {
    const response = await this.request.post(`${this.baseURL}/login`, {
      data: {
        email,
        password,
      },
    });

    const data = await response.json();
    return data.authorization;
  }

  async createUser(userData) {
    const response = await this.request.post(`${this.baseURL}/usuarios`, {
      data: userData,
    });

    const data = await response.json();
    return { response, userId: data._id };
  }

  async createProduct(productData, token) {
    const response = await this.request.post(`${this.baseURL}/produtos`, {
      data: productData,
      headers: {
        Authorization: token,
      },
    });

    const data = await response.json();
    return { response, productId: data._id };
  }

  async createCart(cartData, token) {
    const response = await this.request.post(`${this.baseURL}/carrinhos`, {
      data: cartData,
      headers: {
        Authorization: token,
      },
    });

    const data = await response.json();
    return { response, cartId: data._id };
  }

  async deleteUser(userId) {
    return await this.request.delete(`${this.baseURL}/usuarios/${userId}`);
  }

  async deleteProduct(productId, token) {
    return await this.request.delete(`${this.baseURL}/produtos/${productId}`, {
      headers: {
        Authorization: token,
      },
    });
  }

  async deleteCart(token) {
    return await this.request.delete(
      `${this.baseURL}/carrinhos/cancelar-compra`,
      {
        headers: {
          Authorization: token,
        },
      }
    );
  }

  async listUsers() {
    return await this.request.get(`${this.baseURL}/usuarios`);
  }

  async listProducts() {
    return await this.request.get(`${this.baseURL}/produtos`);
  }

  async listCarts() {
    return await this.request.get(`${this.baseURL}/carrinhos`);
  }
}

module.exports = ApiHelper;
