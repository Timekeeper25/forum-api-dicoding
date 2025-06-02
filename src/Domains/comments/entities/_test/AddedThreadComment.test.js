const AddedThreadComment = require('../AddedThreadComment');

describe('AddedThreadComment entity', () => {
	it('should throw error when payload does not contain needed property', () => {
		// Arrange
		const payload = { id: 'comment-123', content: 'komentar' }; // missing owner

		// Act & Assert
		expect(() => new AddedThreadComment(payload)).toThrowError('ADDED_THREAD_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
	});

	it('should throw error when payload properties are not string', () => {
		// Arrange
		const payload = { id: 123, content: {}, owner: [] };

		// Act & Assert
		expect(() => new AddedThreadComment(payload)).toThrowError('ADDED_THREAD_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
	});

	it('should create AddedThreadComment object correctly when given valid payload', () => {
		// Arrange
		const payload = {
			id: 'comment-123',
			content: 'komentar',
			owner: 'user-123',
		};

		// Act
		const addedThreadComment = new AddedThreadComment(payload);

		// Assert
		expect(addedThreadComment.id).toEqual(payload.id);
		expect(addedThreadComment.content).toEqual(payload.content);
		expect(addedThreadComment.owner).toEqual(payload.owner);
	});

	it('should throw error when id is missing', () => {
		const payload = { content: 'komentar', owner: 'user-123' };
		expect(() => new AddedThreadComment(payload)).toThrowError('ADDED_THREAD_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
	});

	it('should throw error when content is missing', () => {
		const payload = { id: 'comment-123', owner: 'user-123' };
		expect(() => new AddedThreadComment(payload)).toThrowError('ADDED_THREAD_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
	});

	it('should throw error when owner is missing', () => {
		const payload = { id: 'comment-123', content: 'komentar' };
		expect(() => new AddedThreadComment(payload)).toThrowError('ADDED_THREAD_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
	});
});