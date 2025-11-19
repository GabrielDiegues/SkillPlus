import { NavigatorScreenParams } from "@react-navigation/native";

type MainTabsParamList = {
    Home: undefined;
    Paths: undefined;
    Progress: undefined;
    AiPicks: undefined;
    Profile: undefined;
    Assessment: undefined;
}


type MainTabsProps = {
    params: NavigatorScreenParams<MainTabsParamList>;
}


type AppStackParamList = {
    Login: undefined;
    SignUp: undefined;
    Home: MainTabsParamList;
}


export type {AppStackParamList, MainTabsParamList}