const {
  test,
  expect,
  request: playwrightRequest,
} = require("@playwright/test");
const DataGenerator = require("../utils/data-generator");

test.describe("Produtos - Cenários Críticos", () => {
  let adminToken;
  let commonUserToken;
  let baseURL = "https://serverest.dev";

  test.beforeAll(async () => {
    const context = await playwrightRequest.newContext({ baseURL });

    const adminUser = DataGenerator.generateValidUser(true);
    await context.post("/usuarios", { data: adminUser });

    const adminLoginResponse = await context.post("/login", {
      data: { email: adminUser.email, password: adminUser.password },
    });
    const adminLoginData = await adminLoginResponse.json();
    adminToken = adminLoginData.authorization;

    const commonUser = DataGenerator.generateValidUser(false);
    await context.post("/usuarios", { data: commonUser });

    const commonLoginResponse = await context.post("/login", {
      data: { email: commonUser.email, password: commonUser.password },
    });
    const commonLoginData = await commonLoginResponse.json();
    commonUserToken = commonLoginData.authorization;

    await context.dispose();
  });

  test("[CRÍTICO] Deve cadastrar novo produto com token de administrador", async ({
    request,
  }) => {
    const newProduct = DataGenerator.generateValidProduct();

    const response = await request.post("/produtos", {
      data: newProduct,
      headers: { Authorization: adminToken },
    });

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(201);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty("message");
    expect(responseBody.message).toBe("Cadastro realizado com sucesso");
    expect(responseBody).toHaveProperty("_id");

    await request.delete(`/produtos/${responseBody._id}`, {
      headers: { Authorization: adminToken },
    });
  });

  test("[CRÍTICO] Deve listar todos os produtos cadastrados", async ({
    request,
  }) => {
    const product1 = DataGenerator.generateValidProduct();
    const product2 = DataGenerator.generateValidProduct();

    const response1 = await request.post("/produtos", {
      data: product1,
      headers: { Authorization: adminToken },
    });
    const id1 = (await response1.json())._id;

    const response2 = await request.post("/produtos", {
      data: product2,
      headers: { Authorization: adminToken },
    });
    const id2 = (await response2.json())._id;

    const response = await request.get("/produtos");

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty("quantidade");
    expect(responseBody.quantidade).toBeGreaterThan(0);
    expect(responseBody).toHaveProperty("produtos");
    expect(Array.isArray(responseBody.produtos)).toBeTruthy();

    await request.delete(`/produtos/${id1}`, {
      headers: { Authorization: adminToken },
    });
    await request.delete(`/produtos/${id2}`, {
      headers: { Authorization: adminToken },
    });
  });

  test("Deve retornar erro ao cadastrar produto sem autenticação", async ({
    request,
  }) => {
    const newProduct = DataGenerator.generateValidProduct();

    const response = await request.post("/produtos", {
      data: newProduct,
    });

    expect(response.status()).toBe(401);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty("message");
    expect(responseBody.message).toBe(
      "Token de acesso ausente, inválido, expirado ou usuário do token não existe mais"
    );
  });

  test("Deve retornar erro ao cadastrar produto com token de usuário comum (não admin)", async ({
    request,
  }) => {
    const newProduct = DataGenerator.generateValidProduct();

    const response = await request.post("/produtos", {
      data: newProduct,
      headers: { Authorization: commonUserToken },
    });

    expect(response.status()).toBe(403);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty("message");
    expect(responseBody.message).toBe("Rota exclusiva para administradores");
  });

  test("Deve retornar erro ao cadastrar produto com nome já existente", async ({
    request,
  }) => {
    const product = DataGenerator.generateValidProduct();
    const createResponse = await request.post("/produtos", {
      data: product,
      headers: { Authorization: adminToken },
    });
    const productId = (await createResponse.json())._id;

    const response = await request.post("/produtos", {
      data: product,
      headers: { Authorization: adminToken },
    });

    expect(response.status()).toBe(400);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty("message");
    expect(responseBody.message).toBe("Já existe produto com esse nome");

    await request.delete(`/produtos/${productId}`, {
      headers: { Authorization: adminToken },
    });
  });

  test("Deve retornar erro ao cadastrar produto sem informar nome", async ({
    request,
  }) => {
    const invalidProduct = {
      preco: 100,
      descricao: "Produto teste",
      quantidade: 10,
    };

    const response = await request.post("/produtos", {
      data: invalidProduct,
      headers: { Authorization: adminToken },
    });

    expect(response.status()).toBe(400);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty("nome");
    expect(responseBody.nome).toBe("nome é obrigatório");
  });

  test("Deve retornar erro ao cadastrar produto sem informar preço", async ({
    request,
  }) => {
    const invalidProduct = {
      nome: DataGenerator.generateProductName(),
      descricao: "Produto teste",
      quantidade: 10,
    };

    const response = await request.post("/produtos", {
      data: invalidProduct,
      headers: { Authorization: adminToken },
    });

    expect(response.status()).toBe(400);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty("preco");
    expect(responseBody.preco).toBe("preco é obrigatório");
  });

  test("Deve buscar produto por ID válido", async ({ request }) => {
    const product = DataGenerator.generateValidProduct();
    const createResponse = await request.post("/produtos", {
      data: product,
      headers: { Authorization: adminToken },
    });
    const productId = (await createResponse.json())._id;

    const response = await request.get(`/produtos/${productId}`);

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(responseBody.nome).toBe(product.nome);
    expect(responseBody.preco).toBe(product.preco);
    expect(responseBody._id).toBe(productId);

    await request.delete(`/produtos/${productId}`, {
      headers: { Authorization: adminToken },
    });
  });

  test("Deve retornar erro ao buscar produto com ID inexistente", async ({
    request,
  }) => {
    const invalidId = "ID_INEXISTENTE";

    const response = await request.get(`/produtos/${invalidId}`);

    expect(response.status()).toBe(400);

    const responseBody = await response.json();
    expect(responseBody).toBeDefined();
  });

  test("Deve deletar produto com sucesso", async ({ request }) => {
    const product = DataGenerator.generateValidProduct();
    const createResponse = await request.post("/produtos", {
      data: product,
      headers: { Authorization: adminToken },
    });
    const productId = (await createResponse.json())._id;

    const response = await request.delete(`/produtos/${productId}`, {
      headers: { Authorization: adminToken },
    });

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty("message");
    expect(responseBody.message).toBe("Registro excluído com sucesso");
  });

  test("Deve retornar erro ao deletar produto sem autenticação", async ({
    request,
  }) => {
    const product = DataGenerator.generateValidProduct();
    const createResponse = await request.post("/produtos", {
      data: product,
      headers: { Authorization: adminToken },
    });
    const productId = (await createResponse.json())._id;

    const response = await request.delete(`/produtos/${productId}`);

    expect(response.status()).toBe(401);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty("message");
    expect(responseBody.message).toBe(
      "Token de acesso ausente, inválido, expirado ou usuário do token não existe mais"
    );

    await request.delete(`/produtos/${productId}`, {
      headers: { Authorization: adminToken },
    });
  });
});
