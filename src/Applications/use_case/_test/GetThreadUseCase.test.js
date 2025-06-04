const GetThreadsUseCase = require('../GetThreadUseCase');
const UserRepository = require('../../../Domains/users/UserRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');


describe('GetThreadsUseCase', () => {
  it('should throw error if thread not found', async () => {
    // Arrange
    const mockUserRepository = new UserRepository(); 
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    mockThreadRepository.verifyThreadExists = jest.fn().mockImplementation(() => {
        throw new Error('THREAD_NOT_FOUND');
      });
    mockThreadRepository.getThreadById = jest.fn(),
    mockCommentRepository.getCommentsByThreadId = jest.fn();

    const useCasePayload = { threadId: 'thread-xxx' };
    const getThreadsUseCase = new GetThreadsUseCase({
      userRepository: mockUserRepository,
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Act & Assert
    await expect(getThreadsUseCase.execute(useCasePayload)).rejects.toThrowError('THREAD_NOT_FOUND');
  });

  it('should return thread details with an empty comments array when there are no comments', async () => {
    // Arrange
    const mockUserRepository = new UserRepository();
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    mockUserRepository.getUserById = jest.fn().mockResolvedValue({ username: 'threadOwner' });
    
    mockThreadRepository.verifyThreadExists = jest.fn().mockResolvedValue();
    mockThreadRepository.getThreadById = jest.fn().mockResolvedValue({
      id: 'thread-123',
      title: 'A thread',
      body: 'Thread body',
      date: new Date(),
      owner: 'user-123',
    });

    mockCommentRepository.getCommentsByThreadId = jest.fn().mockResolvedValue([]);

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

    // Act
    const threadDetails = await getThreadsUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.verifyThreadExists).toHaveBeenCalledWith(useCasePayload.threadId);
    expect(mockThreadRepository.getThreadById).toHaveBeenCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.getCommentsByThreadId).toHaveBeenCalledWith(useCasePayload.threadId);
    expect(mockUserRepository.getUserById).toHaveBeenCalledTimes(1);
    expect(threadDetails).toEqual(expectedThread);
  });

  it('should return thread details with comments when thread has comments', async () => {
    // Arrange
    const mockUserRepository = new UserRepository();
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    // Mock user data for thread owner and comment owners
    mockUserRepository.getUserById = jest.fn()
      .mockResolvedValueOnce({ username: 'threadOwner' })
      .mockResolvedValueOnce({ username: 'commentOwner1' }) 
      .mockResolvedValueOnce({ username: 'commentOwner2' }); 

    mockThreadRepository.verifyThreadExists = jest.fn().mockResolvedValue();
    mockThreadRepository.getThreadById = jest.fn().mockResolvedValue({
      id: 'thread-123',
      title: 'A thread with comments',
      body: 'Thread body with comments',
      date: new Date(),
      owner: 'user-123',
    });

    const mockComments = [
      {
        id: 'comment-123',
        username: 'commentOwner1',
        date: new Date(),
        content: 'First comment',
        owner: 'user-456',
        is_delete: true,
      },
      {
        id: 'comment-124',
        username: 'commentOwner2', 
        date: new Date(),
        content: 'Second comment',
        owner: 'user-789',
        is_delete: false,
      }
    ];

    mockCommentRepository.getCommentsByThreadId = jest.fn().mockResolvedValue(mockComments);

    const useCasePayload = { threadId: 'thread-123' };
    const expectedThread = {
      id: 'thread-123',
      title: 'A thread with comments',
      body: 'Thread body with comments',
      date: new Date(),
      username: 'threadOwner',
      comments: [
        {
          id: 'comment-123',
          username: 'commentOwner1',
          date: new Date(),
          content: '**komentar telah dihapus**',
        },
        {
          id: 'comment-124',
          username: 'commentOwner2',
          date: new Date(),
          content: 'Second comment',
        }
      ],
    };

    const getThreadsUseCase = new GetThreadsUseCase({
      userRepository: mockUserRepository,
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Act
    const threadDetails = await getThreadsUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.verifyThreadExists).toHaveBeenCalledWith(useCasePayload.threadId);
    expect(mockThreadRepository.getThreadById).toHaveBeenCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.getCommentsByThreadId).toHaveBeenCalledWith(useCasePayload.threadId);
    expect(mockUserRepository.getUserById).toHaveBeenCalledTimes(3); // 1 for thread owner + 2 for comment owners
    expect(mockUserRepository.getUserById).toHaveBeenNthCalledWith(1, 'user-123'); // thread owner
    expect(mockUserRepository.getUserById).toHaveBeenNthCalledWith(2, 'user-456'); // first comment owner
    expect(mockUserRepository.getUserById).toHaveBeenNthCalledWith(3, 'user-789'); // second comment owner
    expect(threadDetails).toEqual(expectedThread);
    expect(threadDetails.comments).toHaveLength(2);
  });
});

