const {
  test,
  expect,
  request: playwrightRequest,
} = require("@playwright/test");
const DataGenerator = require("../utils/data-generator");

test.describe("Carrinhos - Cenários Críticos", () => {
  let adminToken;
  let productId;
  let baseURL = "https://serverest.dev";

  test.beforeAll(async () => {
    const context = await playwrightRequest.newContext({ baseURL });

    const adminUser = DataGenerator.generateValidUser(true);
    await context.post("/usuarios", { data: adminUser });

    const loginResponse = await context.post("/login", {
      data: { email: adminUser.email, password: adminUser.password },
    });
    const loginData = await loginResponse.json();
    adminToken = loginData.authorization;

    const product = DataGenerator.generateValidProduct();
    const productResponse = await context.post("/produtos", {
      data: product,
      headers: { Authorization: adminToken },
    });
    const productData = await productResponse.json();
    productId = productData._id;

    await context.dispose();
  });

  test("[CRÍTICO] Deve criar carrinho com produtos válidos", async ({
    request,
  }) => {
    const user = DataGenerator.generateValidUser(false);
    await request.post("/usuarios", { data: user });

    const loginResponse = await request.post("/login", {
      data: { email: user.email, password: user.password },
    });
    const loginData = await loginResponse.json();
    const userToken = loginData.authorization;

    const cartData = DataGenerator.generateValidCart(productId, 2);

    const response = await request.post("/carrinhos", {
      data: cartData,
      headers: { Authorization: userToken },
    });

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(201);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty("message");
    expect(responseBody.message).toBe("Cadastro realizado com sucesso");
    expect(responseBody).toHaveProperty("_id");

    await request.delete("/carrinhos/cancelar-compra", {
      headers: { Authorization: userToken },
    });
  });

  test("[CRÍTICO] Deve listar todos os carrinhos cadastrados", async ({
    request,
  }) => {
    const user = DataGenerator.generateValidUser(false);
    await request.post("/usuarios", { data: user });

    const loginResponse = await request.post("/login", {
      data: { email: user.email, password: user.password },
    });
    const loginData = await loginResponse.json();
    const userToken = loginData.authorization;

    const cartData = DataGenerator.generateValidCart(productId, 1);
    await request.post("/carrinhos", {
      data: cartData,
      headers: { Authorization: userToken },
    });

    const response = await request.get("/carrinhos");

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty("quantidade");
    expect(responseBody.quantidade).toBeGreaterThanOrEqual(1);
    expect(responseBody).toHaveProperty("carrinhos");
    expect(Array.isArray(responseBody.carrinhos)).toBeTruthy();

    await request.delete("/carrinhos/cancelar-compra", {
      headers: { Authorization: userToken },
    });
  });

  test("Deve retornar erro ao criar carrinho sem autenticação", async ({
    request,
  }) => {
    const cartData = DataGenerator.generateValidCart(productId, 1);

    const response = await request.post("/carrinhos", {
      data: cartData,
    });

    expect(response.status()).toBe(401);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty("message");
    expect(responseBody.message).toBe(
      "Token de acesso ausente, inválido, expirado ou usuário do token não existe mais"
    );
  });

  test("Deve retornar erro ao criar carrinho com produto inexistente", async ({
    request,
  }) => {
    const user = DataGenerator.generateValidUser(false);
    await request.post("/usuarios", { data: user });

    const loginResponse = await request.post("/login", {
      data: { email: user.email, password: user.password },
    });
    const loginData = await loginResponse.json();
    const userToken = loginData.authorization;

    const invalidCartData = DataGenerator.generateValidCart(
      "PRODUTO_INEXIST",
      1
    );

    const response = await request.post("/carrinhos", {
      data: invalidCartData,
      headers: { Authorization: userToken },
    });

    expect(response.status()).toBe(400);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty("message");
  });

  test("Deve retornar erro ao criar carrinho quando usuário já possui carrinho ativo", async ({
    request,
  }) => {
    const user = DataGenerator.generateValidUser(false);
    await request.post("/usuarios", { data: user });

    const loginResponse = await request.post("/login", {
      data: { email: user.email, password: user.password },
    });
    const loginData = await loginResponse.json();
    const userToken = loginData.authorization;

    const cartData = DataGenerator.generateValidCart(productId, 1);
    await request.post("/carrinhos", {
      data: cartData,
      headers: { Authorization: userToken },
    });

    const response = await request.post("/carrinhos", {
      data: cartData,
      headers: { Authorization: userToken },
    });

    expect(response.status()).toBe(400);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty("message");
    expect(responseBody.message).toBe("Não é permitido ter mais de 1 carrinho");

    await request.delete("/carrinhos/cancelar-compra", {
      headers: { Authorization: userToken },
    });
  });

  test("Deve validar cálculo de preço total do carrinho", async ({
    request,
  }) => {
    const user = DataGenerator.generateValidUser(false);
    await request.post("/usuarios", { data: user });

    const loginResponse = await request.post("/login", {
      data: { email: user.email, password: user.password },
    });
    const loginData = await loginResponse.json();
    const userToken = loginData.authorization;

    const quantity = 3;
    const cartData = DataGenerator.generateValidCart(productId, quantity);

    const productResponse = await request.get(`/produtos/${productId}`);
    const productDetails = await productResponse.json();
    const expectedTotal = productDetails.preco * quantity;

    const createCartResponse = await request.post("/carrinhos", {
      data: cartData,
      headers: { Authorization: userToken },
    });

    const cartId = (await createCartResponse.json())._id;
    const response = await request.get(`/carrinhos/${cartId}`);

    expect(response.ok()).toBeTruthy();

    const responseBody = await response.json();
    expect(responseBody.precoTotal).toBe(expectedTotal);
    expect(responseBody.quantidadeTotal).toBe(quantity);

    await request.delete("/carrinhos/cancelar-compra", {
      headers: { Authorization: userToken },
    });
  });

  test("Deve concluir compra (DELETE) de um carrinho com sucesso", async ({
    request,
  }) => {
    const user = DataGenerator.generateValidUser(false);
    await request.post("/usuarios", { data: user });

    const loginResponse = await request.post("/login", {
      data: { email: user.email, password: user.password },
    });
    const loginData = await loginResponse.json();
    const userToken = loginData.authorization;

    const cartData = DataGenerator.generateValidCart(productId, 1);
    await request.post("/carrinhos", {
      data: cartData,
      headers: { Authorization: userToken },
    });

    const response = await request.delete("/carrinhos/concluir-compra", {
      headers: { Authorization: userToken },
    });

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty("message");
    expect(responseBody.message).toBe("Registro excluído com sucesso");
  });

  test("Deve cancelar compra de um carrinho com sucesso", async ({
    request,
  }) => {
    const user = DataGenerator.generateValidUser(false);
    await request.post("/usuarios", { data: user });

    const loginResponse = await request.post("/login", {
      data: { email: user.email, password: user.password },
    });
    const loginData = await loginResponse.json();
    const userToken = loginData.authorization;

    const cartData = DataGenerator.generateValidCart(productId, 1);
    await request.post("/carrinhos", {
      data: cartData,
      headers: { Authorization: userToken },
    });

    const response = await request.delete("/carrinhos/cancelar-compra", {
      headers: { Authorization: userToken },
    });

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty("message");
    expect(responseBody.message).toBe(
      "Registro excluído com sucesso. Estoque dos produtos reabastecido"
    );
  });

  test("Deve retornar erro ao concluir compra sem autenticação", async ({
    request,
  }) => {
    // Act
    const response = await request.delete("/carrinhos/concluir-compra");

    expect(response.status()).toBe(401);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty("message");
    expect(responseBody.message).toBe(
      "Token de acesso ausente, inválido, expirado ou usuário do token não existe mais"
    );
  });

  test("Deve retornar erro ao cancelar compra sem autenticação", async ({
    request,
  }) => {
    const response = await request.delete("/carrinhos/cancelar-compra");

    expect(response.status()).toBe(401);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty("message");
    expect(responseBody.message).toBe(
      "Token de acesso ausente, inválido, expirado ou usuário do token não existe mais"
    );
  });
});
