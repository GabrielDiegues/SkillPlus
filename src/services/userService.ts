import { get, ref } from "@firebase/database";
import { User } from "../types";
import { database } from "./firebaseConfig";
import { USER_TABLE } from "../utils/tables";

const getUser = async (uid: string): Promise<User | null> => {
    try {
        const snapShot = await get(ref(database, `${USER_TABLE}${uid}`));
        return snapShot.exists() ? snapShot.val() as User : null;
    }
    catch {
        return null;
    }
}

export {getUser}