import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { MainTabsParamList, SkillAssessment, SkillAssessmentItem, SkillCategory, SkillQuestion } from "../types";
import { useEventContext } from "../context/eventContext";
import { useState } from "react";
import { useScreenAlert } from "../utils/displayMessages";
import { CommonActions } from "@react-navigation/native";
import { createAssessmentItem, deleteSkillAssessment } from "../services/assessementService";
import { FirebaseError } from "@firebase/util";
import { getErrorMessage } from "../utils/errorMessages";
import { Pressable, ScrollView, StyleSheet, View, Text } from "react-native";
import MainTabsHeader from "../components/headerStyles/mainTabsHeader";
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

// Outter variables
const skillQuestions: SkillQuestion[] = [
    { id: '1', name: 'Problem Solving', category: SkillCategory.Soft },
    { id: '2', name: 'Communication', category: SkillCategory.Soft },
    { id: '3', name: 'Leadership', category: SkillCategory.Soft },
    { id: '4', name: 'Time Management', category: SkillCategory.Soft },
    { id: '5', name: 'Data Analysis', category: SkillCategory.Technical },
    { id: '6', name: 'Programming', category: SkillCategory.Technical },
    { id: '7', name: 'AI & Machine Learning', category: SkillCategory.Technical },
    { id: '8', name: 'Project Management', category: SkillCategory.Technical },
];

// Main component
const Assessment = (props: NativeStackScreenProps<MainTabsParamList>) => {
    // Inner variables
    const { navigation } = props;
    const { loggedUser } = useEventContext();
    const screenAlert = useScreenAlert();
    const [ratings, setRatings] = useState<{ [key: string]: number }>({});
    const [saving, setSaving] = useState(false);


    // Inner functions
    const navigateToAiPicks = () => {
        screenAlert("Successo", "Sua avaliação de habilidades foi salva! Cheque suas recomendações geradas por IA!");
        return navigation.reset({
            index: 0,
            routes: [{ name: 'AiPicks' }],
        });
    };

    const navigateToLogin = () => {
        screenAlert("error", "Erro ao carregar usuário. Por favor, faça login novamente");
        navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [{ name: "Login" }]
            }),
        );
    };


    const handleRating = (skillId: string, rating: number) => {
        setRatings((prev) => ({ ...prev, [skillId]: rating }));
    }


    const handleSave = async () => {
        if (Object.keys(ratings).length !== skillQuestions.length) {
            screenAlert("Erro", "Por favor, preencha todos os campos");
            return;
        }

        if (!loggedUser) {
            navigateToLogin();
            return;
        }

        setSaving(true);

        try {
            // 1. Apaga avaliações antigas desse usuário
            await deleteSkillAssessment(loggedUser.id);

            // 2. Cria o SkillAssessment (1 por usuário)
            const skillAssessmentId = uuidv4();

            const skillAssessment: SkillAssessment = {
                id: skillAssessmentId,
                userId: loggedUser.id,
            };

            // 3. Cria todos os SkillAssessmentItem
            const tasks: Promise<boolean>[] = [];

            for (const q of skillQuestions) {
                const itemId = uuidv4();

                const assessmentItem: SkillAssessmentItem = {
                    id: itemId,
                    skillAssessmentId: skillAssessmentId,
                    name: q.name,
                    category: q.category,
                    rating: ratings[q.id],
                };

                // cria um item (e o assessment na primeira vez)
                tasks.push(createAssessmentItem(skillAssessment, assessmentItem));
            }

            // aguarda todas as gravações terminarem
            await Promise.all(tasks);

            navigateToAiPicks();
        }
        catch (error) {
            console.error(error);
            screenAlert(
                "Erro",
                error instanceof FirebaseError
                    ? getErrorMessage(error.code)
                    : `Erro ao salvar avaliação de habilidades. Por favor, tente novamente mais tarde\n${error}`
            );
        }
        finally {
            setSaving(false);
        }
    };




    return (
        <View style={styles.container}>
            <MainTabsHeader
                title="Skills Self-Assessment"
                subTitle="Rate your current skill level in each area. This helps us personalize your learning path and provide better AI recommendations."
            />
            <ScrollView style={styles.content}>

                <Text style={styles.sectionTitle}>Soft Skills</Text>
                {skillQuestions
                    .filter((q) => q.category === SkillCategory.Soft)
                    .map((question) => (
                        <View key={question.id} style={styles.questionCard}>
                            <Text style={styles.questionText}>{question.name}</Text>
                            <View style={styles.ratingContainer}>
                                {[1, 2, 3, 4, 5].map((rating) => (
                                    <Pressable
                                        key={rating}
                                        style={[
                                            styles.ratingButton,
                                            ratings[question.id] === rating && styles.ratingButtonActive,
                                        ]}
                                        onPress={() => handleRating(question.id, rating)}
                                    >
                                        <Text
                                            style={[
                                                styles.ratingText,
                                                ratings[question.id] === rating && styles.ratingTextActive,
                                            ]}
                                        >
                                            {rating}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>
                            <View style={styles.ratingLabels}>
                                <Text style={styles.ratingLabel}>Beginner</Text>
                                <Text style={styles.ratingLabel}>Expert</Text>
                            </View>
                        </View>
                    ))}

                <Text style={styles.sectionTitle}>Technical Skills</Text>
                {skillQuestions
                    .filter((q) => q.category === SkillCategory.Technical)
                    .map((question) => (
                        <View key={question.id} style={styles.questionCard}>
                            <Text style={styles.questionText}>{question.name}</Text>
                            <View style={styles.ratingContainer}>
                                {[1, 2, 3, 4, 5].map((rating) => (
                                    <Pressable
                                        key={rating}
                                        style={[
                                            styles.ratingButton,
                                            ratings[question.id] === rating && styles.ratingButtonActive,
                                        ]}
                                        onPress={() => handleRating(question.id, rating)}
                                    >
                                        <Text
                                            style={[
                                                styles.ratingText,
                                                ratings[question.id] === rating && styles.ratingTextActive,
                                            ]}
                                        >
                                            {rating}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>
                            <View style={styles.ratingLabels}>
                                <Text style={styles.ratingLabel}>Beginner</Text>
                                <Text style={styles.ratingLabel}>Expert</Text>
                            </View>
                        </View>
                    ))}

                <Pressable
                    style={[styles.saveButton, saving && styles.disabledButton]}
                    onPress={handleSave}
                    disabled={saving}
                >
                    <Text style={styles.saveButtonText}>
                        {saving ? 'Saving...' : 'Save and Generate Recommendations'}
                    </Text>
                </Pressable>
            </ScrollView>
        </View>
    )
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        backgroundColor: '#0066cc',
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    intro: {
        fontSize: 15,
        color: '#666',
        lineHeight: 22,
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1a1a1a',
        marginBottom: 15,
        marginTop: 10,
    },
    questionCard: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 12,
        marginBottom: 15,
    },
    questionText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 15,
    },
    ratingContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    ratingButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#e0e0e0',
    },
    ratingButtonActive: {
        backgroundColor: '#0066cc',
        borderColor: '#0066cc',
    },
    ratingText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#666',
    },
    ratingTextActive: {
        color: '#fff',
    },
    ratingLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    ratingLabel: {
        fontSize: 12,
        color: '#999',
    },
    saveButton: {
        backgroundColor: '#0066cc',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        marginTop: 20,
        marginBottom: 40,
    },
    disabledButton: {
        opacity: 0.6,
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
});

export default Assessment;