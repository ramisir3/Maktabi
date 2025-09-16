import { createNativeStackNavigator } from "@react-navigation/native-stack";
import BookPage from "./bookPage";
import MyWorkspaces from "./myWorkspaces";
import WorkspacecInfo from "./workspaceInfo";

export default function MyWorkspacesStack() {
    const Stack = createNativeStackNavigator();


    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
            }}
        >

            <Stack.Screen name="myworkspaces" component={MyWorkspaces} />
            <Stack.Screen name="workspaceinfo" component={WorkspacecInfo} />
            <Stack.Screen name="book" component={BookPage} />
        </Stack.Navigator>
    )
}