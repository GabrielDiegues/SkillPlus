import { get, ref, set } from "@firebase/database";
import { LearningPath, Status, User, UserProgress } from "../types";
import { database } from "./firebaseConfig";
import { LEARNING_PATH_TABLE, USER_PROGRESS_TABLE } from "../utils/tables";

const getAllFilteredUserProgresses = async (userId: string, filteredPaths: LearningPath[]): Promise<UserProgress[]> => {
    try {
        const promises = filteredPaths.map(async (path) => {
            const snapShot = await get(ref(database, `${USER_PROGRESS_TABLE}${userId}/${path.id}`));
            if(!snapShot.exists()) {
                const newUserProgress: UserProgress = {
                    id: `${userId}_${path.id}`,
                    userId: userId,
                    learningPathId: path.id,
                    progressPercentage: 0,
                    status: Status.NotStarted
                }
                await set(ref(database, `${USER_PROGRESS_TABLE}${userId}/${path.id}`), newUserProgress);
                return newUserProgress;
            }
            else {
                return snapShot.val() as UserProgress;
            }
        });
        return await Promise.all(promises);
    }
    catch (error) {
        throw error;
    }
}


const getUserProgress = async (userId: string, learningPathId: string): Promise<UserProgress | null> => {
    try {
        const snapShot = await get(ref(database, `${USER_PROGRESS_TABLE}${userId}/${learningPathId}`));
        return snapShot.exists() ? snapShot.val() as UserProgress : null;
    }
    catch {
        return null;
    }
}


const updateStatus = async (userId: string, learningPathId: string, newStatus: Status): Promise<boolean> => {
    try {
        const snapShot = await get(ref(database, `${USER_PROGRESS_TABLE}${userId}/${learningPathId}`));
        if(snapShot) {
            const storedUser = snapShot.val() as UserProgress;
            storedUser.status = newStatus;
            await set(ref(database, `${USER_PROGRESS_TABLE}${userId}/${learningPathId}`), storedUser);
            return true;
        }
        else {
            return false;
        }
    }
    catch {
        return false;
    }
}


const updateProgressPercentage = async (userId: string, learningPathId: string, newProgressPercentage: number): Promise<boolean> => {
    try {
        const snapShot = await get(ref(database, `${USER_PROGRESS_TABLE}${userId}/${learningPathId}`));
        if(snapShot) {
            const storedUser = snapShot.val() as UserProgress;
            storedUser.progressPercentage = newProgressPercentage;
            await set(ref(database, `${USER_PROGRESS_TABLE}${userId}/${learningPathId}`), storedUser);
            return true;
        }
        else {
            return false;
        }
    }
    catch {
        return false;
    }
}
export { getAllFilteredUserProgresses, getUserProgress, updateStatus, updateProgressPercentage }