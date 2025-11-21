import { useEffect, useState, useCallback } from "react";
import { useEventContext } from "../context/eventContext";
import { useScreenAlert } from "../utils/displayMessages";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppStackParamList, LearningPath, MainTabsParamList, SkillAssessmentItem } from "../types";
import { getSkillAssessmentItems } from "../services/assessementService";
import { FirebaseError } from "@firebase/util";
import { getErrorMessage } from "../utils/errorMessages";
import { StyleSheet, View, Text, ScrollView, Image, Pressable } from "react-native";
import FormButton from "../components/formButton";
import { CommonActions, useFocusEffect } from "@react-navigation/native";
import React from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { getAllLearningPaths } from "../services/learningPathService";
import LoadingScreen from "../components/loadingScreen";
import { v4 as uuidv4 } from 'uuid';

// 1. Custom Type to hold merged data (AI Reason + Database Path Details)
type EnrichedRecommendation = {
    id: string;
    reason: string;
    path: LearningPath;
};

// Outer variables
// WARNING: Ideally move this key to a .env file or backend
const genAI = new GoogleGenerativeAI("");

const AiPicks = (props: NativeStackScreenProps<MainTabsParamList>) => {
    const { navigation } = props;
    const { loggedUser } = useEventContext();
    const screenAlert = useScreenAlert();

    const [assessmentItems, setAssessmentItems] = useState<SkillAssessmentItem[]>([]);
    // 2. Changed state to hold the Enriched Recommendation
    const [recommendations, setRecommendations] = useState<EnrichedRecommendation[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const navigateToLogin = () => {
        screenAlert("error", "Erro ao carregar usuário. Por favor, faça login novamente");
        navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [{ name: "Login" }]
            }),
        );
    };

    const loadAiPicks = async (currentItems: SkillAssessmentItem[], currentPaths: LearningPath[]) => {
        try {
            // 3. Fixed Model Name (2.5 doesn't exist publicly yet)
            const model = genAI.getGenerativeModel({
                model: "gemini-2.5-flash",
                generationConfig: { responseMimeType: "application/json" }
            });

            const recommendationsSchema = z.object({
                recommendations: z.array(z.object({
                    learningPathId: z.string().describe("The id from the learning path chosen"),
                    reason: z.string().describe("Explanation for the user"),
                }))
            });

            const jsonSchema = zodToJsonSchema(recommendationsSchema);

            // Optimized prompt to ensure AI picks valid IDs
            const prompt = `
            You are an expert career mentor. 
            Based on the User Skills, select the best matching Learning Paths from the Available list.
            
            User Skills:
            ${JSON.stringify(currentItems.map(i => ({ name: i.name, rating: i.rating })), null, 2)}

            Available Learning Paths (Only pick IDs from here):
            ${JSON.stringify(currentPaths.map(p => ({ id: p.id, title: p.title, category: p.category })), null, 2)}

            Return a JSON object strictly following this schema: ${JSON.stringify(jsonSchema)}
            `;

            const result = await model.generateContent(prompt);
            const responseText = result.response.text();
            const parsedData = JSON.parse(responseText);

            if (parsedData.recommendations) {
                const matchedRecommendations: EnrichedRecommendation[] = [];

                // 4. MATCHING LOGIC: Join AI data with Local Data here, not in JSX
                parsedData.recommendations.forEach((rec: any) => {
                    // Find the full path object in the array we already have
                    const foundPath = currentPaths.find(path => path.id === rec.learningPathId);

                    if (foundPath) {
                        matchedRecommendations.push({
                            id: uuidv4(), // Safe random ID for RN
                            reason: rec.reason,
                            path: foundPath // We embed the full object
                        });
                    }
                });

                setRecommendations(matchedRecommendations);
            }
        } catch (error) {
            console.error("AI Generation Error:", error);
        }
    };

    const loadData = async () => {
        setIsLoading(true);
        if (!loggedUser) {
            navigateToLogin();
            return;
        }

        try {
            const items = await getSkillAssessmentItems(loggedUser.id);

            if (items && items.length > 0) {
                setAssessmentItems(items);

                // Fetch all paths once
                const fetchedPaths = await getAllLearningPaths();

                if (fetchedPaths) {
                    // Pass both to the AI function
                    await loadAiPicks(items, fetchedPaths);
                } else {
                    screenAlert("Error", "Could not load courses.");
                }
            } else {
                setAssessmentItems([]);
            }
        } catch (error) {
            screenAlert("Error", error instanceof FirebaseError ? getErrorMessage(error.code) : "Connection error.");
            navigation.navigate("Home");
        } finally {
            setIsLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            //loadData();
        }, [])
    );

    if (isLoading) {
        return <LoadingScreen />
    }

    return (
        !assessmentItems.length ?
            (
                <View style={styles.container}>
                    <View style={styles.content}>
                        <Text style={styles.title}>Skill Assessment</Text>
                        <Text style={styles.subtitle}>You haven’t completed your skill assessment yet.</Text>
                        <Text style={styles.description}>
                            Take a quick assessment so we can personalize your learning
                            experience and recommend the best courses for you.
                        </Text>
                        <FormButton
                            buttonTitle="Start Assessment"
                            onPressFunction={() => navigation.navigate("Assessment")}
                        />
                    </View>
                </View>
            ) : (
                <ScrollView style={styles.mainContainer}>
                    <View style={styles.header}>
                        <View style={styles.headerContent}>
                            <View>
                                <Text style={styles.headerTitle}>AI Recommendations</Text>
                                <Text style={styles.headerSubtitle}>Based on your assessment</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.introCard}>
                        <Text style={styles.introText}>
                            Based on your skills assessment and learning patterns, we recommend these
                            paths to accelerate your growth.
                        </Text>
                    </View>

                    <View style={styles.recommendationsList}>
                        {/* 5. Render Syncronously using the Enriched Data */}
                        {recommendations.map((rec) => (
                            <View key={rec.id} style={styles.recommendationCard}>
                                <Image
                                    source={{ uri: rec.path.imageUrl }}
                                    style={styles.pathImage}
                                />
                                <View style={styles.pathContent}>
                                    <View style={styles.aiLabel}>
                                        <Text style={styles.aiLabelText}>AI Recommended</Text>
                                    </View>
                                    <Text style={styles.pathTitle}>{rec.path.title}</Text>
                                    <Text style={styles.pathDescription}>
                                        {rec.path.description}
                                    </Text>

                                    <View style={styles.reasonContainer}>
                                        <Text style={styles.reasonLabel}>Why this path?</Text>
                                        <Text style={styles.reasonText}>{rec.reason}</Text>
                                    </View>

                                    <View style={styles.pathMeta}>
                                        <Text style={styles.levelBadge}>{rec.path.dificultyLevel}</Text>
                                        <Text style={styles.categoryBadge}>
                                            {rec.path.category}
                                        </Text>
                                    </View>


                                    <View style={styles.actions}>
                                        <Pressable
                                            style={styles.addButton}
                                            onPress={() => { }}
                                        >
                                            <Text style={styles.addButtonText}>Add to My Paths</Text>
                                        </Pressable>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                </ScrollView>
            )
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f9f9f9", paddingHorizontal: 25, justifyContent: "space-between" },
    content: { marginTop: 80, alignItems: "center", paddingHorizontal: 10 },
    title: { fontSize: 28, fontWeight: "700", color: "#AD0177", marginBottom: 12, textAlign: "center" },
    subtitle: { fontSize: 18, fontWeight: "500", color: "#333", marginBottom: 10, textAlign: "center" },
    description: { fontSize: 15, color: "#555", textAlign: "center", lineHeight: 22, maxWidth: "90%" },
    mainContainer: { flex: 1, backgroundColor: '#f5f5f5' },
    header: { backgroundColor: '#0066cc', paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20 },
    headerContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
    headerSubtitle: { fontSize: 15, color: '#b3d9ff', marginTop: 2 },
    introCard: { backgroundColor: '#fff', margin: 20, padding: 20, borderRadius: 12, borderLeftWidth: 4, borderLeftColor: '#0066cc' },
    introText: { fontSize: 15, color: '#666', lineHeight: 22 },
    recommendationsList: { paddingHorizontal: 20 },
    recommendationCard: { backgroundColor: '#fff', borderRadius: 12, marginBottom: 20, overflow: 'hidden' },
    pathImage: { width: '100%', height: 180 },
    pathContent: { padding: 20 },
    aiLabel: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0066cc', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 6, alignSelf: 'flex-start', marginBottom: 12 },
    aiLabelText: { fontSize: 12, fontWeight: 'bold', color: '#fff' },
    pathTitle: { fontSize: 20, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 10 },
    pathDescription: { fontSize: 15, color: '#666', lineHeight: 22, marginBottom: 16 },
    reasonContainer: { backgroundColor: '#f0f7ff', padding: 12, borderRadius: 8, marginBottom: 12 },
    reasonLabel: { fontSize: 13, fontWeight: '600', color: '#0066cc', marginBottom: 4 },
    reasonText: { fontSize: 14, color: '#1a1a1a', lineHeight: 20 },
    pathMeta: { flexDirection: 'row', gap: 10, marginBottom: 16 },
    levelBadge: { backgroundColor: '#e3f2fd', color: '#0066cc', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, fontSize: 13, fontWeight: '600' },
    categoryBadge: { backgroundColor: '#f5f5f5', color: '#666', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, fontSize: 13, fontWeight: '600' },
    actions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    addButton: { backgroundColor: '#0066cc', flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 10, gap: 8 },
    addButtonText: { fontSize: 15, fontWeight: 'bold', color: '#fff' },
});

export default AiPicks;