import { get, ref } from "@firebase/database";
import { LearningPath } from "../types";
import { database } from "./firebaseConfig";
import { LEARNING_PATH_TABLE } from "../utils/tables";

const getAllLearningPaths = async (): Promise<LearningPath[]> => {
    try {
        const snapShot = await get(ref(database, LEARNING_PATH_TABLE));
        if(!snapShot.exists()) {
            return [];
        }

        return Object.values(snapShot.val()) as LearningPath[];
    }
    catch(error) {
        throw error;
    }
}

const getLearningPath = async (learningPathId: string): Promise<LearningPath | null> => {
    try {
        const snapShot = await(get(ref(database, `${LEARNING_PATH_TABLE}${learningPathId}`)))
        return snapShot.exists() ? snapShot.val() as LearningPath : null;
    }
    catch {
        return null;
    }
}

export {getAllLearningPaths, getLearningPath}
