import Redis from "ioredis-mock";
import { RedisClient } from "./RedisClient";
import { PersistenceMode, PersistenceError, TransactionError } from "./config/enums.ts";
jest.mock("ioredis", () => Redis);
describe("RedisClient", () => {
    let redisClient;
    beforeAll(() => {
        redisClient = RedisClient.getInstance();
    });
    afterAll(async () => {
        await redisClient.quit();
    });
    test("should set and get a key-value pair", async () => {
        await redisClient.set("key1", "value1");
        const result = await redisClient.get("key1");
        expect(result).toBe("value1");
    });
    test("should set a key with expiration", async () => {
        await redisClient.set("key2", "value2", 1);
        const ttlBefore = await redisClient.ttl("key2");
        expect(ttlBefore).toBeGreaterThan(0);
        // Wait for expiration
        await new Promise((r) => setTimeout(r, 1500));
        const result = await redisClient.get("key2");
        expect(result).toBeNull();
    });
    test("should handle hash set and get operations", async () => {
        await redisClient.hset("hash1", "field1", "value1");
        const result = await redisClient.hget("hash1", "field1");
        expect(result).toBe("value1");
        const allHash = await redisClient.getAll("hash1");
        expect(allHash).toEqual({ field1: "value1" });
    });
    test("should handle transactions successfully", async () => {
        const commands = [
            ["set", "key3", "value3"],
            ["set", "key4", "value4"],
        ];
        const results = await redisClient.runTransaction(commands);
        expect(results).toHaveLength(2);
        expect(results[0][1]).toBe("OK");
        expect(results[1][1]).toBe("OK");
        const value3 = await redisClient.get("key3");
        const value4 = await redisClient.get("key4");
        expect(value3).toBe("value3");
        expect(value4).toBe("value4");
    });
    test("should throw an error for invalid transaction", async () => {
        const commands = [
            ["set", "key5"],
        ];
        await expect(redisClient.runTransaction(commands)).rejects.toThrow(TransactionError);
    });
    test("should set persistence mode", async () => {
        const message = await redisClient.setPersistence(PersistenceMode.RDB);
        expect(message).toBe("RDB persistence enabled");
    });
    test("should throw PersistenceError for invalid mode", async () => {
        await expect(redisClient.setPersistence("INVALID_MODE")).rejects.toThrow(PersistenceError);
    });
});
