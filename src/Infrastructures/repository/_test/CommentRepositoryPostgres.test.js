const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const InvariantError = require('../../../Commons/exceptions/InvariantError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AddThreadComment = require('../../../Domains/comments/entities/AddThreadComment');
const AddedThreadComment = require('../../../Domains/comments/entities/AddedThreadComment');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');

describe('CommentRepositoryPostgres', () => {
  let commentRepository;
  let mockIdGenerator;

  beforeEach(() => {
    mockIdGenerator = jest.fn(() => '123');
    commentRepository = new CommentRepositoryPostgres(pool, mockIdGenerator);
  });

  afterEach(async () => {
    // Clean up test data in reverse order of dependencies
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addThreadComment', () => {
    it('should persist comment and return added comment correctly', async () => {
      // Arrange - Add user and thread first for foreign key constraints
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      
      const newComment = new AddThreadComment({
        content: 'sebuah komentar',
        threadId: 'thread-123',
        owner: 'user-123'
      });

      // Act
      const result = await commentRepository.addThreadComment(newComment);

      // Assert - Verify return value properties
      expect(result.id).toEqual('comment-123');
      expect(result.content).toEqual('sebuah komentar');
      expect(result.owner).toEqual('user-123');
      
      // Assert - Verify return type is AddedThreadComment object
      expect(result).toBeInstanceOf(AddedThreadComment);

      // Assert - Verify data exists in database
      const query = {
        text: 'SELECT * FROM comments WHERE id = $1',
        values: ['comment-123'],
      };
      const dbResult = await pool.query(query);
      
      expect(dbResult.rows).toHaveLength(1);
      expect(dbResult.rows[0].id).toEqual('comment-123');
      expect(dbResult.rows[0].content).toEqual('sebuah komentar');
      expect(dbResult.rows[0].thread_id).toEqual('thread-123');
      expect(dbResult.rows[0].owner).toEqual('user-123');
      expect(dbResult.rows[0].date).toBeDefined();
      expect(dbResult.rows[0].is_delete).toBe(false);
    });
  });

  describe('deleteThreadComment', () => {
    it('should soft delete a comment', async () => {
      // Arrange - Add user, thread, and comment
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await pool.query({
        text: 'INSERT INTO comments (id, thread_id, content, date, owner, is_delete) VALUES($1, $2, $3, $4, $5, $6)',
        values: ['comment-123', 'thread-123', 'Test comment', new Date().toISOString(), 'user-123', false],
      });

      // Act
      await commentRepository.deleteThreadComment('comment-123');

      // Assert - Verify comment is soft deleted
      const query = {
        text: 'SELECT is_delete FROM comments WHERE id = $1',
        values: ['comment-123'],
      };
      const result = await pool.query(query);
      
      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].is_delete).toBe(true);
    });

    it('should throw InvariantError when comment not found', async () => {
      // Act & Assert
      await expect(commentRepository.deleteThreadComment('comment-nonexistent'))
        .rejects.toThrow(NotFoundError);
      await expect(commentRepository.deleteThreadComment('comment-nonexistent'))
        .rejects.toThrow('Comment Not Found');
    });
  });

  describe('verifyCommentOwner', () => {
  it('should not throw error if comment is owned by user', async () => {
    // Arrange - Add user, thread, and comment
    await UsersTableTestHelper.addUser({ id: 'user-123' });
    await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
    await pool.query({
      text: 'INSERT INTO comments (id, thread_id, content, date, owner, is_delete) VALUES($1, $2, $3, $4, $5, $6)',
      values: ['comment-123', 'thread-123', 'Test comment', new Date().toISOString(), 'user-123', false],
    });

    // Act & Assert - Should not throw any error, specifically not InvariantError or AuthorizationError
    await expect(commentRepository.verifyCommentOwner('comment-123', 'user-123'))
      .resolves.not.toThrow(InvariantError);
    await expect(commentRepository.verifyCommentOwner('comment-123', 'user-123'))
      .resolves.not.toThrow(AuthorizationError);
  });

  it('should throw InvariantError if comment does not exist', async () => {
    // Act & Assert
    await expect(commentRepository.verifyCommentOwner('comment-nonexistent', 'user-123'))
      .rejects.toThrow(NotFoundError);
    await expect(commentRepository.verifyCommentOwner('comment-nonexistent', 'user-123'))
      .rejects.toThrow('Komentar tidak ditemukan');
  });

  it('should throw AuthorizationError if user is not owner', async () => {
    // Arrange - Add users, thread, and comment owned by user-456
    await UsersTableTestHelper.addUser({ id: 'user-123' });
    await UsersTableTestHelper.addUser({ id: 'user-456', username: 'otheruser' });
    await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-456' });
    await pool.query({
      text: 'INSERT INTO comments (id, thread_id, content, date, owner, is_delete) VALUES($1, $2, $3, $4, $5, $6)',
      values: ['comment-123', 'thread-123', 'Test comment', new Date().toISOString(), 'user-456', false],
    });

    // Act & Assert
    await expect(commentRepository.verifyCommentOwner('comment-123', 'user-123'))
      .rejects.toThrow(AuthorizationError);
    await expect(commentRepository.verifyCommentOwner('comment-123', 'user-123'))
      .rejects.toThrow('Anda tidak berhak mengakses resource ini');
  });
});

  describe('getCommentsByThreadId', () => {
    it('should return list of comments for a thread ordered by date', async () => {
      // Arrange - Add user, thread, and multiple comments
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await UsersTableTestHelper.addUser({ id: 'user-456', username: 'otheruser' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      
      const date1 = new Date('2023-01-01T10:00:00.000Z').toISOString();
      const date2 = new Date('2023-01-02T10:00:00.000Z').toISOString();
      
      await pool.query({
        text: 'INSERT INTO comments (id, thread_id, content, date, owner, is_delete) VALUES($1, $2, $3, $4, $5, $6)',
        values: ['comment-2', 'thread-123', 'Second comment', date2, 'user-456', true],
      });
      await pool.query({
        text: 'INSERT INTO comments (id, thread_id, content, date, owner, is_delete) VALUES($1, $2, $3, $4, $5, $6)',
        values: ['comment-1', 'thread-123', 'First comment', date1, 'user-123', false],
      });

      // Act
      const result = await commentRepository.getCommentsByThreadId('thread-123');

      // Assert
      expect(result).toHaveLength(2);
      
      // Verify order by date (ascending) and all properties
      expect(result[0].id).toEqual('comment-1');
      expect(result[0].content).toEqual('First comment');
      expect(result[0].date).toBeDefined();
      expect(new Date(result[0].date)).toBeInstanceOf(Date);
      expect(result[0].owner).toEqual('user-123');
      expect(result[0].is_delete).toBe(false);
      
      expect(result[1].id).toEqual('comment-2');
      expect(result[1].content).toEqual('Second comment');
      expect(result[1].date).toBeDefined();
      expect(new Date(result[1].date)).toBeInstanceOf(Date);
      expect(result[1].owner).toEqual('user-456');
      expect(result[1].is_delete).toBe(true);
      
      // Verify ordering by comparing dates
      expect(new Date(result[0].date).getTime()).toBeLessThan(new Date(result[1].date).getTime());
    });

    it('should return empty array if no comments exist for thread', async () => {
      // Arrange - Add user and thread but no comments
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });

      // Act
      const result = await commentRepository.getCommentsByThreadId('thread-123');

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('verifyCommentExists', () => {
    it('should not throw NotFoundError if comment exists', async () => {
      // Arrange - Add user, thread, and comment
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await pool.query({
        text: 'INSERT INTO comments (id, thread_id, content, date, owner, is_delete) VALUES($1, $2, $3, $4, $5, $6)',
        values: ['comment-123', 'thread-123', 'Test comment', new Date().toISOString(), 'user-123', false],
      });

      // Act & Assert - Should not throw any error, specifically NotFoundError
      await expect(commentRepository.verifyCommentExists('comment-123'))
        .resolves.not.toThrow(NotFoundError);
    });

    it('should throw NotFoundError if comment does not exist', async () => {
      // Act & Assert
      await expect(commentRepository.verifyCommentExists('comment-nonexistent'))
        .rejects.toThrow(NotFoundError);
      await expect(commentRepository.verifyCommentExists('comment-nonexistent'))
        .rejects.toThrow('Komentar tidak ditemukan');
    });
  });
});