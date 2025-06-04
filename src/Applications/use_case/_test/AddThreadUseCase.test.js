const AddThread = require('../../../Domains/threads/entities/AddThread');
const AddThreadUseCase = require('../AddThreadUseCase');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');

describe('AddThreadUseCase', () => {
  it('should orchestrate the add thread action correctly', async () => {
    // Arrange
    const useCasePayload = {
      title: 'Judul thread',
      body: 'Isi thread',
      owner: 'user-123',
    };
  
    const mockReturnValue = new AddedThread({
      id: 'thread-123',
      title: 'Judul thread',
      owner: 'user-123'
    });
  
    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.addThread = jest.fn().mockResolvedValue(mockReturnValue);
  
    const addThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository,
    });
  
    // Act
    const result = await addThreadUseCase.execute(useCasePayload);
  
    // Assert
    expect(result).toBeInstanceOf(AddedThread);
    expect(result).toStrictEqual(mockReturnValue);
    expect(result.id).toEqual('thread-123');
    expect(result.title).toEqual('Judul thread');
    expect(result.owner).toEqual('user-123');
    
    expect(mockThreadRepository.addThread).toBeCalledWith({
      addThread: new AddThread(useCasePayload),
      owner: useCasePayload.owner,
    });
  });
});
