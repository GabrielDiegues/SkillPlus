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


export {getAllLearningPaths}
