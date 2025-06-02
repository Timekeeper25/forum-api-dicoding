class DeleteThreadCommentUseCase {
	constructor({ threadRepository, commentRepository }) {
		this._threadRepository = threadRepository;
		this._commentRepository = commentRepository;
	}

	async execute(useCasePayload) {
		const { threadId } = useCasePayload;
		const { commentId } = useCasePayload;
		const { ownerId } = useCasePayload;

		await this._threadRepository.verifyThreadExists(threadId);
		await this._commentRepository.verifyCommentExists(commentId);
		await this._commentRepository.verifyCommentOwner(commentId, ownerId);
		await this._commentRepository.deleteThreadComment(commentId);
	}
}

module.exports = DeleteThreadCommentUseCase;