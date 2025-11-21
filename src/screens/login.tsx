import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppStackParamList, SignInUser } from "../types";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View, Text, TouchableOpacity } from "react-native";
import globalStyles from "../styles/globalStyles";
import Input from "../components/input";
import { updateUserProp } from "../utils/userUtil";
import FormButton from "../components/formButton";
import { useScreenAlert } from "../utils/displayMessages";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, database } from "../services/firebaseConfig";
import { useEventContext } from "../context/eventContext";
import { get, ref } from "@firebase/database";
import { getUser } from "../services/userService";
import { FirebaseError } from "@firebase/util";
import { getErrorMessage } from "../utils/errorMessages";

const space = 20


const Login = (props: NativeStackScreenProps<AppStackParamList>) => {
  // Inner variables
  const { setLoggedUser } = useEventContext();
  const screenAlert = useScreenAlert();
  const [isLogin, setIsLogin] = useState(false);
  const { navigation } = props;

  const [user, setUser] = useState<SignInUser>({
    email: "",
    password: "",
  });


  // Inner functions
  const navigateToHome = () => {
    return navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs' }],
    });
  };


  const test = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, "3@gmail.com", "123456");
      const uid = userCredential.user.uid;
      const storedUser = await getUser(uid);
      if (storedUser) {
        setLoggedUser(storedUser);
        console.log(storedUser);
        navigateToHome();
      }
    }
    catch (error) {
      screenAlert(
        "Erro",
        error instanceof FirebaseError
          ? getErrorMessage(error.code)
          : `Erro ao logar. Por favor, tente novamente mais tarde\n${error}`
      );
    }
  }

  const checkLogin = async () => {
    setIsLogin(true);
    const hasEmptyFields = Object.values(user).some(value => !value.trim());
    if (hasEmptyFields) {
      return screenAlert('Campos vazios', 'Por favor, preencha todos os campos');
    }
    try {
      const userCredential = await signInWithEmailAndPassword(auth, user.email, user.password);
      const uid = userCredential.user.uid;
      const storedUser = await getUser(uid);
      if (storedUser) {
        setLoggedUser(storedUser);
        console.log(storedUser);
        navigateToHome();
      }
    }
    catch (error) {
      screenAlert(
        "Erro",
        error instanceof FirebaseError
          ? getErrorMessage(error.code)
          : `Erro ao logar. Por favor, tente novamente mais tarde\n${error}`
      );
    }
    finally {
      setIsLogin(false);
    }
  };


  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={globalStyles.screenContainer}
    >
      <ScrollView contentContainerStyle={globalStyles.scrollContent}>
        <View style={globalStyles.headerContainer}>
          <Text style={globalStyles.titleText}>Welcome Back</Text>
          <Text style={globalStyles.subtitleText}>
            Sign in to continue your learning journey
          </Text>
        </View>

        <View style={globalStyles.formContainer}>
          <Input
            title="Email"
            msg="your.email@example.com"
            userInput={user.email}
            onChangeText={(text: string) =>
              setUser(updateUserProp("email", text))
            }
            spaceAbove={space}
          />

          <Input
            title="Password"
            msg="Enter your password"
            userInput={user.password}
            onChangeText={(text: string) =>
              setUser(updateUserProp("password", text))
            }
            spaceAbove={space}
            hideEntry={true}
          />

          <FormButton
            buttonTitle={isLogin ? "Logging in..." : "Login"}
            onPressFunction={checkLogin}
            disabled={isLogin}
          />

          <TouchableOpacity style={globalStyles.centeredText}>
            <Text style={globalStyles.linkText}>Forgot Password?</Text>
          </TouchableOpacity>

          <View style={globalStyles.signupContainer}>
            <Text style={globalStyles.secondaryText}>
              Don&apos;t have an account?
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
              <Text style={globalStyles.linkTextBold}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Login;