const AddThreadCommentUseCase = require('../../../../Applications/use_case/AddThreadCommentUseCase')
const DeleteThreadCommentUseCase = require('../../../../Applications/use_case/DeleteThreadCommentUseCase');

class CommentHandler {
	constructor(container) {
		this._container = container;

		this.postCommentHandler = this.postThreadCommentHandler.bind(this);
		this.deleteCommentHandler = this.deleteThreadCommentHandler.bind(this);
	}

	async postThreadCommentHandler(request, h) {
		const { id: userId } = request.auth.credentials;
		const { threadId } = request.params;
		const addThreadCommentUseCase = this._container.getInstance(AddThreadCommentUseCase.name);
		const addedComment = await addThreadCommentUseCase.execute({
			...request.payload,
			threadId,
			owner: userId,
		});
		
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
		const { threadId, commentId } = request.params;
		const deleteThreadCommentUseCase = this._container.getInstance(DeleteThreadCommentUseCase.name);
		await deleteThreadCommentUseCase.execute(threadId, commentId);

		const response = h.response({
			status: 'success',
		});
		response.code(200);
		return response;
	};
}

module.exports = CommentHandler;