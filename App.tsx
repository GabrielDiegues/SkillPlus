import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AppStackParamList } from "./src/types";
import { EventProvider } from "./src/context/eventContext";
import { NavigationContainer } from "@react-navigation/native";
import Login from "./src/screens/login";
import SignUp from "./src/screens/signUp";
import Tabs from "./src/navigation/tabs";

const Stack = createNativeStackNavigator<AppStackParamList>();

const App = () => {
  return (
    <EventProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="Login"
            component={Login}
            options={{
              headerShown: false,
            }}
          />

          <Stack.Screen
            name="SignUp"
            component={SignUp}
            options={{
              headerShown: false,
            }}
          />

          <Stack.Screen
            name="Home"
            component={Tabs}
            options={{
              headerShown: false,
            }} 
          />
        </Stack.Navigator>
      </NavigationContainer>
    </EventProvider>
  )
}

export default App;