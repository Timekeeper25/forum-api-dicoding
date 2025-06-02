const AddedThread = require('../AddedThread');

describe('AddedThread entity', () => {
	it('should throw error when payload does not contain needed property', () => {
		// Arrange
		const payload = { id: 'thread-123', title: 'Judul' }; // missing owner

		// Act & Assert
		expect(() => new AddedThread(payload)).toThrowError('ADDED_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
	});

	it('should create AddedThread object correctly when given valid payload', () => {
		// Arrange
		const payload = {
			id: 'thread-123',
			title: 'Judul',
			owner: 'user-123',
		};

		// Act
		const addedThread = new AddedThread(payload);

		// Assert
		expect(addedThread.id).toEqual(payload.id);
		expect(addedThread.title).toEqual(payload.title);
		expect(addedThread.owner).toEqual(payload.owner);
	});

	it('should throw error when id is missing', () => {
		const payload = { title: 'Judul', owner: 'user-123' };
		expect(() => new AddedThread(payload)).toThrowError('ADDED_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
	});

	it('should throw error when title is missing', () => {
		const payload = { id: 'thread-123', owner: 'user-123' };
		expect(() => new AddedThread(payload)).toThrowError('ADDED_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
	});

	it('should throw error when owner is missing', () => {
		const payload = { id: 'thread-123', title: 'Judul' };
		expect(() => new AddedThread(payload)).toThrowError('ADDED_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
	});
});