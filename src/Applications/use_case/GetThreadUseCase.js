class GetThreadUseCase {
	constructor ({ userRepository, threadRepository, commentRepository }) {
		this._userRepository = userRepository;
		this._threadRepository = threadRepository;
		this._commentRepository = commentRepository;
	}

	async execute(useCasePayload) {
		const { threadId } = useCasePayload;
		
		await this._threadRepository.verifyThreadExists(threadId);

		const getThread = await this._threadRepository.getThreadById(threadId);

		const { username: threadOwner } = await this._userRepository.getUserById(getThread.owner);

		const thread = {
			id: getThread.id,
			title: getThread.title,
			body: getThread.body,
			date: getThread.date,
			username: threadOwner,
			comments: []
		};

		const comments = await this._commentRepository.getCommentsByThreadId(threadId);

		for (const comment of comments) {
			const { username: commentOwner } = await this._userRepository.getUserById(comment.owner);
			const content = comment.is_delete ? '**komentar telah dihapus**' : comment.content;
			const threadComment = {
				id: comment.id,
				content,
				date: comment.date,
				username: commentOwner
			};
			thread.comments.push(threadComment);
		}
		return thread;
	}
}

module.exports = GetThreadUseCase;