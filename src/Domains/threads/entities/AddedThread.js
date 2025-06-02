const InvariantError = require("../../../Commons/exceptions/InvariantError");

class AddedThread {
	constructor(payload) {
		this._verifyPayload(payload);

		const { id, title, owner } = payload;

		this.id = id;
		this.title = title;
		this.owner = owner;
	}

	_verifyPayload({ id, title, owner }) {
		if (!id || !title || !owner ) {
			throw new InvariantError('ADDED_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
		}
	}
}

module.exports = AddedThread;