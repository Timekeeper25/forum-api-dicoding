const AddThreadCommentUseCase = require('../AddThreadCommentUseCase');
const AddThreadComment = require('../../../Domains/comments/entities/AddThreadComment');
const AddedThreadComment = require('../../../Domains/comments/entities/AddedThreadComment');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');

describe('AddThreadCommentUseCase', () => {
	it('should orcestrate the add thread comment action correctly', async () => {
		// Arrange
		const useCasePayload = {
			threadId: 'thread-123',
			content: 'Komentar',
			owner: 'user-123'
		}

		const expectedAddedThreadComment = new AddedThreadComment({
			id: 'comment-123',
			threadId: useCasePayload.threadId,
			content: useCasePayload.content,
			owner: useCasePayload.owner
		});

		const mockThreadRepository = new ThreadRepository();
		mockThreadRepository.verifyThreadExists = jest.fn().mockResolvedValue();
		

		const mockCommentRepository = new CommentRepository();
		mockCommentRepository.addThreadComment = jest.fn().mockResolvedValue(expectedAddedThreadComment);

		const addThreadCommentUseCase = new AddThreadCommentUseCase({
			threadRepository: mockThreadRepository,
			commentRepository: mockCommentRepository,
		});

		// Act 
		const addedThreadComment = await addThreadCommentUseCase.execute(useCasePayload);

		//Assert
		expect(addedThreadComment).toStrictEqual(expectedAddedThreadComment);
		expect(mockCommentRepository.addThreadComment).toBeCalledWith(
			new AddThreadComment(useCasePayload)
		);
	});
});