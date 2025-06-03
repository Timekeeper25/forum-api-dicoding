const AddThreadComments = require('../../Domains/comments/entities/AddThreadComment');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');

class AddThreadCommentUseCase {
	constructor({ threadRepository, commentRepository }) {
		this._threadRepository = threadRepository;
		this._commentRepository = commentRepository;
	}

	// In AddThreadCommentUseCase.js
	async execute(useCasePayload) {
		const { threadId } = useCasePayload;

		await this._threadRepository.verifyThreadExists(threadId);

		const newComment = new AddThreadComments(useCasePayload);
		const result = await this._commentRepository.addThreadComment(newComment);
		return result;
	}
}

module.exports = AddThreadCommentUseCase;