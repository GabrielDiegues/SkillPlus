import { remove, get, ref, query, orderByChild, equalTo, update } from "@firebase/database";
import { database } from "./firebaseConfig";
import { SKILL_ASSESSMENT_ITEM_TABLE, SKILL_ASSESSMENT_TABLE } from "../utils/tables";
import { SkillAssessment, SkillAssessmentItem } from "../types";

const deleteSkillAssessment = async (userId: string) => {
    try {
        // 1. Get all skill assessments for this user
        const q = query(
            ref(database, SKILL_ASSESSMENT_TABLE),
            orderByChild("userId"),
            equalTo(userId)
        );

        const snapshot = await get(q);
        if (!snapshot.exists()) return;

        const assessmentsObj = snapshot.val(); // object, not array

        // Loop through each assessment
        for (const assessmentId in assessmentsObj) {
            const assessment: SkillAssessment = assessmentsObj[assessmentId];

            // 2. Get all items linked to this assessment
            const itemsQuery = query(
                ref(database, SKILL_ASSESSMENT_ITEM_TABLE),
                orderByChild("skillAssessmentId"),
                equalTo(assessment.id)
            );

            const itemsSnapshot = await get(itemsQuery);

            if (itemsSnapshot.exists()) {
                const itemsObj = itemsSnapshot.val();

                // Delete each item
                for (const itemId in itemsObj) {
                    await remove(
                        ref(database, `${SKILL_ASSESSMENT_ITEM_TABLE}/${itemId}`)
                    );
                }
            }

            // 3. Delete the assessment itself
            await remove(
                ref(database, `${SKILL_ASSESSMENT_TABLE}/${assessmentId}`)
            );
        }
    } catch (error) {
        console.error("Error deleting skill assessment:", error);
    }
};


const createAssessmentItem = async (skillAssessment: SkillAssessment, skillAssessmentItem: SkillAssessmentItem): Promise<boolean> => {
    try {
        const updates: any = {};

        updates[`${SKILL_ASSESSMENT_TABLE}/${skillAssessment.id}`] = skillAssessment;
        updates[`${SKILL_ASSESSMENT_ITEM_TABLE}/${skillAssessmentItem.id}`] = skillAssessmentItem;

        await update(ref(database), updates);
        return true;
    } 
    catch {
        return false;
    }
}


const getSkillAssessmentItems = async (userId: string): Promise<SkillAssessmentItem[] | null> => {
    try {
        // 1. Get assessment
        const q = query(
            ref(database, SKILL_ASSESSMENT_TABLE),
            orderByChild("userId"),
            equalTo(userId)
        );

        const snapshot = await get(q);
        if (!snapshot.exists()) return null;  // <-- no assessment

        const assessmentsObj = snapshot.val();
        const assessmentId = Object.keys(assessmentsObj)[0]; // enforce one assessment
        const assessment: SkillAssessment = assessmentsObj[assessmentId];

        // 2. Get items
        const itemsQuery = query(
            ref(database, SKILL_ASSESSMENT_ITEM_TABLE),
            orderByChild("skillAssessmentId"),
            equalTo(assessment.id)
        );

        const itemsSnapshot = await get(itemsQuery);
        if (!itemsSnapshot.exists()) return []; // assessment exists, items don't

        const itemsObj = itemsSnapshot.val();

        // Ensure itemsObj is an object
        if (typeof itemsObj !== "object" || itemsObj === null) return [];

        const items: SkillAssessmentItem[] =
            Object.keys(itemsObj).map(id => itemsObj[id]);

        return items;
    } 
    catch (error) {
        console.error("Error loading assessment items:", error);
        throw error; // better to let the UI handle it
    }
};


export { deleteSkillAssessment, createAssessmentItem, getSkillAssessmentItems }