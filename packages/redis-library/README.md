# Redis Client Library
This is a TypeScript-based Redis client library built using the ioredis library. It provides a singleton implementation for Redis connections and a set of utility functions for working with Redis. This library includes support for persistence modes, transactions, and basic Redis commands.

## Features
```
Singleton implementation of the Redis client.
Simple methods for SET, GET, TTL, HSET, HGET, and HGETALL.
Support for Redis persistence modes (NONE, RDB, AOF).
Transaction handling using Redis pipelines.
Handles errors using custom error classes (RedisConnectionError, PersistenceError, and TransactionError).

```

## Installation
Install dependencies:
Run the following command to install the required dependencies:

```

npm install ioredis dotenv
Environment Variables:
Create a .env file in the root directory and add your Redis configuration:


REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=yourpassword
REDIS_DB=0

```
## Usage
1. Import and Initialization
```typescript
import { RedisClient } from './redisClient';
import { PersistenceMode } from './config/enums';

// Initialize the Redis client
const redis = RedisClient.getInstance();
```
2. Set and Get Keys
```typescript
// Set a key with an optional expiration time
await redis.set('key1', 'value1', 60); // Expires in 60 seconds
console.log('Key set successfully.');

// Get a key's value
const value = await redis.get('key1');
console.log(`Retrieved value: ${value}`);
```

3. Work with TTL
```typescript
const ttl = await redis.ttl('key1');
console.log(`Time to live: ${ttl} seconds`);
```

4. Hash Operations
```typescript
// Set hash fields
await redis.hset('users', 'user:1', JSON.stringify({ name: 'Alice' }));
await redis.hset('users', 'user:2', JSON.stringify({ name: 'Bob' }));

// Get a specific field from a hash
const user = await redis.hget('users', 'user:1');
console.log(`User 1 info: ${user}`);

// Get all fields in a hash
const allUsers = await redis.getAll('users');
console.log('All users:', allUsers);
```

5. Set Persistence Mode
```typescript

const persistenceMessage = await redis.setPersistence(PersistenceMode.RDB);
console.log(persistenceMessage); // Output: "RDB persistence enabled"
```
6. Run a Transaction
```typescript
const result = await redis.runTransaction([
    ['set', 'user:3', JSON.stringify({ name: 'Charlie' })],
    ['get', 'user:3']
]);

console.log('Transaction result:', result);

```
7. Quit the Redis Connection
```typescript
await redis.quit();
console.log('Redis connection closed successfully.');
```
## Error Handling
This library uses custom error classes to manage specific error cases:

RedisConnectionError: Raised when the Redis client fails to connect or quit.
PersistenceError: Raised during errors in setting the persistence mode.
TransactionError: Raised during transaction failures.
Example:
```typescript
try {
    await redis.set('key', 'value');
} catch (error) {
    if (error instanceof RedisConnectionError) {
        console.error('Redis connection error:', error.message);
    } else {
        console.error('Unexpected error:', error.message);
    }
}
```

## Development
```

Project Structure:
redisClient.ts: Implements the core Redis client functionality.
config/enums.ts: Defines enums for persistence modes (NONE, RDB, AOF).
utils/customError.ts: Contains custom error classes for enhanced error handling.
Scripts:
Start Development: Run ts-node to execute the TypeScript code:
npx ts-node lib/main.ts
Build: Compile the TypeScript code to JavaScript:
npx tsc
```



