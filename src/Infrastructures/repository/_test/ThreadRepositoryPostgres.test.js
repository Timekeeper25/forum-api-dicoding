const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AddThread = require('../../../Domains/threads/entities/AddThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');

describe('ThreadRepositoryPostgres', () => {
  let threadRepository;
  let mockIdGenerator;

  beforeEach(() => {
    // Using concrete implementation for pool instead of mocking
    mockIdGenerator = jest.fn(() => '123');
    threadRepository = new ThreadRepositoryPostgres(pool, mockIdGenerator);
  });

  afterEach(async () => {
    // Clean up test data
    await pool.query('DELETE FROM threads WHERE 1=1');
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addThread', () => {
    it('should persist thread and return added thread correctly', async () => {
      // Arrange - Add user first for foreign key constraint
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      
      const newThread = new AddThread({
        title: 'Judul Thread',
        body: 'Thread Body',
        owner: 'user-123'
      });

      // Act
      const result = await threadRepository.addThread({ 
        addThread: newThread, 
        owner: 'user-123' 
      });

      // Assert - Verify return value properties
      expect(result.id).toEqual('thread-123');
      expect(result.title).toEqual('Judul Thread');
      expect(result.owner).toEqual('user-123');
      
      // Assert - Verify return type is AddedThread object
      expect(result).toBeInstanceOf(AddedThread);

      // Assert - Verify data exists in database
      const query = {
        text: 'SELECT * FROM threads WHERE id = $1',
        values: ['thread-123'],
      };
      const dbResult = await pool.query(query);
      
      expect(dbResult.rows).toHaveLength(1);
      expect(dbResult.rows[0].id).toEqual('thread-123');
      expect(dbResult.rows[0].title).toEqual('Judul Thread');
      expect(dbResult.rows[0].body).toEqual('Thread Body');
      expect(dbResult.rows[0].owner).toEqual('user-123');
      expect(dbResult.rows[0].date).toBeDefined();
    });
  });

  describe('verifyThreadExists', () => {
    it('should not throw NotFoundError if thread exists', async () => {
      // Arrange - Add user and thread
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await pool.query({
        text: 'INSERT INTO threads (id, title, body, owner, date) VALUES($1, $2, $3, $4, $5)',
        values: ['thread-123', 'Test Title', 'Test Body', 'user-123', new Date().toISOString()],
      });

      // Act & Assert - Should not throw any error, specifically NotFoundError
      await expect(threadRepository.verifyThreadExists('thread-123'))
        .resolves.not.toThrow(NotFoundError);
    });

    it('should throw NotFoundError if thread does not exist', async () => {
      // Act & Assert
      await expect(threadRepository.verifyThreadExists('thread-nonexistent'))
        .rejects.toThrow(NotFoundError);
      await expect(threadRepository.verifyThreadExists('thread-nonexistent'))
        .rejects.toThrow('Thread tidak ditemukan');
    });
  });

  describe('getThreadById', () => {
    it('should return thread if exists', async () => {
      // Arrange - Add user and thread
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await pool.query({
        text: 'INSERT INTO threads (id, title, body, owner, date) VALUES($1, $2, $3, $4, $5)',
        values: ['thread-123', 'Judul Thread', 'Thread Body', 'user-123', new Date().toISOString()],
      });

      // Act
      const result = await threadRepository.getThreadById('thread-123');

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toEqual('thread-123');
      expect(result.title).toEqual('Judul Thread');
      expect(result.body).toEqual('Thread Body');
      expect(result.owner).toEqual('user-123');
      expect(result.date).toBeDefined();
    });

    it('should return undefined if thread does not exist', async () => {
      // Act
      const result = await threadRepository.getThreadById('thread-nonexistent');

      // Assert
      expect(result).toBeUndefined();
    });
  });
});