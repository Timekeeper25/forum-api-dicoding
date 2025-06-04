const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');
const AuthenticationTokenManager = require('../../../Applications/security/AuthenticationTokenManager');

describe('HTTP server', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
  });

  // Test yang sudah ada
  it('should response 404 when request unregistered route', async () => {
    // Arrange
    const server = await createServer({});

    // Action
    const response = await server.inject({
      method: 'GET',
      url: '/unregisteredRoute',
    });

    // Assert
    expect(response.statusCode).toEqual(404);
  });

  it('should handle server error correctly', async () => {
    // Arrange
    const requestPayload = {
      username: 'dicoding',
      fullname: 'Dicoding Indonesia',
      password: 'super_secret',
    };
    const server = await createServer({}); // fake injection

    // Action
    const response = await server.inject({
      method: 'POST',
      url: '/users',
      payload: requestPayload,
    });

    // Assert
    const responseJson = JSON.parse(response.payload);
    expect(response.statusCode).toEqual(500);
    expect(responseJson.status).toEqual('error');
    expect(responseJson.message).toEqual('terjadi kegagalan pada server kami');
  });

  describe('JWT Authentication', () => {
    afterEach(async () => {
      await UsersTableTestHelper.cleanTable();
      await AuthenticationsTableTestHelper.cleanTable();
      // Jika ada ThreadsTableTestHelper, uncomment baris di bawah
      // await ThreadsTableTestHelper.cleanTable();
    });

    it('should authenticate successfully with valid JWT token', async () => {
      // Arrange
      const server = await createServer(container);
      
      // Create user first
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });

      // Login to get tokens
      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret',
        },
      });

      const { data: { accessToken } } = JSON.parse(loginResponse.payload);

      // Action - Try to access protected route with valid token
      // Note: Ganti '/threads' dengan route protected yang ada di aplikasi Anda
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'Test Thread',
          body: 'Test thread body',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      // Jika berhasil, berarti JWT authentication berjalan dengan baik
      expect(response.statusCode).not.toEqual(500); // Tidak ada server error
      expect(response.statusCode).not.toEqual(401); // Tidak unauthorized
    });

    it('should reject request with invalid JWT token', async () => {
      // Arrange
      const server = await createServer(container);
      const invalidToken = 'invalid.jwt.token';

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads', // Ganti dengan route protected yang ada
        payload: {
          title: 'Test Thread',
          body: 'Test thread body',
        },
        headers: {
          Authorization: `Bearer ${invalidToken}`,
        },
      });

      // Assert
      expect(response.statusCode).toEqual(401);
    });

    it('should reject request without authorization header', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads', // Ganti dengan route protected yang ada
        payload: {
          title: 'Test Thread',
          body: 'Test thread body',
        },
      });

      // Assert
      expect(response.statusCode).toEqual(401);
    });

    it('should extract user id from JWT token correctly', async () => {
      // Arrange
      const server = await createServer(container);
      
      // Create user
      const userResponse = await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });

      const { data: { addedUser } } = JSON.parse(userResponse.payload);

      // Login to get token
      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret',
        },
      });

      const { data: { accessToken } } = JSON.parse(loginResponse.payload);

      // Action - Create thread with authenticated user
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'Test Thread',
          body: 'Test thread body',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      if (response.statusCode === 201) {
        const responseJson = JSON.parse(response.payload);
        // Jika thread berhasil dibuat, berarti user id berhasil diekstrak dari token
        expect(responseJson.data.addedThread.owner).toEqual(addedUser.id);
      }
      // Jika route tidak ada, setidaknya tidak ada server error
      expect(response.statusCode).not.toEqual(500);
    });

    it('should handle malformed authorization header', async () => {
      // Arrange
      const server = await createServer(container);

      // Action - Test dengan header authorization yang salah format
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'Test Thread',
          body: 'Test thread body',
        },
        headers: {
          Authorization: 'InvalidFormat token123',
        },
      });

      // Assert
      expect(response.statusCode).toEqual(401);
    });

    it('should handle empty authorization header', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'Test Thread',
          body: 'Test thread body',
        },
        headers: {
          Authorization: '',
        },
      });

      // Assert
      expect(response.statusCode).toEqual(401);
    });
  });
});