import { Text } from "react-native";

export const MyText = ({ style, children }) => {
    return <Text style={{ ...style, }}>{children}</Text>
}