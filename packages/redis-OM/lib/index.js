import { UserRepository } from './repositories/userRepository';
import { CustomError } from '../../utils/customError';
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
        const user = await userRepository.create(newUser);
        console.log('User created with ID:', user);
        const resulr = await userRepository.getById(user.id);
        console.log('User Info :', resulr);
    }
    catch (error) {
        console.error('An unexpected error occurred:', error);
    }
}
main().catch((error) => {
    console.error('An error occurred in main:', error);
});
