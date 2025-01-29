This README provides an overview and usage instructions for two libraries:

Redis Client Library - A custom wrapper for managing Redis operations.
Redis OM Library - A repository-based approach for working with Redis using object mapping.
# 1. Redis Client Library
This library provides a wrapper around Redis operations using the ioredis package. It is designed to simplify Redis interactions, including CRUD operations, persistence modes, and transactions.

## Features
Manage key-value pairs with TTL.
Support for hash-based storage (HSET, HGET, etc.).
Enable and configure Redis persistence modes (RDB, AOF, None).
Support for Redis transactions.
Custom error handling for Redis operations.
##Installation

```
npm install ioredis dotenv
```
## Usage
Example Code
```typescript
import dotenv from "dotenv";
import { RedisClient } from "./redisClient";
import { PersistenceMode } from "./config/enums";

dotenv.config();

async function main() {
    const redis = RedisClient.getInstance();

    try {
        const persistenceMessage = await redis.setPersistence(PersistenceMode.RDB);
        console.log(persistenceMessage);
    } catch (error) {
        console.error('Failed to set persistence mode:', error);
    }

    try {
        const newUser = [
            { firstName: 'ali', lastName: 'ali', email: 'ali@example.com' },
            { firstName: 'test', lastName: 'test', email: 'test@example.com' },
            { firstName: 'reza', lastName: 'reza', email: 'reza@example.com' },
        ];

        await redis.set('user:1', JSON.stringify(newUser[0]), 60);
        console.log('Value set.');

        const value = await redis.get('user:1');
        if (value) {
            console.log(`Retrieved Value: ${value}`);
        } else {
            console.log('No value found for key user:1');
        }

        const ttl = await redis.ttl('user:1');
        console.log(`Time to live: ${ttl}`);
    } catch (error) {
        console.error('Failed to set or get a key:', error);
    }

    try {
        await redis.hset('users', 'user:1', JSON.stringify(newUser[0]));
        await redis.hset('users', 'user:2', JSON.stringify(newUser[1]));

        const user = await redis.hget('users', 'user:1');
        if (user) {
            console.log(`User info: ${user}`);
        } else {
            console.log('No user found for user:1');
        }

        const result = await redis.getAll('users');
        console.log('All users:', result);
    } catch (error) {
        console.error('Failed with hash operations:', error);
    }

    try {
        console.log('Running a sample transaction...');
        await redis.runTransaction([
            ['set', 'user:3', JSON.stringify(newUser[2])],
            ['get', 'user:3']
        ]);
        console.log('Transaction completed successfully.');
    } catch (error) {
        console.error('Failed to execute transaction:', error);
    }

    try {
        await redis.quit();
        console.log('Redis connection closed successfully.');
    } catch (error) {
        console.error('Failed to close Redis connection:', error);
    }
}

main().catch((error) => {
    console.error('An error occurred in main:', error);
});


```
## Key Methods
Method	Description
```
set(key, value, ttl?)	Stores a key-value pair with an optional expiration time.
get(key)	Retrieves the value for a specific key.
ttl(key)	Checks the remaining TTL (time-to-live) of a key.
hset(hash, field, value)	Sets a field within a hash.
hget(hash, field)	Retrieves a field's value from a hash.
setPersistence(mode)	Configures Redis persistence (RDB, AOF, or None).
runTransaction(commands)	Executes a Redis transaction.
quit()	Safely closes the Redis connection.
```
# 2. Redis OM Library
This library uses redis-om to manage Redis as a data store for object-like entities. It provides a repository-based approach for managing Redis data with schemas and object mapping.

## Features
Define and manage Redis schemas.
Perform CRUD operations on Redis entities.
Automatic indexing for faster lookups.
Object mapping for Redis records.
## Installation
```
npm install redis-om dotenv 
```
## Usage
Example Code
```typescript
import { RedisClient } from '../redis/redisClient';
import { UserRepository } from '../../../redis-OM/lib/repositories/userRepository';
import { CustomError } from '../utils/customError';
import {PersistenceMode} from "../config/enums";



export async function main() {

    try {
        const userRepository = new UserRepository();
        await userRepository.init();
        const newUser = {
            firstName: 'ali',
            lastName: 'ali',
            email: 'ali@example.com'
        };

        if (!newUser.firstName || !newUser.lastName || !newUser.email) {
            throw new CustomError('Invalid user data provided', 400, 'INVALID_USER_DATA');
        }
        const userID = await userRepository.create(newUser);
        console.log('User created with ID:', userID);

        const user = await userRepository.getById(userID);
        console.log('User Info :', user);

    } catch (error) {
        if (error instanceof CustomError) {
            console.error(`${error.errorCode}: ${error.message}`);
        } else {
            console.error('An unexpected error occurred:', error);
        }
    }
}


main().catch((error) => {
    console.error('An error occurred in main:', error);
});

```
## Key Methods
Method	Description
``` 
init()	Initializes the Redis OM client and repository.
create(data)	Creates a new record in the Redis database.
getById(id)	Fetches a record by its ID.
update(id, data)	Updates an existing record with new data.
remove(id)	Deletes a record by its ID.
```
## User Schema Example
The library relies on schemas to define Redis objects. Below is an example of a User schema:
```typescript
import { Entity, Schema } from 'redis-om';

export const userSchema = new Schema(User, {
    firstName: { type: 'string' },
    lastName: { type: 'string' },
    email: { type: 'string' },
});
```
## Testing
Both libraries are designed to be testable. Use Jest to write unit tests for your implementations. Mock Redis dependencies like ioredis or redis-om for isolation.

Example Test for Redis OM

```typescript
import { UserRepository } from './userRepository';
import { Client, Repository } from 'redis-om';

jest.mock('redis-om');

describe('UserRepository Tests', () => {
    let userRepository: UserRepository;
    let mockRepository: jest.Mocked<Repository<any>>;

    beforeEach(() => {
        mockRepository = {
            save: jest.fn(),
            fetch: jest.fn(),
            createIndex: jest.fn(),
            remove: jest.fn(),
        } as unknown as jest.Mocked<Repository<any>>;

        jest.spyOn(Client.prototype, 'fetchRepository').mockReturnValue(mockRepository);
        userRepository = new UserRepository();
    });

    it('should initialize repository', async () => {
        await userRepository.init();
        expect(mockRepository.createIndex).toHaveBeenCalled();
    });

    it('should create a user', async () => {
        mockRepository.save.mockResolvedValueOnce('123');
        const result = await userRepository.create({ firstName: 'Ali', lastName: 'Reza', email: 'ali@example.com' });
        expect(mockRepository.save).toHaveBeenCalled();
        expect(result).toBe('123');
    });
});
```
## Error Handling
Both libraries include custom error classes to handle Redis-related errors:
``` 
Redis Client Library:

RedisConnectionError
PersistenceError
TransactionError
Redis OM Library:

CustomError (handles repository and operation errors).
```
## Environment Variables
Make sure to configure your .env file for both libraries. Below is an example .env file:

``` 
env
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=your_password
REDIS_DB=0
REDIS_URL=redis://127.0.0.1:6379
```
## Conclusion
These libraries provide robust tools for interacting with Redis, catering to different use cases:

Use the Redis Client Library for low-level Redis operations with full control.
Use the Redis OM Library for managing Redis as an object store with schema-based operations.
