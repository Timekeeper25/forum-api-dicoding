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
		    if (typeof title !== 'string' || typeof body !== 'string') {
			throw new InvariantError('NEW_THREAD.PROPERTY_HAVE_WRONG_DATA_TYPE');
		}
			if (title.length > 50) {
			throw new InvariantError('NEW_THREAD.TITLE_EXCEED_CHAR_LIMIT');
		}
	}
}

module.exports = AddedThread;