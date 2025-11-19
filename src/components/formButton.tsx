import { TouchableOpacity, Text } from "react-native";
import { FormButtonProps } from "../types";
import globalStyles from "../styles/globalStyles";

const FormButton = ({buttonTitle, onPressFunction, disabled}: FormButtonProps) => {
    return (
        <TouchableOpacity 
            style={globalStyles.buttonContainer} 
            onPress={onPressFunction}
            disabled={disabled}
            >
            <Text style={globalStyles.buttonText}>{buttonTitle}</Text>
        </TouchableOpacity>
    );
};

export default FormButton;