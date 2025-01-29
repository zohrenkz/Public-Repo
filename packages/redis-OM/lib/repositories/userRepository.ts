import {Client, Repository} from "redis-om";
import dotenv from "dotenv";
import {userSchema, User} from "../models/userModel";
import { CustomError } from '../../../utils/customError';

dotenv.config();

interface UserData {
    firstName: string,
    lastName: string,
    email: string
};

export class UserRepository {
    private client: Client;
    private repository!: Repository<User>;

    constructor() {
        this.client = new Client();

    }

    async init() {
        try {

            await this.client.open(process.env.REDIS_URL || 'redis://localhost:6379');
            this.repository = this.client.fetchRepository(userSchema);
            await this.repository.createIndex();
            return "User repository initialized successfully.";
        } catch (error) {
            console.error("Failed to initialize user repository:", error);
            throw new CustomError("Failed to initialize user repository", 500, "REPOSITORY_INIT_FAILED");
        }
    }
    private ensureRepositoryInitialized() {
        if (!this.repository) {
            throw new CustomError("Repository is not initialized. Call `init()` first.", 400, "REPOSITORY_NOT_INITIALIZED");

        }
    }
    async create(data: UserData) {
        try {
            this.ensureRepositoryInitialized();
            return await this.repository.save(data);
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new CustomError(`Failed to create user: ${error.message}`, 500, "USER_CREATION_FAILED");
            } else {
                throw new CustomError("Unknown error creating user", 500, "USER_CREATION_FAILED");
            }        }
    }

    async getById(id: string) {
        try {
            this.ensureRepositoryInitialized();
            const user = await this.repository.fetch(id);
            if (!user) {
                throw new CustomError("User not found.", 404, "USER_NOT_FOUND");
            }
            return user;
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new CustomError(`Failed to fetch user by ID: ${error.message}`, 500, "FETCH_USER_FAILED");
            }
            else {
                throw new CustomError("Unknown error occurred during fetch user by ID", 500, "FETCH_USER_FAILED");
            }
        }
    }

    async update(id: string, data: Partial<UserData>) {
        try {
            this.ensureRepositoryInitialized();
            const user = await this.repository.fetch(id);
            if (!user) {
                throw new CustomError("User not found.", 404, "USER_NOT_FOUND");
            }
            Object.assign(user, data);
            return await this.repository.save(user);
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new CustomError(`Failed to update user: ${error.message}`, 500, "USER_UPDATE_FAILED");
            }
            else {
                throw new CustomError("Unknown error occurred during update user", 500, "USER_UPDATE_FAILED");
            }
        }
    }

    async remove(id: string) {
        try {
            this.ensureRepositoryInitialized();
            return await this.repository.remove(id);
        }
        catch (error: unknown) {
            if (error instanceof Error) {
                throw new CustomError(`Failed to remove user: ${error.message}`, 500, "USER_REMOVAL_FAILED");
            } else {
                throw new CustomError("Unknown error occurred during remove user", 500, "USER_REMOVAL_FAILED");
            }
        }
    }

}



