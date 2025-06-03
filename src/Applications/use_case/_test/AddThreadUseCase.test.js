const AddThread = require('../../../Domains/threads/entities/AddThread');
const AddThreadUseCase = require('../AddThreadUseCase');

describe('AddThreadUseCase', () => {
  it('should orchestrate the add thread action correctly', async () => {
    // Arrange
    const useCasePayload = {
      title: 'Judul thread',
      body: 'Isi thread',
      owner: 'user-123',
    };

    const mockAddedThread = {
      id: 'thread-123',
      title: 'Judul thread',
      owner: 'user-123',
    };

    const mockThreadRepository = {
      addThread: jest.fn()
        .mockImplementation(() => Promise.resolve(mockAddedThread)),
    };

    const addThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    // Act
    const addedThread = await addThreadUseCase.execute(useCasePayload);

    // Assert
    expect(addedThread).toStrictEqual(mockAddedThread);
    expect(mockThreadRepository.addThread).toBeCalledWith({
      addThread: new AddThread(useCasePayload),
      owner: useCasePayload.owner,
    });
  });
});
