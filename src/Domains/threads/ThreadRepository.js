class ThreadRepository {
	async addThread(threadPayload) {
		throw new Error('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
	}

	async verifyThreadExists(threadId) {
		throw new Error('THREAD_REPOSITORY.NOT_FOUND');
	}
}

module.exports = ThreadRepository;