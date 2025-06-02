const AddThreadComments = require('../../Domains/comments/entities/AddThreadComment');

class AddThreadCommentUseCase {
	constructor({ threadRepository, commentRepository }) {
		this._threadRepository = threadRepository;
		this._commentRepository = commentRepository;
	}

	async execute(useCasePayload) {
		const { threadId } = useCasePayload

		await this._threadRepository.verifyThreadExists(threadId);
		const newComment = new AddThreadComments(useCasePayload);

		return await this._commentRepository.addThreadComment(newComment);
	}
}

module.exports = AddThreadCommentUseCase;