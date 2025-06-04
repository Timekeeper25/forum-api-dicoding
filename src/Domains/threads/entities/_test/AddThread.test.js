const AddThread = require('../AddThread');

describe('AddThread entity', () => {
	it('should throw error when payload does not contain needed property', () => {
		// missing body
		const payload = { title: 'Judul', owner: 'user-123' };
		expect(() => new AddThread(payload)).toThrowError('ADD_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
	});

	it('should throw error when title is missing', () => {
		const payload = { body: 'Isi thread', owner: 'user-123' };
		expect(() => new AddThread(payload)).toThrowError('ADD_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
	});

	it('should throw error when body is missing', () => {
		const payload = { title: 'Judul', owner: 'user-123' };
		expect(() => new AddThread(payload)).toThrowError('ADD_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
	});

	it('should throw error when owner is missing', () => {
		const payload = { title: 'Judul', body: 'Isi thread' };
		expect(() => new AddThread(payload)).toThrowError('ADD_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
	});

	it ('should throw error when title is not a string', () => {
		const payload = { title: 123, body: 'Isi Thread', owner: 'user-123'};
		expect(() => new AddThread(payload)).toThrowError('NEW_THREAD.PROPERTY_HAVE_WRONG_DATA_TYPE');
	})

	it ('should throw error when body is not a string', () => {
		const payload = { title: 'Judul', body: 123, owner: 'user-123'};
		expect(() => new AddThread(payload)).toThrowError('NEW_THREAD.PROPERTY_HAVE_WRONG_DATA_TYPE');
	})

	it ('should throw error when title exceeds character limit', () => {
		const payload = { title: 'a'.repeat(51), body: 'Isi thread', owner: 'user-123'};
		expect(() => new AddThread(payload)).toThrowError('NEW_THREAD.TITLE_EXCEED_CHAR_LIMIT');
	})
	
	it('should create AddThread object correctly when given valid payload', () => {
		const payload = {
			title: 'Judul',
			body: 'Isi thread',
			owner: 'user-123',
		};

		const addThread = new AddThread(payload);

		expect(addThread.title).toEqual(payload.title);
		expect(addThread.body).toEqual(payload.body);
		expect(addThread.owner).toEqual(payload.owner);
	});
});