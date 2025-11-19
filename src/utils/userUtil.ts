import { SignInUser, SignUpUser } from "../types";

// Functions
const updateUserProp = <T extends SignUpUser | SignInUser, K extends keyof T>(prop: K, value: string) => (prev: T):T => ({...prev, [prop]: value});

export {updateUserProp};