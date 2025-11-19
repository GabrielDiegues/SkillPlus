import { MainTabsParamList } from "./navigation";

type InputProps = {
    msg: string;
    title: string;
    userInput: string;
    onChangeText: (text: string) => void;
    spaceAbove: number;
    hideEntry?: boolean;
};


type FormButtonProps = {
    buttonTitle: string;
    onPressFunction: () => void;
    disabled?: boolean;
}
export type {InputProps, FormButtonProps}