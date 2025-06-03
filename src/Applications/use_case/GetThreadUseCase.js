class GetThreadsUseCase {
	constructor ({ userRepository, threadRepository, commentRepository }) {
		this._userRepository = userRepository;
		this._threadRepository = threadRepository;
		this._commentRepository = commentRepository;
	}

	async execute(useCasePayload) {
		try {
			console.log('GetThreadUseCase - Starting execution with payload:', useCasePayload);
			const { threadId } = useCasePayload;
			
			console.log('GetThreadUseCase - Verifying thread exists:', threadId);
			await this._threadRepository.verifyThreadExists(threadId);
	
			console.log('GetThreadUseCase - Getting thread by ID');
			const getThread = await this._threadRepository.getThreadById(threadId);
			console.log('GetThreadUseCase - Retrieved thread:', getThread);
	
			console.log('GetThreadUseCase - Getting user by ID:', getThread.owner);
			const { username: threadOwner } = await this._userRepository.getUserById(getThread.owner);
			console.log('GetThreadUseCase - Retrieved thread owner:', threadOwner);
	
			const thread = {
				id: getThread.id,
				title: getThread.title,
				body: getThread.body,
				date: getThread.date,
				username: threadOwner,
				comments: []
			};
	
			console.log('GetThreadUseCase - Getting comments for thread:', threadId);
			const comments = await this._commentRepository.getCommentsByThreadId(threadId);
			console.log('GetThreadUseCase - Retrieved comments:', comments);
	
			for (const comment of comments) {
				console.log('GetThreadUseCase - Processing comment:', comment.id);
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
	
			console.log('GetThreadUseCase - Final result:', thread);
			return thread;
		} catch (error) {
			console.error('GetThreadUseCase - Error occurred:', error);
			throw error;
		}
	}
}

module.exports = GetThreadsUseCase;