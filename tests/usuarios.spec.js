const { test, expect } = require("@playwright/test");
const ApiHelper = require("./helpers/api-helper");
const DataGenerator = require("../utils/data-generator");

test.describe("Usuários - Cenários Críticos", () => {
  let apiHelper;
  let createdUserIds = [];

  test.beforeEach(async ({ request }) => {
    apiHelper = new ApiHelper(request);
  });

  test.afterEach(async () => {
    for (const userId of createdUserIds) {
      try {
        await apiHelper.deleteUser(userId);
      } catch (error) {}
    }
    createdUserIds = [];
  });

  test("[CRÍTICO] Deve cadastrar novo usuário com dados válidos", async ({
    request,
  }) => {
    const newUser = DataGenerator.generateValidUser(false);

    const response = await request.post("/usuarios", {
      data: newUser,
    });

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(201);

    const responseBody = await response.json();

    expect(responseBody).toHaveProperty("message");
    expect(responseBody.message).toBe("Cadastro realizado com sucesso");

    expect(responseBody).toHaveProperty("_id");
    expect(responseBody._id).toBeTruthy();
    expect(typeof responseBody._id).toBe("string");

    createdUserIds.push(responseBody._id);

    const getUserResponse = await request.get(`/usuarios/${responseBody._id}`);
    expect(getUserResponse.ok()).toBeTruthy();

    const userDetails = await getUserResponse.json();
    expect(userDetails.nome).toBe(newUser.nome);
    expect(userDetails.email).toBe(newUser.email);
    expect(userDetails.administrador).toBe(newUser.administrador);
  });

  test("[CRÍTICO] Deve listar todos os usuários cadastrados", async ({
    request,
  }) => {
    const user1 = DataGenerator.generateValidUser(true);
    const user2 = DataGenerator.generateValidUser(false);

    const { userId: userId1 } = await apiHelper.createUser(user1);
    const { userId: userId2 } = await apiHelper.createUser(user2);

    createdUserIds.push(userId1, userId2);

    const response = await request.get("/usuarios");

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const responseBody = await response.json();

    expect(responseBody).toHaveProperty("quantidade");
    expect(typeof responseBody.quantidade).toBe("number");
    expect(responseBody.quantidade).toBeGreaterThan(0);

    expect(responseBody).toHaveProperty("usuarios");
    expect(Array.isArray(responseBody.usuarios)).toBeTruthy();
    expect(responseBody.usuarios.length).toBe(responseBody.quantidade);

    const firstUser = responseBody.usuarios[0];
    expect(firstUser).toHaveProperty("nome");
    expect(firstUser).toHaveProperty("email");
    expect(firstUser).toHaveProperty("password");
    expect(firstUser).toHaveProperty("administrador");
    expect(firstUser).toHaveProperty("_id");
  });

  test("Deve retornar erro ao cadastrar usuário com email já existente", async ({
    request,
  }) => {
    const user = DataGenerator.generateValidUser(false);
    const { userId } = await apiHelper.createUser(user);
    createdUserIds.push(userId);

    const response = await request.post("/usuarios", {
      data: user,
    });

    expect(response.status()).toBe(400);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty("message");
    expect(responseBody.message).toBe("Este email já está sendo usado");
  });

  test("Deve retornar erro ao cadastrar usuário sem informar nome", async ({
    request,
  }) => {
    const invalidUser = {
      email: DataGenerator.generateEmail(),
      password: "senha123",
      administrador: "false",
    };

    const response = await request.post("/usuarios", {
      data: invalidUser,
    });

    expect(response.status()).toBe(400);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty("nome");
    expect(responseBody.nome).toBe("nome é obrigatório");
  });

  test("Deve retornar erro ao cadastrar usuário sem informar email", async ({
    request,
  }) => {
    const invalidUser = {
      nome: "Usuario Teste",
      password: "senha123",
      administrador: "false",
    };

    const response = await request.post("/usuarios", {
      data: invalidUser,
    });

    expect(response.status()).toBe(400);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty("email");
    expect(responseBody.email).toBe("email é obrigatório");
  });

  test("Deve retornar erro ao cadastrar usuário com email em formato inválido", async ({
    request,
  }) => {
    const invalidUser = {
      nome: "Usuario Teste",
      email: "email_invalido",
      password: "senha123",
      administrador: "false",
    };

    const response = await request.post("/usuarios", {
      data: invalidUser,
    });

    expect(response.status()).toBe(400);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty("email");
    expect(responseBody.email).toBe("email deve ser um email válido");
  });

  test("Deve buscar usuário por ID válido", async ({ request }) => {
    const user = DataGenerator.generateValidUser(false);
    const { userId } = await apiHelper.createUser(user);
    createdUserIds.push(userId);

    const response = await request.get(`/usuarios/${userId}`);

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(responseBody.nome).toBe(user.nome);
    expect(responseBody.email).toBe(user.email);
    expect(responseBody.administrador).toBe(user.administrador);
    expect(responseBody._id).toBe(userId);
  });

  test("Deve retornar erro ao buscar usuário com ID inexistente", async ({
    request,
  }) => {
    const invalidId = "ID_INEXISTENTE";

    const response = await request.get(`/usuarios/${invalidId}`);

    expect(response.status()).toBe(400);

    const responseBody = await response.json();
    expect(responseBody).toBeDefined();
  });

  test("Deve deletar usuário com sucesso", async ({ request }) => {
    const user = DataGenerator.generateValidUser(false);
    const { userId } = await apiHelper.createUser(user);

    const response = await request.delete(`/usuarios/${userId}`);

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty("message");
    expect(responseBody.message).toBe("Registro excluído com sucesso");

    const getUserResponse = await request.get(`/usuarios/${userId}`);
    expect(getUserResponse.status()).toBe(400);
  });
});
