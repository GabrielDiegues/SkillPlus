import { View, Text, StyleSheet } from "react-native";

type MainTabsHeaderProps = {
    title: string
    subTitle: string
} 
const MainTabsHeader = ({title, subTitle}: MainTabsHeaderProps) => {
    return (
        <View style={styles.header}>
            <Text style={styles.greeting}>{title}</Text>
            <Text style={styles.subGreeting}>{subTitle}</Text>
        </View>
    )
}


const styles = StyleSheet.create({
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
})

export default MainTabsHeader;