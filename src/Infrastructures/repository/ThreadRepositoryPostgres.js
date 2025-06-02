const InvariantError = require('../../Commons/exceptions/InvariantError');
const ThreadRepository = require('../../Domains/threads/ThreadRepository');

class ThreadRepositoryPostgres extends ThreadRepository {
	constructor(pool, idGenerator) {
		super();
		this._pool = pool;
		this._idGenerator = idGenerator;
	}

	async verifyThreadExists(id) {
		const query = {
			text: 'SELECT id FROM threads WHERE id = $1',
			values: [id],
		};

		const result = await this._pool.query(query);

		if (!result.rowCount) {
			throw new InvariantError('Thread not found');
		}
	}

	async addThread({ thread, owner }) {
		const { title, body } = thread;
		const id = `thread-${this._idGenerator()}`;
		const date = new Date();

		const query = {
			text: 'INSERT INTO threads (id, title, body, owner, date) VALUES($1, $2, $3, $4, $5) RETURNING id, title, owner',
			values: [id, title, body, owner, date],
		};

		const result = await this._pool.query(query);
		
		return new AddedThread({ id: result.rows[0].id, title: result.rows[0].title, owner: result.rows[0].user_id });
	}

	async getThreadById(id) {
		const query = {
			text : 'SELECT threads.id, threads.title, threads.body, threads.date, users.username FROM threads LEFT_JOIN users ON threads.owner = username WHERE threads.id = $1',
			values: [id],
		};
		const result = await this._pool.query(query);

		return result.rows[0];
	}
}

module.exports = ThreadRepositoryPostgres;