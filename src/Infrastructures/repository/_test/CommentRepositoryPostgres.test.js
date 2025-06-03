const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const InvariantError = require('../../../Commons/exceptions/InvariantError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const AddThreadComment = require('../../../Domains/comments/entities/AddThreadComment');

describe('CommentRepositoryPostgres', () => {
  let mockPool;
  let commentRepository;
  let mockIdGenerator;

  beforeEach(() => {
    mockPool = {
      query: jest.fn(),
    };
    mockIdGenerator = jest.fn(() => '123');
    commentRepository = new CommentRepositoryPostgres(mockPool, mockIdGenerator);
  });

  describe('addComment', () => {
    it('should persist comment and return correct values', async () => {
      const payload = new AddThreadComment({
        content: 'sebuah komentar',
        threadId: 'thread-123',
        owner: 'user-123'
      });

      const expectedResult = {
        rows: [{
          id: 'comment-123',
          content: payload.content,
          owner: payload.owner
        }]
      };

      mockPool.query.mockResolvedValue(expectedResult);

      const result = await commentRepository.addThreadComment(payload);

      expect(mockPool.query).toHaveBeenCalledWith(expect.objectContaining({
        text: expect.stringContaining('INSERT INTO comments'),
        values: expect.arrayContaining([
          'comment-123',
          payload.threadId,
          payload.content,
          expect.any(String),
          payload.owner
        ]),
      }));

      expect(result.id).toEqual('comment-123');
      expect(result.content).toEqual(payload.content);
      expect(result.owner).toEqual(payload.owner);
    });
  });

  describe('deleteThreadComment', () => {
    it('should soft delete a comment', async () => {
      mockPool.query.mockResolvedValue({ rowCount: 1 });
      await expect(commentRepository.deleteThreadComment('comment-123')).resolves.not.toThrow();
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining('UPDATE comments SET is_delete = true'),
          values: ['comment-123'],
        })
      );
    });

    it('should throw InvariantError when comment not found', async () => {
      mockPool.query.mockResolvedValue({ rowCount: 0 });
      await expect(commentRepository.deleteThreadComment('comment-404')).rejects.toThrow(InvariantError);
    });
  });

  describe('verifyCommentOwner', () => {
    it('should pass if comment is owned by user', async () => {
      mockPool.query.mockResolvedValue({
        rowCount: 1,
        rows: [{ owner: 'user-123' }],
      });

      await expect(commentRepository.verifyCommentOwner('comment-123', 'user-123')).resolves.not.toThrow();
    });

    it('should throw InvariantError if comment does not exist', async () => {
      mockPool.query.mockResolvedValue({ rowCount: 0 });
      await expect(commentRepository.verifyCommentOwner('comment-404', 'user-123')).rejects.toThrow(InvariantError);
    });

    it('should throw AuthorizationError if user is not owner', async () => {
      mockPool.query.mockResolvedValue({
        rowCount: 1,
        rows: [{ owner: 'user-456' }],
      });

      await expect(commentRepository.verifyCommentOwner('comment-123', 'user-123')).rejects.toThrow(AuthorizationError);
    });
  });

  describe('getCommentsByThreadId', () => {
    it('should return list of comments for a thread', async () => {
      const threadId = 'thread-123';
      const mockComments = [
        { id: 'comment-1', content: 'abc', date: new Date().toISOString(), owner: 'user-1', is_delete: false },
        { id: 'comment-2', content: 'def', date: new Date().toISOString(), owner: 'user-2', is_delete: true },
      ];
      mockPool.query.mockResolvedValue({ rows: mockComments });

      const result = await commentRepository.getCommentsByThreadId(threadId);

      expect(mockPool.query).toHaveBeenCalledWith(expect.objectContaining({
        text: expect.stringContaining('SELECT'),
        values: [threadId],
      }));
      expect(result).toEqual(mockComments);
    });
  });
});
