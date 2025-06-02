const InvariantError = require('../../../Commons/exceptions/InvariantError');

class AddThreadComment { 
	constructor(payload) {
		this._verifyPayload(payload);

		const { content, threadId, owner } = payload;

		this.content = content;
		this.threadId = threadId;
		this.owner = owner;
	}

	_verifyPayload({ content, threadId, owner }) {
		if (!content || !threadId || !owner) {
			throw new InvariantError('NEW_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
		}

		if (typeof content !== 'string') {
			throw new InvariantError('NEW_COMMENT.PROPERTY_HAVE_WRONG_DATA_TYPE');
		}
	}
}

module.exports = AddThreadComment;