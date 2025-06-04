class ThreadRepository {
	async addThread(threadPayload, ownerId) {
		throw new Error('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
	}

	async verifyThreadExists(threadId) {
		throw new Error('THREAD_REPOSITORY.NOT_FOUND');
	}
	
	async getThreadById(threadId) {
        throw new Error('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    }
}

module.exports = ThreadRepository;