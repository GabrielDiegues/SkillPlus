import { useEffect, useState } from "react";
import { AppStackParamList, Categories, LearningPath, Status, UserProgress } from "../types";
import { getAllLearningPaths } from "../services/learningPathService";
import { useEventContext } from "../context/eventContext";
import { useScreenAlert } from "../utils/displayMessages";
import { FirebaseError } from '@firebase/util';
import { getErrorMessage } from "../utils/errorMessages";
import { getAllFilteredUserProgresses, getUserProgress, updateStatus } from "../services/userProgressService";
import { View, Text, TextInput, ScrollView, StyleSheet, Pressable, Image, TouchableOpacity } from "react-native";
import LoadingScreen from "../components/loadingScreen";
import MainTabsHeader from "../components/headerStyles/mainTabsHeader";
import { Picker } from '@react-native-picker/picker';
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import React from "react";

const Paths = (props: NativeStackScreenProps<AppStackParamList>) => {
    const { navigation } = props;
    // Inner Variables
    const screenAlert = useScreenAlert();
    const { loggedUser, setLoggedUser } = useEventContext();
    const [paths, setPaths] = useState<LearningPath[]>([]);
    const [filteredPaths, setFilteredPaths] = useState<LearningPath[]>([]);
    const [userProgresses, setUserProgresses] = useState<UserProgress[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<Categories>(Categories.All);
    const [showFilters, setShowFilters] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Inner functions
    const navigateToLogin = () => {
        screenAlert("error", "Por favor, tente logar novamente");
        navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
        });
    };


    const navigateToLearningPath = async (learningPath: LearningPath, progressStatus: Status) => {

        setIsLoading(true);
        try {
            if (progressStatus === Status.NotStarted) {
                if (loggedUser) {
                    const isSucceeded = await updateStatus(loggedUser.id, learningPath.id, Status.InProgress);
                    isSucceeded ? navigation.navigate("CourseDetails", { learningPathId: learningPath.id }) : screenAlert("Erro", "Erro ao se conectar com o servidor. por favor tente novamente mais tarde");
                }
                else {
                    navigateToLogin();
                }
            }
            navigation.navigate("CourseDetails", { learningPathId: learningPath.id });
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
    const loadData = async () => {
        try {
            if (!loggedUser) {
                navigateToLogin();
                return;
            }
            setIsLoading(true);
            const allLearningPaths = await getAllLearningPaths();
            if (allLearningPaths) {
                setPaths(allLearningPaths);
                setFilteredPaths(allLearningPaths);
                const allUserProgresses = await getAllFilteredUserProgresses(loggedUser.id, filteredPaths);
                if (allUserProgresses) {
                    setUserProgresses(allUserProgresses);
                }
            }
        }
        catch (error) {
            screenAlert(
                "Erro",
                error instanceof FirebaseError
                    ? getErrorMessage(error.code)
                    : `Erro ao carregar cursos. Por favor, tente novamente mais tarde\n${error}`
            );
        }
        finally {
            setIsLoading(false);
        }
    }


    const filterPaths = async () => {
        if (loggedUser) {
            let filtered = paths.filter(
                (learningPath) => learningPath.title.toLowerCase().includes(searchQuery.toLowerCase())
            )
            if (selectedCategory !== "All") {
                filtered = filtered.filter((learningPath) => learningPath.category === selectedCategory);
            }
            setFilteredPaths(filtered);
            const allUserProgresses = await getAllFilteredUserProgresses(loggedUser.id, filteredPaths);
            setUserProgresses(allUserProgresses);
        }
    }
    // useEffects
    useFocusEffect(
        React.useCallback(() => {
            loadData();
        }, [])
    );


    useEffect(() => {
        filterPaths();
    }, [searchQuery, selectedCategory, paths])

    if (isLoading) {
        return (
            <LoadingScreen />
        )
    }
    return (
        <View style={styles.container}>
            <MainTabsHeader
                title="Learning Paths"
                subTitle="Explore courses designed for your growth"
            />

            <View style={styles.searchSection}>
                <View style={styles.searchContainer}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search courses..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>


            <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Category</Text>
                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={selectedCategory}
                        onValueChange={(value) => setSelectedCategory(value)}
                        style={styles.picker}
                    >
                        {Object.values(Categories).map((cat) => (
                            <Picker.Item key={cat} label={cat} value={cat} />
                        ))}
                    </Picker>
                </View>
            </View>


            <ScrollView style={styles.pathsList}>
                {
                    filteredPaths.map((path) => {
                        const progress = userProgresses.filter(userProgress => userProgress.learningPathId === path.id)[0];
                        return (
                            <TouchableOpacity
                                key={path.id}
                                style={styles.pathCard}
                                onPress={() => navigateToLearningPath(path, progress.status)}//handleStartPath(path)
                                disabled={isLoading}
                            >
                                <Image source={{ uri: path.imageUrl }} style={styles.pathImage} />
                                <View style={styles.pathContent}>
                                    <Text style={styles.pathTitle}>{path.title}</Text>
                                    <Text style={styles.pathDescription} numberOfLines={2}>
                                        {path.description}
                                    </Text>
                                    <View style={styles.pathMeta}>
                                        <Text style={styles.levelBadge}>{path.dificultyLevel}</Text>
                                        <Text style={styles.categoryBadge}>{path.category}</Text>
                                    </View>
                                    {progress && progress.status !== Status.NotStarted ? (
                                        <View style={styles.progressSection}>
                                            <View style={styles.progressBar}>
                                                <View
                                                    style={[
                                                        styles.progressFill,
                                                        { width: `${progress.progressPercentage}%` },
                                                    ]}
                                                />
                                            </View>
                                            <Text style={styles.progressText}>
                                                {progress.progressPercentage}% complete
                                            </Text>

                                            {progress && progress.status === Status.Completed &&
                                                <View style={styles.startButton}>
                                                    <Text style={styles.startButtonText}>Completed</Text>
                                                </View>
                                            }
                                        </View>
                                    ) : (
                                        <View style={styles.startButton}>
                                            <Text style={styles.startButtonText}>Start</Text>
                                        </View>
                                    )}
                                </View>
                            </TouchableOpacity>
                        );
                    })}
            </ScrollView>
        </View>
    )
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        backgroundColor: '#0066cc',
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
    },
    headerSubtitle: {
        fontSize: 15,
        color: '#b3d9ff',
        marginTop: 5,
    },
    searchSection: {
        flexDirection: 'row',
        padding: 15,
        gap: 10,
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 15,
        borderRadius: 10,
        gap: 10,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 16,
    },
    filterButton: {
        backgroundColor: '#fff',
        width: 48,
        height: 48,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    filterSection: {
        backgroundColor: '#fff',
        marginHorizontal: 15,
        marginBottom: 15,
        padding: 15,
        borderRadius: 10,
    },
    filterLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 8,
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
    },
    picker: {
        height: 50,
    },
    pathsList: {
        flex: 1,
        paddingHorizontal: 15,
    },
    pathCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 15,
        overflow: 'hidden',
    },
    pathImage: {
        width: '100%',
        height: 160,
    },
    pathContent: {
        padding: 15,
    },
    pathTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1a1a1a',
        marginBottom: 8,
    },
    pathDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 12,
        lineHeight: 20,
    },
    pathMeta: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 12,
    },
    levelBadge: {
        backgroundColor: '#e3f2fd',
        color: '#0066cc',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
        fontSize: 12,
        fontWeight: '600',
    },
    categoryBadge: {
        backgroundColor: '#f5f5f5',
        color: '#666',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
        fontSize: 12,
        fontWeight: '600',
    },
    progressSection: {
        marginTop: 8,
    },
    progressBar: {
        height: 6,
        backgroundColor: '#e0e0e0',
        borderRadius: 3,
        marginBottom: 6,
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#0066cc',
        borderRadius: 3,
    },
    progressText: {
        fontSize: 12,
        color: '#666',
    },
    startButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        marginTop: 8,
    },
    startButtonText: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#AD0177',
    },
});

export default Paths;