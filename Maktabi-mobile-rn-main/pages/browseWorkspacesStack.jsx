import { createNativeStackNavigator } from "@react-navigation/native-stack";
import WorkspacecInfo from "./workspaceInfo";
import BrowseWorkspaces from "./browseWorkspaces";

export default function BrowseWorkspacesStack() {
    const Stack = createNativeStackNavigator();


    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
            }}
        >

            <Stack.Screen name="browseworkspaces" component={BrowseWorkspaces} />
            <Stack.Screen name="workspaceinfo" component={WorkspacecInfo} />
        </Stack.Navigator>
    )
}