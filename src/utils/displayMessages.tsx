import { useEffect, useRef } from "react";
import { Alert } from "react-native";

const useScreenAlert = () => {
    const isMounted = useRef(true);

    useEffect(() => {
        return () => {
            isMounted.current = false;
        };
    }, []);


    const screenAlert = (title: string, description: string) => {
        if(isMounted) {
            Alert.alert(
                `${title}`,
                `${description}`,
                [
                    {text: 'close'},
                ],
                {cancelable: true}
            );
        }
    };
    return screenAlert;
};

export {useScreenAlert}