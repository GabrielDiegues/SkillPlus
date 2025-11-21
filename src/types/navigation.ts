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


type CourseDetailsProps = {
    learningPathId: string;
}


type AppStackParamList = {
    Login: undefined;
    SignUp: undefined;
    MainTabs: MainTabsParamList;
    CourseDetails: CourseDetailsProps;
}


export type {AppStackParamList, MainTabsParamList}
