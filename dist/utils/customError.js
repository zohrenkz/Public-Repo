export class CustomError extends Error {
    statusCode;
    errorCode;
    constructor(message, statusCode, errorCode) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        Error.captureStackTrace(this, this.constructor);
    }
}
export class RedisConnectionError extends CustomError {
    constructor(message = "Failed to connect to Redis.") {
        super(message, 500, "REDIS_CONNECTION_ERROR");
    }
}
export class PersistenceError extends CustomError {
    constructor(message = "Persistence configuration failed.") {
        super(message, 400, "PERSISTENCE_ERROR");
    }
}
export class NotFoundError extends CustomError {
    constructor(message = "Resource not found.") {
        super(message, 404, "NOT_FOUND_ERROR");
    }
}
export class TransactionError extends CustomError {
    constructor(message = "Transaction failed.") {
        super(message, 500, "TRANSACTION_ERROR");
    }
}
