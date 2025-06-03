const DeleteCommentUseCase = require('../DeleteThreadCommentUseCase');

describe('DeleteThreadCommentUseCase', () => {
  it('should orchestrate the delete comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      ownerId: 'user-123',
    };

    const mockThreadRepository = {
      verifyThreadExists: jest.fn().mockResolvedValue(),
    };

    const mockCommentRepository = {
      verifyCommentExists: jest.fn().mockResolvedValue(),
      verifyCommentOwner: jest.fn().mockResolvedValue(),
      deleteThreadComment: jest.fn().mockResolvedValue(),
    };

    const deleteCommentUseCase = new DeleteCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Act
    await deleteCommentUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.verifyThreadExists).toHaveBeenCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.verifyCommentExists).toHaveBeenCalledWith(useCasePayload.commentId);
    expect(mockCommentRepository.verifyCommentOwner).toHaveBeenCalledWith(useCasePayload.commentId, useCasePayload.ownerId);
    expect(mockCommentRepository.deleteThreadComment).toHaveBeenCalledWith(useCasePayload.commentId);
  });
});
