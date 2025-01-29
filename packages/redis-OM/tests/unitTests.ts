import { Client, Repository } from 'redis-om';
import { UserRepository } from '../lib/repositories/userRepository';
import { userSchema, User } from '../lib/models/userModel';
import { CustomError } from '../../utils/customError';

jest.mock('redis-om');

describe('UserRepository', () => {
    let userRepository: UserRepository;
    let mockClient: jest.Mocked<Client>;
    let mockRepository: jest.Mocked<Repository<User>>;

    beforeEach(async () => {
        mockClient = new Client() as jest.Mocked<Client>;
        mockRepository = {
            save: jest.fn(),
            fetch: jest.fn(),
            createIndex: jest.fn(),
            remove: jest.fn(),
        } as unknown as jest.Mocked<Repository<User>>;

        mockClient.fetchRepository = jest.fn().mockReturnValue(mockRepository);
        Client.prototype.open = jest.fn();

        userRepository = new UserRepository();
        await userRepository.init();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should initialize repository successfully', async () => {
        expect(mockClient.open).toHaveBeenCalled();
        expect(mockRepository.createIndex).toHaveBeenCalled();
    });

    it('should throw error if repository is not initialized', async () => {
        const uninitializedRepo = new UserRepository();
        expect(() => uninitializedRepo.create({ firstName: 'Ali', lastName: 'Rezaei', email: 'ali@example.com' }))
            .toThrowError(new CustomError('Repository is not initialized. Call `init()` first.', 400, 'REPOSITORY_NOT_INITIALIZED'));
    });

    it('should create a new user', async () => {
        const mockUser = { firstName: 'Ali', lastName: 'Rezaei', email: 'ali@example.com' };
        mockRepository.save.mockResolvedValueOnce({
            id: 'mock-id',
            name: 'Test User',
            email: 'test@example.com'
        } as User);
        const result = await userRepository.create(mockUser);

        expect(mockRepository.save).toHaveBeenCalledWith(mockUser);
        expect(result).toBe('mock-id');
    });

    it('should fetch a user by ID', async () => {
        const mockUser = { firstName: 'Ali', lastName: 'Rezaei', email: 'ali@example.com' } as User;
        mockRepository.fetch.mockResolvedValueOnce(mockUser);

        const result = await userRepository.getById('mock-id');

        expect(mockRepository.fetch).toHaveBeenCalledWith('mock-id');
        expect(result).toEqual(mockUser);
    });

    it('should throw error if user is not found', async () => {
        mockRepository.fetch.mockResolvedValueOnce(null);

        await expect(userRepository.getById('invalid-id')).rejects.toThrowError(
            new CustomError('User not found.', 404, 'USER_NOT_FOUND')
        );
    });

    it('should update an existing user', async () => {
        const mockUser = { firstName: 'Ali', lastName: 'Rezaei', email: 'ali@example.com' } as User;
        mockRepository.fetch.mockResolvedValueOnce(mockUser);
        mockRepository.save.mockResolvedValueOnce('updated-id');

        const result = await userRepository.update('mock-id', { email: 'new.email@example.com' });

        expect(mockRepository.fetch).toHaveBeenCalledWith('mock-id');
        expect(mockRepository.save).toHaveBeenCalledWith({ ...mockUser, email: 'new.email@example.com' });
        expect(result).toBe('updated-id');
    });

    it('should remove a user', async () => {
        mockRepository.remove.mockResolvedValueOnce(true);

        const result = await userRepository.remove('mock-id');

        expect(mockRepository.remove).toHaveBeenCalledWith('mock-id');
        expect(result).toBe(true);
    });

    it('should throw an error if remove fails', async () => {
        mockRepository.remove.mockRejectedValueOnce(new Error('Failed to remove'));

        await expect(userRepository.remove('mock-id')).rejects.toThrowError(
            new CustomError('Failed to remove user: Failed to remove', 500, 'USER_REMOVAL_FAILED')
        );
    });
});
