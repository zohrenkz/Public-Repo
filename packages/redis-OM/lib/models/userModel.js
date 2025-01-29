import { Schema } from "redis-om";
export const userSchema = new Schema("User", {
    firstName: { type: "string" },
    lastName: { type: "string" },
    email: { type: "string" },
});
