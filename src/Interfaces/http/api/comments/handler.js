const AddThreadCommentUseCase = require('../../../../Applications/use_case/AddThreadCommentUseCase')
const DeleteThreadCommentUseCase = require('../../../../Applications/use_case/DeleteThreadCommentUseCase');

class CommentHandler {
	constructor(container) {
		this._container = container;

		this.postThreadCommentHandler = this.postThreadCommentHandler.bind(this);
		this.deleteThreadCommentHandler = this.deleteThreadCommentHandler.bind(this);
	}

	// In src/Interfaces/http/api/comments/handler.js
	async postThreadCommentHandler(request, h) {
		const { id: userId } = request.auth.credentials;
		const { threadId } = request.params;
		
		const addThreadCommentUseCase = this._container.getInstance(AddThreadCommentUseCase.name);
		
		const payload = {
			...request.payload,
			threadId,
			owner: userId,
		};
		
		const addedComment = await addThreadCommentUseCase.execute(payload);
		
		if (!addedComment) {
			console.log('ERROR: addedComment is undefined/null');
			throw new Error('Use case returned undefined result');
		}
		
		const response = h.response({
			status: 'success',
			data: {
				addedComment,
			},
		});
		response.code(201);
		return response;
	}

	async deleteThreadCommentHandler(request, h) {
		const { id: userId } = request.auth.credentials;
		const { threadId, commentId } = request.params;
		const deleteThreadCommentUseCase = this._container.getInstance(DeleteThreadCommentUseCase.name);
		await deleteThreadCommentUseCase.execute({ threadId, commentId, ownerId: userId });

		const response = h.response({
			status: 'success',
		});
		response.code(200);
		return response;
	};
}

module.exports = CommentHandler;