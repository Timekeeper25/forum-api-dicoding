const InvariantError = require('../../Commons/exceptions/InvariantError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const CommentRepository = require('../../Domains/comments/CommentRepository');
const AddedThreadComment = require('../../Domains/comments/entities/AddedThreadComment');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');

class CommentRepositoryPostgres extends CommentRepository {
	constructor(pool, idGenerator) {
		super();
		this._pool = pool;
		this._idGenerator = idGenerator;
	}

	async addThreadComment (newComment) {
		const id = `comment-${this._idGenerator()}`;
		const date = new Date().toISOString();
		const { threadId, content, owner } = newComment;

		const query = {
			text: 'INSERT INTO comments (id, thread_id, content, date, owner) VALUES($1, $2, $3, $4, $5) RETURNING id, thread_id, content, owner',
			values: [id, threadId, content, date, owner],
		};

		const result = await this._pool.query(query);

		return new AddedThreadComment({
			id: result.rows[0].id,
			content: result.rows[0].content,
			owner: result.rows[0].owner,
		});
	}

	async deleteThreadComment(id) {
		const query = {
			text: 'UPDATE comments SET is_delete = true WHERE id = $1',
			values: [id],
		};

		const result = await this._pool.query(query);
		if (!result.rowCount) {
			throw new NotFoundError('Comment Not Found')
		}
	}

	async verifyCommentOwner(commentId, ownerId) {
		const query = {
			text: 'SELECT owner FROM comments WHERE id = $1',
			values: [commentId]
		};
		const result = await this._pool.query(query);
		if (!result.rowCount) {
			throw new NotFoundError('Komentar tidak ditemukan');
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

	async verifyCommentExists(commentId) {
		const query = {
			text: 'SELECT id FROM comments WHERE id = $1',
			values: [commentId]
		};
		const result = await this._pool.query(query);
		if (!result.rowCount) {
			throw new NotFoundError('Komentar tidak ditemukan');
		}
	}
}

module.exports = CommentRepositoryPostgres;