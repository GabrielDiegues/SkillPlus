import { ScrollView, StyleSheet, View, Text } from "react-native";
import FormButton from "../components/formButton";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { MainTabsParamList } from "../types";
import { useEventContext } from "../context/eventContext";
import MainTabsHeader from "../components/headerStyles/mainTabsHeader";

const Home = (props: NativeStackScreenProps<MainTabsParamList>) => {
    // Inner variables
    const { navigation } = props;
    const { loggedUser } = useEventContext();

    // Inner functions
    const navigateToAiPicks = () => {
        return navigation.reset({
            index: 0,
            routes: [{ name: 'AiPicks' }],
        });
    };


    const navigateToAssessment = () => {
        return navigation.reset({
            index: 0,
            routes: [{ name: 'Assessment' }],
        });
    };


    return (
        <ScrollView
            style={styles.container}
        >
            {/* HEADER SECTION */}
            <MainTabsHeader
                title={`Hello, ${loggedUser?.name || 'Learner'}!`}
                subTitle="Ready to upskill today?"
            />

            {/* ACTIONS */}
            <View style={styles.actionsWrapper}>
                <Text style={styles.sectionTitle}>Quick Actions</Text>

                <View style={styles.buttonGroup}>
                    <FormButton
                        buttonTitle="Get AI Recommendations"
                        onPressFunction={navigateToAiPicks}
                    />
                    <FormButton
                        buttonTitle="Take Skills Assessment"
                        onPressFunction={navigateToAssessment}
                    />
                </View>
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        padding: 20,
        paddingTop: 60,
        backgroundColor: '#0066cc',
    },
    greeting: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
    },
    subGreeting: {
        fontSize: 16,
        color: '#b3d9ff',
        marginTop: 5,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1a1a1a',
    },
    actionsWrapper: {
        alignItems: "center",
    },
    scrollContent: {
        flexGrow: 1,
        padding: 20,
        paddingTop: 40,
    },
    buttonGroup: {
        width: "100%",
        maxWidth: 350,
        gap: 16,
        alignItems: "center",
    }
});

export default Home;