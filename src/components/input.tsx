import { View, Text, TextInput, StyleSheet, Dimensions } from "react-native";
import globalStyles from "../styles/globalStyles";
import { InputProps } from "../types";

const Input = ({ msg, userInput, onChangeText, title, hideEntry, spaceAbove }: InputProps) => {
  const { height } = Dimensions.get('window');

  return (
    <View style={[globalStyles.container, localStyles.fieldsContainer]}>
      <Text style={[globalStyles.label, { marginTop: height / spaceAbove }]}>{title}</Text>
      <TextInput
        style={globalStyles.input}
        onChangeText={onChangeText}
        value={userInput}
        placeholder={msg}
        placeholderTextColor={'#AD0177'}
        secureTextEntry={hideEntry}
      />
    </View>
  );
};

const localStyles = StyleSheet.create({
  fieldsContainer: {
    width: '85%',
  },
});

export default Input;