const InvariantError = require("../../../Commons/exceptions/InvariantError");

class AddThread {
	constructor(payload) {
		this._verifyPayload(payload);

		const { title, body, owner } = payload;

		this.title = title;
		this.body = body;
		this.owner = owner;
	}

	_verifyPayload({ title, body, owner }) {
		if (!title || !body || !owner) {
			throw new InvariantError('ADD_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
		}
		if (typeof title !== 'string' || typeof body !== 'string') {
			throw new InvariantError('NEW_THREAD.PROPERTY_HAVE_WRONG_DATA_TYPE');
		}
		if (title.length > 50) {
			throw new InvariantError('NEW_THREAD.TITLE_EXCEED_CHAR_LIMIT');
		}
	}
}

module.exports = AddThread;