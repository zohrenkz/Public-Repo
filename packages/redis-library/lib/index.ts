import { RedisClient } from "./redisClient";
import { PersistenceMode } from "./config/enums";

const newUser = [
    { firstName: 'ali', lastName: 'ali', email: 'ali@example.com' },
    { firstName: 'test', lastName: 'test', email: 'test@example.com' },
    { firstName: 'reza', lastName: 'reza', email: 'reza@example.com' },
];
async function main() {
    const redis = RedisClient.getInstance();

    try {
        const persistenceMessage = await redis.setPersistence(PersistenceMode.RDB);
        console.log(persistenceMessage);
    } catch (error) {
        console.error('Failed to set persistence mode:', error);
    }

    try {

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
