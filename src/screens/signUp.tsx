import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { AppStackParamList, SignUpUser, User } from "../types";
import { useScreenAlert } from "../utils/displayMessages";
import { useState } from "react";
import { FirebaseError } from '@firebase/util';
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import { getErrorMessage } from "../utils/errorMessages";
import globalStyles from "../styles/globalStyles";
import { updateUserProp } from "../utils/userUtil";
import Input from "../components/input";
import FormButton from "../components/formButton";
import { auth, database } from "../services/firebaseConfig";
import { ref, set } from "@firebase/database";

// Outter variables
const space = 20;

const SignUp = (props: NativeStackScreenProps<AppStackParamList>) => {
    // Inner variables
    const screenAlert = useScreenAlert();
    const { navigation } = props;
    const [user, setUser] = useState<SignUpUser>({
        name: "",
        email: "",
        password: "",
    });
    const [isLoading, setIsLoading] = useState(false);


    // Inner functions
    const navigateToLogin = () => {
        navigation.reset({
            index: 0,
            routes: [{name: 'Login'}],
        });
    };


    const createAccount = async () => {
        setIsLoading(true);
        const hasEmptyFields = Object.values(user).some(value => !value.trim());
        if (hasEmptyFields) {
            return screenAlert('Campos vazios', 'Por favor, preencha todos os campos');
        }
        try {
            const userInfo = await createUserWithEmailAndPassword(auth, user.email, user.password);
            if (!userInfo) {
                return screenAlert("Erro", "Erro ao se conectar com servidor. Por favor, tente novamente mais tarde");
            }
            const registeredUser: User = {
                id: userInfo.user.uid,
                name: user.name.trim(),
                profilePictureUrl: "",
                interests: null,
            };

            try {
                await set(ref(database, `/users/${userInfo.user.uid}`), registeredUser);
                
                screenAlert("Sucesso", "Conta criada com sucesso");
                navigateToLogin();
            } catch (dbError) {
                screenAlert(
                    "Erro",
                    dbError instanceof FirebaseError
                        ? getErrorMessage(dbError.code) 
                        : "Erro ao se conectar com o servidor. Por favor, tente novamente mais tarde"
                );
            }

        } catch (error) {
            screenAlert(
                "Erro",
                error instanceof FirebaseError
                    ? getErrorMessage(error.code)
                    : `Erro ao criar conta. Por favor, tente novamente mais tarde\n${error}`
            );
        }
        finally {
            setIsLoading(false);
        }
    };



    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={globalStyles.screenContainer}
        >
            <ScrollView contentContainerStyle={globalStyles.scrollContent}>
                {/* Header */}
                <View style={globalStyles.headerContainer}>
                    <Text style={globalStyles.titleText}>Create Account</Text>
                    <Text style={globalStyles.subtitleText}>
                        Start your learning journey today
                    </Text>
                </View>

                {/* Form */}
                <View style={globalStyles.formContainer}>
                    <View style={styles.inputWrapper}>
                        <Input
                            title="Full Name"
                            msg="João Pedro"
                            userInput={user.name}
                            onChangeText={(text: string) =>
                                setUser(updateUserProp("name", text))
                            }
                            spaceAbove={space}
                        />
                    </View>

                    <View style={styles.inputWrapper}>
                        <Input
                            title="Email"
                            msg="your.email@example.com"
                            userInput={user.email}
                            onChangeText={(text: string) =>
                                setUser(updateUserProp("email", text))
                            }
                            spaceAbove={space}
                        />
                    </View>

                    <View style={styles.inputWrapper}>
                        <Input
                            title="Password"
                            msg="At least 6 characters"
                            userInput={user.password}
                            onChangeText={(text: string) =>
                                setUser(updateUserProp("password", text))
                            }
                            spaceAbove={space}
                        />
                    </View>

                    <FormButton
                        buttonTitle={isLoading ? "Registering..." : "Register"}
                        onPressFunction={createAccount}
                        disabled={isLoading}
                    />

                    <View style={globalStyles.signupContainer}>
                        <Text style={globalStyles.secondaryText}>
                            Already have an account?
                        </Text>
                        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                            <Text style={globalStyles.linkTextBold}>Login</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    inputWrapper: {
        width: "100%",
        marginBottom: 10,
    },
});

export default SignUp;