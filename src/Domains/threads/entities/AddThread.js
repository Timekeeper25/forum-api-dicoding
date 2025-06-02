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
	}
}

module.exports = AddThread;