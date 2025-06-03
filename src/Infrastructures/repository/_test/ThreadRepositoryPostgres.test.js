const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const InvariantError = require('../../../Commons/exceptions/InvariantError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AddThread = require('../../../Domains/threads/entities/AddThread');

describe('ThreadRepositoryPostgres', () => {
  let threadRepository;
  let mockPool;
  let mockIdGenerator;

  beforeEach(() => {
    mockPool = {
      query: jest.fn(),
    };
    mockIdGenerator = jest.fn(() => '123');
    threadRepository = new ThreadRepositoryPostgres(mockPool, mockIdGenerator);
  });

  describe('addThread', () => {
    it('should persist thread and return added thread correctly', async () => {
      // Arrange
      const newThread = new AddThread({
        title: 'Judul Thread',
        body: 'Thread Body',
        owner: 'user-123'
      });

      const expectedResult = {
        rows: [{ id: 'thread-123', title: 'Judul Thread', owner: 'user-123' }],
      };
      mockPool.query.mockResolvedValue(expectedResult);

      // Act
      const result = await threadRepository.addThread({ addThread: newThread, owner: 'user-123' });

      // Assert
      expect(mockPool.query).toHaveBeenCalled();
      expect(result.id).toEqual('thread-123');
      expect(result.title).toEqual('Judul Thread');
      expect(result.owner).toEqual('user-123');
    });
  });

  describe('verifyThreadExists', () => {
    it('should not throw error if thread exists', async () => {
      mockPool.query.mockResolvedValue({ rowCount: 1, rows: [{ id: 'thread-123' }] });
      await expect(threadRepository.verifyThreadExists('thread-123')).resolves.not.toThrow();
    });

    it('should throw NotFoundError if thread does not exist', async () => {
      mockPool.query.mockResolvedValue({ rowCount: 0 });
      await expect(threadRepository.verifyThreadExists('thread-xxx')).rejects.toThrow(NotFoundError);
    });
  });

  describe('getThreadById', () => {
    it('should return thread if exists', async () => {
      const expectedThread = {
        id: 'thread-123',
        title: 'Judul Thread',
        body: 'Thread Body',
        date: new Date().toISOString(),
        owner: 'user-123',
      };
      mockPool.query.mockResolvedValue({ rows: [expectedThread], rowCount: 1 });

      const result = await threadRepository.getThreadById('thread-123');
      expect(result).toEqual(expectedThread);
    });

    it('should return null if thread does not exist', async () => {
      mockPool.query.mockResolvedValue({ rows: [], rowCount: 0 });
      const result = await threadRepository.getThreadById('thread-xxx');
      expect(result).toBeUndefined();
    });
  });
});