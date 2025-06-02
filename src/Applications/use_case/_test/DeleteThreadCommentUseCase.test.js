const DeleteCommentUseCase = require('../DeleteThreadCommentUseCase');

// Mocking dependencies
const mockThreadRepository = {
  verifyThreadExists: jest.fn(),
};
const mockCommentRepository = {
  verifyCommentExists: jest.fn(),
  verifyCommentOwner: jest.fn(),
  deleteThreadComment: jest.fn(),
};

// Test suite for DeleteCommentUseCase
describe('DeleteThreadCommentUseCase', () => {
  it('should orchestrate the delete comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      ownerId: 'user-123',
    };

    mockThreadRepository.verifyThreadExists.mockResolvedValue();
    mockCommentRepository.verifyCommentExists.mockResolvedValue();
    mockCommentRepository.verifyCommentOwner.mockResolvedValue();
    mockCommentRepository.deleteThreadComment.mockResolvedValue();

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
    expect(mockCommentRepository.deleteThreadComment).toHaveBeenCalledWith(useCasePayload.threadId, useCasePayload.commentId);
  });
});
