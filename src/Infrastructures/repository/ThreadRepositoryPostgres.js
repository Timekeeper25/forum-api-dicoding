const InvariantError = require('../../Commons/exceptions/InvariantError');
const ThreadRepository = require('../../Domains/threads/ThreadRepository');
const AddedThread = require('../../Domains/threads/entities/AddedThread');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');

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
			throw new NotFoundError('Thread tidak ditemukan');
		}
	}

	async addThread({ addThread, owner }) {
		const { title, body } = addThread;
		const id = `thread-${this._idGenerator()}`;
		const date = new Date().toISOString();;

		const query = {
			text: 'INSERT INTO threads (id, title, body, owner, date) VALUES($1, $2, $3, $4, $5) RETURNING id, title, owner',
			values: [id, title, body, owner, date],
		};

		const result = await this._pool.query(query);

		return new AddedThread({ id: result.rows[0].id, title: result.rows[0].title, owner: result.rows[0].owner });
	}

	async getThreadById(id) {
		const query = {
			text : 'SELECT threads.id, threads.title, threads.body, threads.date, threads.owner FROM threads WHERE threads.id = $1',
			values: [id],
		};
		const result = await this._pool.query(query);

		return result.rows[0];
	}
}

module.exports = ThreadRepositoryPostgres;