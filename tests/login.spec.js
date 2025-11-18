const { test, expect } = require("@playwright/test");
const ApiHelper = require("./helpers/api-helper");
const DataGenerator = require("../utils/data-generator");

test.describe("Login - Cenários Críticos", () => {
  let apiHelper;
  let adminUser;
  let commonUser;

  test.beforeAll(async ({ request }) => {
    apiHelper = new ApiHelper(request);

    adminUser = DataGenerator.generateValidUser(true);
    await apiHelper.createUser(adminUser);

    commonUser = DataGenerator.generateValidUser(false);
    await apiHelper.createUser(commonUser);
  });

  test("[CRÍTICO] Deve realizar login com credenciais válidas de usuário administrador", async ({
    request,
  }) => {
    const loginData = {
      email: adminUser.email,
      password: adminUser.password,
    };

    const response = await request.post("/login", {
      data: loginData,
    });

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const responseBody = await response.json();

    expect(responseBody).toHaveProperty("message");
    expect(responseBody.message).toBe("Login realizado com sucesso");

    expect(responseBody).toHaveProperty("authorization");
    expect(responseBody.authorization).toContain("Bearer");
    expect(responseBody.authorization).toMatch(
      /^Bearer\s+[\w-]+\.[\w-]+\.[\w-]+$/
    );
  });

  test("[CRÍTICO] Deve realizar login com credenciais válidas de usuário comum", async ({
    request,
  }) => {
    const loginData = {
      email: commonUser.email,
      password: commonUser.password,
    };

    const response = await request.post("/login", {
      data: loginData,
    });

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const responseBody = await response.json();

    expect(responseBody).toHaveProperty("message");
    expect(responseBody.message).toBe("Login realizado com sucesso");

    expect(responseBody).toHaveProperty("authorization");
    expect(responseBody.authorization).toContain("Bearer");
    expect(responseBody.authorization).toMatch(
      /^Bearer\s+[\w-]+\.[\w-]+\.[\w-]+$/
    );
  });

  test("Deve retornar erro ao fazer login com email inválido", async ({
    request,
  }) => {
    const loginData = {
      email: "usuario_inexistente@test.com",
      password: "senha123",
    };

    const response = await request.post("/login", {
      data: loginData,
    });

    expect(response.status()).toBe(401);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty("message");
    expect(responseBody.message).toBe("Email e/ou senha inválidos");
  });

  test("Deve retornar erro ao fazer login com senha incorreta", async ({
    request,
  }) => {
    const loginData = {
      email: adminUser.email,
      password: "senha_errada",
    };

    const response = await request.post("/login", {
      data: loginData,
    });

    expect(response.status()).toBe(401);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty("message");
    expect(responseBody.message).toBe("Email e/ou senha inválidos");
  });

  test("Deve retornar erro ao fazer login sem informar email", async ({
    request,
  }) => {
    const loginData = {
      password: "senha123",
    };

    const response = await request.post("/login", {
      data: loginData,
    });

    expect(response.status()).toBe(400);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty("email");
    expect(responseBody.email).toBe("email é obrigatório");
  });

  test("Deve retornar erro ao fazer login sem informar senha", async ({
    request,
  }) => {
    const loginData = {
      email: adminUser.email,
    };

    const response = await request.post("/login", {
      data: loginData,
    });

    expect(response.status()).toBe(400);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty("password");
    expect(responseBody.password).toBe("password é obrigatório");
  });
});
