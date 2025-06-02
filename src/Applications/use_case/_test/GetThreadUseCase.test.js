const GetThreadsUseCase = require('../GetThreadUseCase');

describe('GetThreadsUseCase', () => {
  it('should throw error if thread not found', async () => {
    const mockUserRepository = { getUserById: jest.fn() };
    const mockThreadRepository = {
      verifyThreadExists: jest.fn().mockImplementation(() => {
        throw new Error('THREAD_NOT_FOUND');
      }),
      getThreadById: jest.fn(),
    };
    const mockCommentRepository = { getCommentsByThreadId: jest.fn() };

    const useCasePayload = { threadId: 'thread-xxx' };
    const getThreadsUseCase = new GetThreadsUseCase({
      userRepository: mockUserRepository,
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    await expect(getThreadsUseCase.execute(useCasePayload)).rejects.toThrowError('THREAD_NOT_FOUND');
  });

  it('should return thread details with an empty comments array when there are no comments', async () => {
    const mockUserRepository = { getUserById: jest.fn().mockResolvedValue({ username: 'threadOwner' }) };
    const mockThreadRepository = {
      verifyThreadExists: jest.fn().mockResolvedValue(),
      getThreadById: jest.fn().mockResolvedValue({
        id: 'thread-123',
        title: 'A thread',
        body: 'Thread body',
        date: new Date(),
        owner: 'user-123',
      }),
    };
    const mockCommentRepository = { getCommentsByThreadId: jest.fn().mockResolvedValue([]) };

    const useCasePayload = { threadId: 'thread-123' };
    const expectedThread = {
      id: 'thread-123',
      title: 'A thread',
      body: 'Thread body',
      date: new Date(),
      username: 'threadOwner',
      comments: [],
    };

    const getThreadsUseCase = new GetThreadsUseCase({
      userRepository: mockUserRepository,
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    const threadDetails = await getThreadsUseCase.execute(useCasePayload);

    expect(mockThreadRepository.verifyThreadExists).toHaveBeenCalledWith(useCasePayload.threadId);
    expect(mockThreadRepository.getThreadById).toHaveBeenCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.getCommentsByThreadId).toHaveBeenCalledWith(useCasePayload.threadId);
    expect(mockUserRepository.getUserById).toHaveBeenCalledTimes(1);
    expect(threadDetails).toEqual(expectedThread);
  });
});

