import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppStackParamList, LearningPath, Status } from "../types";
import { useEffect, useState } from "react";
import { getLearningPath } from "../services/learningPathService";
import { useScreenAlert } from "../utils/displayMessages";
import { FirebaseError } from '@firebase/util';
import { getErrorMessage } from "../utils/errorMessages";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import LoadingScreen from "../components/loadingScreen";
import FormButton from "../components/formButton";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEventContext } from "../context/eventContext";
import { updateProgressPercentage, updateStatus } from "../services/userProgressService";

const CourseDetails = (props: NativeStackScreenProps<AppStackParamList, "CourseDetails">) => {
    // Inner variables
    const { route, navigation } = props;
    const { learningPathId } = route.params;
    const { loggedUser } = useEventContext();
    const [learningPath, setLearningPath] = useState<LearningPath | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const screenAlert = useScreenAlert();

    // Inner functions
    const navigateToLogin = () => {
        screenAlert("error", "Erro ao carregar usuário. Por favor, faça login novamente");
        navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
        });
    };
    const loadData = async () => {
        setIsLoading(true);
        try {
            const path = await getLearningPath(learningPathId);
            if (path) setLearningPath(path);
        } catch (error) {
            screenAlert(
                "Erro",
                error instanceof FirebaseError
                    ? getErrorMessage(error.code)
                    : `Erro ao carregar conteúdo.\n${error}`
            );
        } finally {
            setIsLoading(false);
        }
    };


    const finishCourse = async () => {
        try {
            if (!loggedUser) {
                return navigateToLogin();
            }
            setIsLoading(true);
            const isUpdated = await updateStatus(loggedUser.id, learningPathId, Status.Completed) && await updateProgressPercentage(loggedUser.id, learningPathId, 100);
            if(isUpdated) {
                screenAlert("Course completed!", `Congratulations! You've completed the course ${learningPath?.title || ""}`);
                navigation.pop();
            } 
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

    // useEfffects
    useEffect(() => {
        loadData();
    }, []);

    if (isLoading) return <LoadingScreen />;

    if (!learningPath) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.notLoadedText}>Course not loaded</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            <ScrollView
                style={styles.screen}
                contentContainerStyle={{ paddingBottom: 140 }}
            >
                <View style={styles.headerSection}>
                    <Text style={styles.title}>{learningPath.title}</Text>
                    <Text style={styles.subtitle}>{learningPath.description}</Text>
                </View>

                <View style={styles.contentCard}>
                    <Text style={styles.contentText}>{learningPath.content}</Text>
                </View>
            </ScrollView>

            <View style={styles.bottomBar}>
                <View style={{ flex: 1, marginRight: 10 }}>
                    <FormButton
                        buttonTitle="Go back"
                        onPressFunction={() => navigation.pop()}
                    />
                </View>

                <View style={{ flex: 1, marginLeft: 10 }}>
                    <FormButton
                        buttonTitle="Finish course"
                        onPressFunction={() => finishCourse()}
                        disabled={isLoading}
                    />
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f9f9f9",
        paddingTop: 20,
    },

    screen: {
        flex: 1,
        paddingHorizontal: 20,
    },

    bottomBar: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        backgroundColor: "#fff",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderTopWidth: 1,
        borderTopColor: "#e3e3e3",
    },

    headerSection: {
        marginBottom: 20,
    },

    title: {
        fontSize: 26,
        fontWeight: "700",
        color: "#AD0177",
        marginBottom: 8,
    },

    subtitle: {
        fontSize: 16,
        color: "#555",
        lineHeight: 22,
    },

    contentCard: {
        backgroundColor: "#fff",
        padding: 18,
        borderRadius: 12,
        elevation: 2,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        marginBottom: 40,
    },

    contentText: {
        fontSize: 15,
        color: "#333",
        lineHeight: 22,
    },

    centerContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
    },

    notLoadedText: {
        fontSize: 18,
        color: "#AD0177",
        fontWeight: "600",
    },
});

export default CourseDetails;
