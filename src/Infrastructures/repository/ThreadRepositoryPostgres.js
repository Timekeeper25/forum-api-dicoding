const InvariantError = require('../../Commons/exceptions/InvariantError');
const ThreadRepository = require('../../Domains/threads/ThreadRepository');
const AddedThread = require('../../Domains/threads/entities/AddedThread');

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

	async addThread({ addThread, owner }) {
		try {
			console.log('Repository addThread called with:', { addThread, owner });
			
			const { title, body } = addThread;
			console.log('Extracted from addThread:', { title, body });
			
			const id = `thread-${this._idGenerator()}`;
			const date = new Date();
			
			console.log('Generated values:', { id, date });

			const query = {
				text: 'INSERT INTO threads (id, title, body, owner, date) VALUES($1, $2, $3, $4, $5) RETURNING id, title, owner',
				values: [id, title, body, owner, date],
			};

			console.log('Query:', query);

			const result = await this._pool.query(query);
			console.log('DB result:', result.rows[0]);

			return new AddedThread({ id: result.rows[0].id, title: result.rows[0].title, owner: result.rows[0].owner });
		} catch (error) {
			console.error('Error in ThreadRepositoryPostgres:', error);
			throw error;
		}
	}

	async getThreadById(id) {
		const query = {
			text : 'SELECT threads.id, threads.title, threads.body, threads.date, users.username FROM threads LEFT JOIN users ON threads.owner = username WHERE threads.id = $1',
			values: [id],
		};
		const result = await this._pool.query(query);

		return result.rows[0];
	}
}

module.exports = ThreadRepositoryPostgres;