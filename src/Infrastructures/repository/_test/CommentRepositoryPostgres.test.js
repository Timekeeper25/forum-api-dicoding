const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const InvariantError = require('../../../Commons/exceptions/InvariantError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

describe('CommentRepositoryPostgres', () => {
  let mockPool;

  beforeEach(() => {
    mockPool = {
      query: jest.fn(),
    };
  });

  describe('addComment', () => {
    it('should persist comment and return correct values', async () => {
      const payload = {
        id: 'comment-123',
        threadId: 'thread-123',
        content: 'sebuah komentar',
        date: new Date(),
      };

      mockPool.query.mockResolvedValue({
        rows: [{ id: payload.id, thread_id: payload.threadId }],
      });

      const repo = new CommentRepositoryPostgres(mockPool);
      await expect(repo.addThreadComment(payload)).resolves.not.toThrow();

      expect(mockPool.query).toHaveBeenCalledWith(expect.objectContaining({
        text: expect.stringContaining('INSERT INTO comments'),
        values: expect.arrayContaining([payload.id, payload.threadId, payload.content, payload.date]),
      }));
    });
  });

  describe('deleteThreadComment', () => {
    it('should soft delete a comment', async () => {
      mockPool.query.mockResolvedValue({ rowCount: 1 });

      const repo = new CommentRepositoryPostgres(mockPool);
      await expect(repo.deleteThreadComment('comment-123')).resolves.not.toThrow();
    });

    it('should throw InvariantError when comment not found', async () => {
      mockPool.query.mockResolvedValue({ rowCount: 0 });

      const repo = new CommentRepositoryPostgres(mockPool);
      await expect(repo.deleteThreadComment('comment-404')).rejects.toThrow(InvariantError);
    });
  });

  describe('verifyCommentOwner', () => {
    it('should pass if comment is owned by user', async () => {
      mockPool.query.mockResolvedValue({
        rowCount: 1,
        rows: [{ owner: 'user-123' }],
      });

      const repo = new CommentRepositoryPostgres(mockPool);
      await expect(repo.verifyCommentOwner('comment-123', 'user-123')).resolves.not.toThrow();
    });

    it('should throw InvariantError if comment does not exist', async () => {
      mockPool.query.mockResolvedValue({ rowCount: 0 });

      const repo = new CommentRepositoryPostgres(mockPool);
      await expect(repo.verifyCommentOwner('comment-404', 'user-123')).rejects.toThrow(InvariantError);
    });

    it('should throw AuthorizationError if user is not owner', async () => {
      mockPool.query.mockResolvedValue({
        rowCount: 1,
        rows: [{ owner: 'user-456' }],
      });

      const repo = new CommentRepositoryPostgres(mockPool);
      await expect(repo.verifyCommentOwner('comment-123', 'user-123')).rejects.toThrow(AuthorizationError);
    });
  });

  describe('getCommentsByThreadId', () => {
    it('should return list of comments for a thread', async () => {
      const threadId = 'thread-123';
      const mockRows = [
        { id: 'comment-1', content: 'abc', date: new Date(), owner: 'user-1', is_delete: false },
        { id: 'comment-2', content: 'def', date: new Date(), owner: 'user-2', is_delete: true },
      ];
      mockPool.query.mockResolvedValue({ rows: mockRows });

      const repo = new CommentRepositoryPostgres(mockPool);
      const result = await repo.getCommentsByThreadId(threadId);

      expect(mockPool.query).toHaveBeenCalledWith(expect.objectContaining({
        text: expect.stringContaining('SELECT'),
        values: [threadId],
      }));
      expect(result).toEqual(mockRows);
    });
  });
});
