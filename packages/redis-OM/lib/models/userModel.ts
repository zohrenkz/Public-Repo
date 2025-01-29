
import { Entity, Schema } from "redis-om";

// تعریف مدل کاربر با استفاده از Entity
export interface User {
    [key: string]: any;
    firstName: string;
    lastName: string;
    email: string;

}

export const userSchema = new Schema<User>(
    "User",
    {
        firstName: { type: "string" },
        lastName: { type: "string" },
        email: { type: "string" },
    }
);
