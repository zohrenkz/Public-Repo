# Introduction
This project provides a library to manage user data in Redis using Redis OM. It offers CRUD (Create, Retrieve, Update, Delete) functionality for users and handles errors with a custom error-handling class. The repository pattern ensures a clean and maintainable structure for database operations.


## Features
```
User Data Model (Schema): Define the structure of user data.
CRUD Operations:
Create a new user (create)
Retrieve a user by ID (getById)
Update user information (update)
Delete a user (remove)
Automatic Indexing: Ensures optimized search with automatic index creation.
Error Handling: Uses a CustomError class for consistent error management.
Redis Connection via Environment Variable (REDIS_URL).
Prerequisites
Node.js (v16 or later)
Redis (v6 or later)
Redis OM Library
```
## Installation
```
1. Install Dependencies
Run the following command to install required packages:

npm install redis-om dotenv
2. Environment Configuration
Create a .env file in the project root and add the following variable:

env
REDIS_URL=redis://localhost:6379
Replace localhost and 6379 with the host and port of your Redis server if necessary.

Project Structure
userModel.ts: Defines the user schema for Redis OM.
redisClient.ts: Handles Redis connections.
userRepository.ts: Manages user-related operations.
```
## Usage
1. Import and Initialize

```typescript
import { UserRepository } from './userRepository';

const userRepo = new UserRepository();

async function main() {
    await userRepo.init();
    console.log('User repository initialized.');
}

main().catch(console.error);
```
2. Create a New User

```typescript
const user = await userRepo.create({
    firstName: 'Ali',
    lastName: 'Rezaei',
    email: 'ali.rezaei@example.com'
});

console.log('Created user:', user);
```
3. Retrieve a User by ID

```typescript
const userId = '12345'; // Replace with the actual user ID
const user = await userRepo.getById(userId);
console.log('Retrieved user:', user);
```
4. Update User Information

```typescript
const updatedUser = await userRepo.update(userId, { email: 'new.email@example.com' });
console.log('Updated user:', updatedUser);
```
5. Delete a User
```typescript
await userRepo.remove(userId);
console.log('User removed successfully.');
```
## Error Handling
The library uses a CustomError class to manage various errors. Each error contains a message, an HTTP status code, and a unique error code.

Sample Errors:
```
REPOSITORY_INIT_FAILED: Failed to initialize the repository.
REPOSITORY_NOT_INITIALIZED: Attempted to use methods without initialization.
USER_CREATION_FAILED: Error while creating a user.
USER_NOT_FOUND: User with the specified ID was not found.
USER_UPDATE_FAILED: Error while updating user information.
USER_REMOVAL_FAILED: Error while deleting a user.
```
Example of Error Handling:

```typescript
try {
    const user = await userRepo.getById('invalidId');
} catch (error) {
    if (error instanceof CustomError) {
        console.error(`Error: ${error.message}, Code: ${error.code}, Status: ${error.statusCode}`);
    } else {
        console.error('Unexpected error:', error);
    }
}
```
## Commands
```
Run the TypeScript Code Directly:

npx ts-node src/main.ts
Compile TypeScript to JavaScript:

npx tsc
```
## Future Enhancements
In future releases, the following features could be added:

Advanced Search: Filtering and sorting capabilities.
Data Validation: Using libraries like class-validator.
Unit Testing: Integration with Jest or other testing frameworks.
Improved Logging: For better event and error tracking.
