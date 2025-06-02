const AddThread = require('../../Domains/threads/entities/AddThread');

class AddThreadUseCase {
	constructor({ threadRepository }) {
		this._threadRepository = threadRepository;
	}

	async execute(useCasePayload) {
		const newThread = new AddThread(useCasePayload);
		const { owner } = useCasePayload;
		return await this._threadRepository.addThread({ addThread: newThread, owner });
	}
}

module.exports = AddThreadUseCase;