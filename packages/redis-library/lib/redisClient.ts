import dotenv from "dotenv";
import Redis from 'ioredis';
import {createClient, RedisClientType} from '@redis/client';
import {Command} from 'ioredis';
import {PersistenceInterface, PersistenceMode} from "./config/enums";
import {RedisConnectionError, PersistenceError, TransactionError} from "../../utils/customError";


dotenv.config();


export class RedisClient {
    private static instance: RedisClient;
    private redis!: RedisClientType;
    private persistenceConfig: PersistenceInterface = {
        [PersistenceMode.NONE]: {save: '', appendonly: 'no', message: 'Persistence disabled'},
        [PersistenceMode.RDB]: {save: '900 1 300 10 60 10000', appendonly: 'no', message: 'RDB persistence enabled'},
        [PersistenceMode.AOF]: {save: '', appendonly: 'yes', message: 'AOF persistence enabled'}
    };

    constructor() {

    }

    async connect() {

        try {
            const redisConfig = {
                url: process.env.REDIS_URL || 'redis://localhost:6379',
                db: parseInt(process.env.REDIS_DB || '0', 10)
            };
            this.redis = createClient(redisConfig);
            await this.redis.connect();

        } catch (error) {
            if (error instanceof Error) {
                throw new RedisConnectionError(`Error connecting to Redis: ${error.message}`);
            } else {
                throw new RedisConnectionError("Unknown error connecting to Redis");
            }
        }
    }

    isConnected() {
        return this.redis?.isOpen;
    }


    public static getInstance(): RedisClient {
        if (!RedisClient.instance) {
            RedisClient.instance = new RedisClient();
        }
        return RedisClient.instance;
    }


    async set(key: string, value: string, expireInSeconds?: number): Promise<void> {
        if (expireInSeconds) {
            await this.redis.set(key, value, {EX: expireInSeconds});
        } else {
            await this.redis.set(key, value);
        }
    }

    async get(key: string): Promise<string | null> {
        return this.redis.get(key);
    }

    async ttl(key: string): Promise<number> {
        return this.redis.ttl(key);
    }


    async hset(key: string, field: string, value: string): Promise<void> {
        await this.redis.hSet(key, field, value);
    }

    async hget(key: string, field: string): Promise<string | null> {
        return (await this.redis.hGet(key, field)) ?? null;
    }

    async getAll(key: string): Promise<Record<string, string>> {
        return this.redis.hGetAll(key);
    }


    async setPersistence(mode: PersistenceMode) {
        try {
            const config = this.persistenceConfig[mode];
            if (!config) {
                throw new Error('Invalid persistence mode.');
            }
            await this.redis.sendCommand(['CONFIG', 'SET', 'save', config.save]);
            await this.redis.sendCommand(['CONFIG', 'SET', 'appendonly', config.appendonly]);

            return config.message;
        } catch (error) {
            if (error instanceof Error) {
                throw new PersistenceError(`Error setting persistence mode: ${error.message}`);
            } else {
                throw new PersistenceError("Unknown error occurred while setting persistence mode");
            }
        }

    }

    async runTransaction(commands: [string, ...any[]][]) {
        const pipeline = this.redis.multi();
        commands.forEach((command) => {
            pipeline.addCommand(command);
        });
        try {
            return await pipeline?.exec();
        } catch (error) {
            if (error instanceof Error) {
                throw new TransactionError(`Error executing transaction: ${error.message}`);
            } else {
                throw new TransactionError(`Unknown error occurred while executing transaction`)
            }
        }

    }

    async quit(): Promise<void> {
        try {
            await this.redis.quit();
        } catch (error) {
            if (error instanceof Error) {
                throw new RedisConnectionError(`Failed to quit Redis connection: ${error.message}`);
            } else {
                throw new RedisConnectionError(`Unknown error occurred while Redis connection`)
            }
        }
    }
}



