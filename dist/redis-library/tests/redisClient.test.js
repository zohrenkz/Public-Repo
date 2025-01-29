import { RedisClient } from '../lib/redisClient';
import { PersistenceMode } from '../lib/config/enums';
import Redis from 'ioredis';
// ✅ Mock کردن Redis
jest.mock('ioredis', () => {
    const mRedis = {
        connect: jest.fn(),
        set: jest.fn(),
        get: jest.fn(),
        ttl: jest.fn(),
        hset: jest.fn(), // اصلاح به hset
        hGet: jest.fn(),
        hGetAll: jest.fn(),
        multi: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(['OK']),
        }),
        sendCommand: jest.fn(),
        quit: jest.fn(),
    };
    return jest.fn(() => mRedis);
});
describe('RedisClient', () => {
    let redisClient;
    beforeEach(async () => {
        redisClient = RedisClient.getInstance();
        await redisClient.connect();
    });
    afterEach(async () => {
        await redisClient.quit();
    });
    test('✅ باید مقدار را در Redis ست کند', async () => {
        const key = 'test-key';
        const value = 'test-value';
        await redisClient.set(key, value);
        expect(Redis.prototype.set).toHaveBeenCalledWith(key, value);
    });
    test('✅ باید مقدار را از Redis دریافت کند', async () => {
        const key = 'test-key';
        Redis.prototype.get.mockResolvedValue('test-value');
        const result = await redisClient.get(key);
        expect(result).toBe('test-value');
        expect(Redis.prototype.get).toHaveBeenCalledWith(key);
    });
    test('✅ باید مقدار `ttl` را دریافت کند', async () => {
        const key = 'test-key';
        Redis.prototype.ttl.mockResolvedValue(100);
        const result = await redisClient.ttl(key);
        expect(result).toBe(100);
        expect(Redis.prototype.ttl).toHaveBeenCalledWith(key);
    });
    test('✅ باید مقدار `hset` را تنظیم کند', async () => {
        const key = 'user:1';
        const field = 'name';
        const value = 'John';
        await redisClient.hset(key, field, value);
        expect(Redis.prototype.hset).toHaveBeenCalledWith(key, field, value); // اصلاح به hset
    });
    test('✅ باید مقدار `hget` را دریافت کند', async () => {
        const key = 'user:1';
        const field = 'name';
        Redis.prototype.hget.mockResolvedValue('John');
        const result = await redisClient.hget(key, field);
        expect(result).toBe('John');
        expect(Redis.prototype.hget).toHaveBeenCalledWith(key, field);
    });
    test('✅ باید همه مقادیر را از `hgetall` دریافت کند', async () => {
        const key = 'user:1';
        const mockData = { name: 'John', age: '30' };
        Redis.prototype.hgetall.mockResolvedValue(mockData);
        const result = await redisClient.getAll(key);
        expect(result).toEqual(mockData);
        expect(Redis.prototype.hgetall).toHaveBeenCalledWith(key);
    });
    test('✅ باید تنظیمات `persistence` را اعمال کند', async () => {
        await redisClient.setPersistence(PersistenceMode.RDB);
        expect(Redis.prototype.sendCommand).toHaveBeenCalledWith(['CONFIG', 'SET', 'save', '900 1 300 10 60 10000']);
        expect(Redis.prototype.sendCommand).toHaveBeenCalledWith(['CONFIG', 'SET', 'appendonly', 'no']);
    });
    test('✅ باید `quit` را اجرا کند', async () => {
        await redisClient.quit();
        expect(Redis.prototype.quit).toHaveBeenCalled();
    });
});
