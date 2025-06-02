const CommentRepository = require('../CommentRepository');

describe('CommentRepository interface', () => {
  it('should throw error when invoke abstract behaviot', async () => {
    // Arrange
    const commentRepository = new CommentRepository();
    // Action and Assert

    await expect(commentRepository.addThreadComment('', '', '')).rejects.toThrowError(
      'COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED',
    );
    await expect(commentRepository.getCommentsByThreadId('')).rejects.toThrowError(
      'COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED',
    );
    await expect(commentRepository.verifyCommentExists('')).rejects.toThrowError(
      'COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED',
    );
    await expect(commentRepository.verifyCommentOwner('')).rejects.toThrowError(
      'COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED',
    );
    await expect(commentRepository.deleteThreadComment('', '', '')).rejects.toThrowError(
      'COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED',
    );
  });
});