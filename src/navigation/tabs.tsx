import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MainTabsParamList } from "../types";
import Home from "../screens/home";
import Paths from "../screens/paths";

const Tab = createBottomTabNavigator<MainTabsParamList>();

const Tabs = () => {
    return (
        <Tab.Navigator>
            <Tab.Screen
                name="Home"
                component={Home}
                options={{
                    headerShown: false,
                }}
            />
            <Tab.Screen
                name="Paths"
                component={Paths}
                options={{
                    headerShown: false,
                }}
            />
        </Tab.Navigator>
    )
}

export default Tabs;