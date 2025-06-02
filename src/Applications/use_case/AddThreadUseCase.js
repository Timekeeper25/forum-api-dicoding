const AddThread = require('../../Domains/threads/entities/AddThread');

class AddThreadUseCase {
	constructor({ threadRepository }) {
		this._threadRepository = threadRepository;
	}

	async execute(useCasePayload, useCaseCredential) {
		const newThread = new AddThread(useCasePayload);
		return await this._threadRepository.addThread(newThread, useCaseCredential);
	}
}

module.exports = AddThreadUseCase;
