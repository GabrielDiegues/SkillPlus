import { View, Text, ActivityIndicator, StyleSheet } from "react-native";

const LoadingScreen = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.logo}>SkillUp</Text>

            <ActivityIndicator size="large" color="#AD0177" style={styles.spinner} />

            <Text style={styles.loadingText}>Loading your experience...</Text>
        </View>
    )
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#ffffff",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 40,
    },

    logo: {
        fontSize: 42,
        fontWeight: "bold",
        color: "#AD0177",
        marginBottom: 30,
        letterSpacing: 1,
    },

    spinner: {
        marginBottom: 20,
    },

    loadingText: {
        fontSize: 16,
        color: "#555",
        textAlign: "center",
        marginTop: 10,
    },
});

export default LoadingScreen;