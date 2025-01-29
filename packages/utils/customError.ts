export class CustomError extends Error {
    statusCode: number;
    errorCode: string;

    constructor(message: string, statusCode: number, errorCode: string) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        Error.captureStackTrace(this, this.constructor);
    }
}

export class RedisConnectionError extends CustomError {
    constructor(message: string = "Failed to connect to Redis.") {
        super(message, 500, "REDIS_CONNECTION_ERROR");
    }
}

export class PersistenceError extends CustomError {
    constructor(message: string = "Persistence configuration failed.") {
        super(message, 400, "PERSISTENCE_ERROR");
    }
}

export class NotFoundError extends CustomError {
    constructor(message: string = "Resource not found.") {
        super(message, 404, "NOT_FOUND_ERROR");
    }
}

export class TransactionError extends CustomError {
    constructor(message: string = "Transaction failed.") {
        super(message, 500, "TRANSACTION_ERROR");
    }
}