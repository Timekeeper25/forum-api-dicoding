const InvariantError = require('../../Commons/exceptions/InvariantError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const CommentRepository = require('../../Domains/comments/CommentRepository');

class CommentRepositoryPostgres extends CommentRepository {
	constructor(pool, idGenerator) {
		super();
		this._pool = pool;
		this._idGenerator = idGenerator;
	}

	async addThreadComment ({ id, threadId, content, date }) {
		const query = {
			text: 'INSERT INTO comments (id, thread_id, content, date) VALUES($1, $2, $3, $4) RETURNING id, thread_id',
			values: [id, threadId, content, date],
		};

		const result = await this._pool.query(query);
	}

	async deleteThreadComment(id) {
		const query = {
			text: 'UPDATE comments SET is_delete = true WHERE id = $1',
			values: [id],
		};

		const result = await this._pool.query(query);
		if (!result.rowCount) {
			throw new InvariantError('Comment Not Found')
		}
	}

	async verifyCommentOwner(commentId, ownerId) {
		const query = {
			text: 'SELECT owner FROM comments WHERE id = $1',
			values: [commentId]
		};
		const result = await this._pool.query(query);
		if (!result.rowCount) {
			throw new InvariantError('Komentar tidak ditemukan');
		}
		if (result.rows[0].owner !== ownerId) {
			throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
		}
	}

	async getCommentsByThreadId(threadId) {
		const query = {
			text: 'SELECT id, content, date, owner, is_delete FROM comments WHERE thread_id = $1 ORDER BY date asc',
			values: [threadId]
		}
		const result = await this._pool.query(query);
		return result.rows;
	}
}

module.exports = CommentRepositoryPostgres;