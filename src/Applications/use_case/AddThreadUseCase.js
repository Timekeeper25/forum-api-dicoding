const AddThread = require('../../Domains/threads/entities/AddThread');

class AddThreadUseCase {
	constructor({ threadRepository }) {
		this._threadRepository = threadRepository;
	}

	async execute(useCasePayload) {
		try {
			console.log('AddThreadUseCase payload:', useCasePayload);
			
			const newThread = new AddThread(useCasePayload);
			console.log('AddThread created:', newThread);
			
			const { owner } = useCasePayload;
			console.log('Owner extracted:', owner);
			
			const result = await this._threadRepository.addThread({ addThread: newThread, owner });
			console.log('Repository result:', result);
			
			return result;
		} catch (error) {
			console.error('Error in AddThreadUseCase:', error);
			throw error;
		}
	}
}

module.exports = AddThreadUseCase;