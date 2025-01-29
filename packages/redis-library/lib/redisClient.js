import dotenv from "dotenv";
import Redis from 'ioredis';
import { PersistenceMode } from "./config/enums.ts";
import { RedisConnectionError, PersistenceError, TransactionError } from "../../utils/customError";
dotenv.config();
export class RedisClient {
    static instance;
    client;
    persistenceConfig = {
        [PersistenceMode.NONE]: { save: '', appendonly: 'no', message: 'Persistence disabled' },
        [PersistenceMode.RDB]: { save: '900 1 300 10 60 10000', appendonly: 'no', message: 'RDB persistence enabled' },
        [PersistenceMode.AOF]: { save: '', appendonly: 'yes', message: 'AOF persistence enabled' }
    };
    constructor() {
        try {
            const redisConfig = {
                host: process.env.REDIS_HOST || '127.0.0.1',
                port: parseInt(process.env.REDIS_PORT || '6379', 10),
                password: process.env.REDIS_PASSWORD || undefined,
                db: parseInt(process.env.REDIS_DB || '0', 10),
            };
            this.client = new Redis(redisConfig);
        }
        catch (error) {
            throw new RedisConnectionError(`Failed to connect to Redis: ${error.message}`);
        }
    }
    static getInstance() {
        if (!RedisClient.instance) {
            RedisClient.instance = new RedisClient();
        }
        return RedisClient.instance;
    }
    async set(key, value, expireInSeconds) {
        if (expireInSeconds) {
            await this.client.set(key, value, 'EX', expireInSeconds);
        }
        else {
            await this.client.set(key, value);
        }
    }
    async get(key) {
        return this.client.get(key);
    }
    async ttl(key) {
        return this.client.ttl(key);
    }
    async hset(key, field, value) {
        await this.client.hset(key, field, value);
    }
    async hget(key, field) {
        return this.client.hget(key, field);
    }
    async getAll(key) {
        return this.client.hgetall(key);
    }
    async setPersistence(mode) {
        try {
            const config = this.persistenceConfig[mode];
            if (!config) {
                throw new Error('Invalid persistence mode.');
            }
            await this.redis.sendCommand(['CONFIG', 'SET', 'save', config.save]);
            await this.redis.sendCommand(['CONFIG', 'SET', 'appendonly', config.appendonly]);
            return config.message;
        }
        catch (error) {
            if (error instanceof Error) {
                throw new PersistenceError(`Error setting persistence mode: ${error.message}`);
            }
            else {
                throw new PersistenceError("Unknown error occurred while setting persistence mode");
            }
        }
    }
    async runTransaction(commands) {
        const pipeline = this.redis.multi();
        commands.forEach((command) => {
            pipeline.addCommand(command);
        });
        try {
            return await pipeline?.exec();
        }
        catch (error) {
            if (error instanceof Error) {
                throw new TransactionError(`Error executing transaction: ${error.message}`);
            }
            else {
                throw new TransactionError(`Unknown error occurred while executing transaction`);
            }
        }
    }
    async quit() {
        try {
            await this.client.quit();
        }
        catch (error) {
            throw new RedisConnectionError(`Failed to quit Redis connection: ${error.message}`);
        }
    }
}
