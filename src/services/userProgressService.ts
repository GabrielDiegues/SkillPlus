import { get, ref } from "@firebase/database";
import { LearningPath, UserProgress } from "../types";
import { database } from "./firebaseConfig";
import { LEARNING_PATH_TABLE, USER_PROGRESS_TABLE } from "../utils/tables";

const getAllFilteredUserProgresses = async (userId: string, filteredPaths: LearningPath[]): Promise<UserProgress[]> => {
    try {
        const promises = filteredPaths.map(async (path) => {
            const snapShot = await get(ref(database, `${USER_PROGRESS_TABLE}${userId}/${path.id}`));
            return snapShot.exists() ? snapShot.val() as UserProgress : null;
        });
        const results = await Promise.all(promises);
        return results.filter(Boolean) as UserProgress[];
    }
    catch (error) {
        throw error;
    }
}


const getUserProgress = async (userId: string, learningPathId: string): Promise<UserProgress | null> => {
    try {
        const snapShot = await get(ref(database, `${USER_PROGRESS_TABLE}${userId}/${learningPathId}`))
        return snapShot.exists() ? snapShot.val() as UserProgress : null;
    }
    catch {
        return null;
    }
}

export { getAllFilteredUserProgresses, getUserProgress }