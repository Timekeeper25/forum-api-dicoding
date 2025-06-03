const AddThreadComments = require('../../Domains/comments/entities/AddThreadComment');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');

class AddThreadCommentUseCase {
	constructor({ threadRepository, commentRepository }) {
		this._threadRepository = threadRepository;
		this._commentRepository = commentRepository;
	}

	// In AddThreadCommentUseCase.js
	async execute(useCasePayload) {
		console.log('UseCase payload:', useCasePayload);
		const { threadId } = useCasePayload;

		await this._threadRepository.verifyThreadExists(threadId);

		const newComment = new AddThreadComments(useCasePayload);
		console.log('New comment entity:', newComment);

		const result = await this._commentRepository.addThreadComment(newComment);
		console.log('Repository result:', result);
		return result;
	}
}

module.exports = AddThreadCommentUseCase;