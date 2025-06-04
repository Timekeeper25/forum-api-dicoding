const AddThreadComment = require('../AddThreadComment');

describe('AddThreadComment entity', () => {
	it('should throw error when payload does not contain needed property', () => {
		// missing threadId
		const payload = { content: 'komentar', owner: 'user-123' };
		expect(() => new AddThreadComment(payload)).toThrowError('NEW_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
	});

	it('should throw error when content is missing', () => {
		const payload = { threadId: 'thread-123', owner: 'user-123' };
		expect(() => new AddThreadComment(payload)).toThrowError('NEW_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
	});

	it('should throw error when threadId is missing', () => {
		const payload = { content: 'komentar', owner: 'user-123' };
		expect(() => new AddThreadComment(payload)).toThrowError('NEW_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
	});

	it('should throw error when owner is missing', () => {
		const payload = { content: 'komentar', threadId: 'thread-123' };
		expect(() => new AddThreadComment(payload)).toThrowError('NEW_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
	});

	it('should throw error when content is not a string', () => {
		const payload = {
			content: 123,
			threadId: 'thread-123',
			owner: 'user-123'
		};
		expect(() => new AddThreadComment(payload)).toThrowError('NEW_COMMENT.PROPERTY_HAVE_WRONG_DATA_TYPE');
	});

	it('should create AddThreadComment object correctly when given valid payload', () => {
		const payload = {
			content: 'komentar',
			threadId: 'thread-123',
			owner: 'user-123',
		};

		const addThreadComment = new AddThreadComment(payload);

		expect(addThreadComment.content).toEqual(payload.content);
		expect(addThreadComment.threadId).toEqual(payload.threadId);
		expect(addThreadComment.owner).toEqual(payload.owner);
	});

	it('should ignore extra properties in payload', () => {
		const payload = {
			content: 'komentar',
			threadId: 'thread-123',
			owner: 'user-123',
			extra: 'ignore-me',
		};

		const addThreadComment = new AddThreadComment(payload);

		expect(addThreadComment.content).toEqual(payload.content);
		expect(addThreadComment.threadId).toEqual(payload.threadId);
		expect(addThreadComment.owner).toEqual(payload.owner);
		expect(addThreadComment.extra).toBeUndefined();
	});
});