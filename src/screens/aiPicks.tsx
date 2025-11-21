import { useEffect, useState, useCallback } from "react";
import { useEventContext } from "../context/eventContext";
import { useScreenAlert } from "../utils/displayMessages";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppStackParamList, LearningPath, MainTabsParamList, SkillAssessmentItem, Status, UserProgress } from "../types";
import { getSkillAssessmentItems } from "../services/assessementService";
import { FirebaseError } from "@firebase/util";
import { getErrorMessage } from "../utils/errorMessages";
import { StyleSheet, View, Text, ScrollView, Image, Pressable, TouchableOpacity } from "react-native";
import FormButton from "../components/formButton";
import { CommonActions, useFocusEffect } from "@react-navigation/native";
import React from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { getAllLearningPaths } from "../services/learningPathService";
import LoadingScreen from "../components/loadingScreen";
import { v4 as uuidv4 } from 'uuid';
import { getAllFilteredUserProgresses, updateStatus } from "../services/userProgressService";

// 1. Custom Type to hold merged data (AI Reason + Database Path Details)
type EnrichedRecommendation = {
    id: string;
    reason: string;
    path: LearningPath;
    progress: UserProgress;
};

// Outer variables
// WARNING: Ideally move this key to a .env file or backend
const genAI = new GoogleGenerativeAI("AIzaSyDa4_XS3MknlIU99-mUVeKqjNrz7Tc8DTk");

const AiPicks = (props: NativeStackScreenProps<MainTabsParamList>) => {
    const { navigation } = props;
    const { loggedUser } = useEventContext();
    const screenAlert = useScreenAlert();

    const [assessmentItems, setAssessmentItems] = useState<SkillAssessmentItem[]>([]);
    // 2. Changed state to hold the Enriched Recommendation
    const [recommendations, setRecommendations] = useState<EnrichedRecommendation[]>([]);
    const [isLoading, setIsLoading] = useState(false);


    const navigateToCourseDetails = (id: string) => {
        navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [{ name: "CourseDetails", params: { learningPathId: id } }]
            }),
        );
    }

    const navigateToLearningPath = async (learningPath: LearningPath, progressStatus: Status) => {

        setIsLoading(true);
        try {
            if (progressStatus === Status.NotStarted) {
                if (loggedUser) {
                    const isSucceeded = await updateStatus(loggedUser.id, learningPath.id, Status.InProgress);
                    isSucceeded ? navigateToCourseDetails(learningPath.id) : screenAlert("Erro", "Erro ao se conectar com o servidor. por favor tente novamente mais tarde");
                }
                else {
                    navigateToLogin();
                }
            }
            navigateToCourseDetails(learningPath.id);
        }
        catch (error) {
            screenAlert(
                "Erro",
                error instanceof FirebaseError
                    ? getErrorMessage(error.code)
                    : `Erro ao se conectar com o servidor. por favor tente novamente mais tarde\n${error}`
            );
        }
        finally {
            setIsLoading(false);
        }
    }


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

            if (parsedData.recommendations && loggedUser) {
                const matchedRecommendations: EnrichedRecommendation[] = [];
                const currentProgresses: UserProgress[] = await getAllFilteredUserProgresses(loggedUser.id, currentPaths);

                // 4. MATCHING LOGIC: Join AI data with Local Data here, not in JSX
                parsedData.recommendations.forEach((rec: any) => {
                    // Find the full path object in the array we already have
                    const foundPath = currentPaths.find(path => path.id === rec.learningPathId);
                    const foundProgress = currentProgresses.find(progress => progress.learningPathId === rec.learningPathId);


                    if (foundPath && foundProgress) {
                        matchedRecommendations.push({
                            id: uuidv4(), // Safe random ID for RN
                            reason: rec.reason,
                            path: foundPath, // We embed the full object
                            progress: foundProgress,
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
            navigateToLogin();
        } finally {
            setIsLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadData();
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
                                        <TouchableOpacity
                                            // O estilo 'actionButton' agora é a nova base para o botão
                                            style={styles.actionButton}
                                            onPress={() => navigateToLearningPath(rec.path, rec.progress.status)}
                                        >
                                            {rec.progress && rec.progress.status !== Status.NotStarted ? (
                                                <View style={styles.progressContent}>
                                                    {/* 1. Estado 'In Progress' ou 'Completed' */}
                                                    {rec.progress.status !== Status.Completed ? (
                                                        <>
                                                            <View style={styles.progressIndicator}>
                                                                <View style={styles.progressBar}>
                                                                    <View
                                                                        style={[
                                                                            styles.progressFill,
                                                                            { width: `${rec.progress.progressPercentage}%` },
                                                                        ]}
                                                                    />
                                                                </View>
                                                                <Text style={styles.progressText}>
                                                                    {rec.progress.progressPercentage}% concluído
                                                                </Text>
                                                            </View>
                                                            <Text style={styles.continueButtonText}>Continuar</Text>
                                                        </>
                                                    ) : (
                                                        // 2. Estado 'Completed' (usando o estilo 'completedButton')
                                                        <View style={styles.completedButton}>
                                                            <Text style={styles.completedButtonText}>✅ Completed</Text>
                                                        </View>
                                                    )}
                                                </View>
                                            ) : (
                                                // 3. Estado 'Not Started' (usando o estilo 'addPathButtonText')
                                                <Text style={styles.addPathButtonText}>➕ Add to paths</Text>
                                            )}
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                </ScrollView >
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
    // Ajuste para o contêiner das ações - Agora o botão ocupa a largura total para mais destaque
    actions: {
        paddingTop: 10, // Adiciona um pequeno espaço antes do botão
    },

    // Estilo base para o botão de ação (Substitui 'addButton')
    actionButton: {
        width: '100%',
        backgroundColor: '#0066cc', // Cor primária para o botão
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 10,
        alignItems: 'center', // Centraliza o conteúdo (texto ou barra de progresso)
        justifyContent: 'center',
        // Adiciona uma pequena sombra para efeito 3D (Opcional)
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },

    // 3. Estilo para o texto no estado 'Not Started' (Substitui 'addButtonText')
    addPathButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },

    // 1. Contêiner para o conteúdo do progresso (barra + texto + botão 'Continuar')
    progressContent: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    // Contêiner para a barra de progresso e porcentagem
    progressIndicator: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        flex: 1, // Permite que a seção de progresso ocupe o espaço restante
        marginRight: 10,
    },

    // Estilo da barra de progresso
    progressBar: {
        width: '100%',
        height: 8, // Ligeiramente mais grossa
        backgroundColor: '#e0e0e0',
        borderRadius: 4,
        marginBottom: 4,
    },

    // Preenchimento da barra de progresso
    progressFill: {
        height: '100%',
        backgroundColor: '#00cc66', // Cor Verde para Progresso (contraste com o azul do botão)
        borderRadius: 4,
    },

    // Texto de porcentagem
    progressText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#fff', // Branco, pois está sobre o botão azul
    },

    // Texto para o botão 'Continuar'
    continueButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },

    // 2. Estado Concluído (Substitui 'startButton' e 'startButtonText')
    completedButton: {
        width: '100%',
        backgroundColor: '#00cc66', // Verde vibrante para Concluído
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    completedButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff', // Texto branco para contraste
    },
});

export default AiPicks;