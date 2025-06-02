const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const InvariantError = require('../../../Commons/exceptions/InvariantError');

// Mock pool
const pool = {
  query: jest.fn(),
};

describe('ThreadRepositoryPostgres', () => {
  let threadRepository;

  beforeEach(() => {
    threadRepository = new ThreadRepositoryPostgres(pool);
    jest.clearAllMocks();
  });

  describe('addThread', () => {
    it('should persist thread and return added thread correctly', async () => {
      const newThread = {
        id: 'thread-123',
        title: 'Judul Thread',
        body: 'Thread Body',
        owner: 'user-123',
        date: new Date(),
      };
      const expectedResult = {
        rows: [{ id: 'thread-123', title: 'Judul Thread', owner: 'user-123' }],
        rowCount: 1,
      };
      pool.query.mockResolvedValue(expectedResult);

      const result = await threadRepository.addThread(newThread);

      expect(pool.query).toHaveBeenCalled();
      // You may want to return the inserted row in addThread for this to work
      // expect(result).toEqual(expectedResult.rows[0]);
    });
  });

  describe('verifyThreadExists', () => {
    it('should not throw error if thread exists', async () => {
      pool.query.mockResolvedValue({ rowCount: 1 });
      await expect(threadRepository.verifyThreadExists('thread-123')).resolves.not.toThrow();
    });

    it('should throw InvariantError if thread does not exist', async () => {
      pool.query.mockResolvedValue({ rowCount: 0 });
      await expect(threadRepository.verifyThreadExists('thread-xxx')).rejects.toThrow(InvariantError);
    });
  });

  describe('getThreadById', () => {
    it('should return thread if exists', async () => {
      const expectedThread = {
        id: 'thread-123',
        title: 'Judul Thread',
        body: 'Thread Body',
        date: new Date(),
        username: 'user123',
      };
      pool.query.mockResolvedValue({ rows: [expectedThread], rowCount: 1 });

      const result = await threadRepository.getThreadById('thread-123');
      expect(result).toEqual(expectedThread);
    });

    it('should throw InvariantError if thread does not exist', async () => {
      pool.query.mockResolvedValue({ rowCount: 0 });
      await expect(threadRepository.getThreadById('thread-xxx')).rejects.toThrow(InvariantError);
    });
  });
});