const AddThreadUseCase = require('../../../../Applications/use_case/AddThreadUseCase');
const GetThreadUseCase = require('../../../../Applications/use_case/GetThreadUseCase');

class ThreadsHandler {
	constructor(container) {
		this._container = container;

		this.postThreadHandler = this.postThreadHandler.bind(this);
		this.getThreadHandler = this.getThreadHandler.bind(this);
	}

	async postThreadHandler(request, h) {
		try {
			console.log('=== POST THREAD HANDLER START ===');
			console.log('Request payload:', request.payload);
			console.log('Auth credentials:', request.auth.credentials);

			const { id: userId } = request.auth.credentials;
			console.log('User ID:', userId);

			const addThreadUseCase = this._container.getInstance(AddThreadUseCase.name);
			console.log('AddThreadUseCase instance:', !!addThreadUseCase);

			const payload = {
				...request.payload, 
				owner: userId,
			};
			console.log('Final payload:', payload);

			const addedThread = await addThreadUseCase.execute(payload);
			console.log('Added thread result:', addedThread);

			const response = h.response({
				status: 'success',
				data: {
					addedThread,
				},
			});
			response.code(201);
			
			console.log('=== POST THREAD HANDLER SUCCESS ===');
			return response;
		} catch (error) {
			console.error('=== POST THREAD HANDLER ERROR ===');
			console.error('Error details:', error);
			console.error('Error stack:', error.stack);
			throw error; // Re-throw to let Hapi handle it
		}
	}

	async getThreadHandler(request, h) {
		const { threadId } = request.params;
		const getThreadUseCase = this._container.getInstance(GetThreadUseCase.name);
		const thread = await getThreadUseCase.execute(threadId);

		const response = h.response({
			status: 'success',
			data: {
				thread,
			},
		});
		response.code(200);
		return response;
	}
}

module.exports = ThreadsHandler;