import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { Home } from '../pages/home'
import DrawerSideBar from "./drawer";
import PastBookings from "../pages/pastBookings";
import FutureBookings from "../pages/futureBookings";
import Settigns from "../pages/settings";
import MyWorkspacesStack from "../pages/myWorkpsacesStack";
import BrowseWorkspacesStack from "../pages/browseWorkspacesStack";


const DrawerNavigator = createDrawerNavigator();
const Stack = createNativeStackNavigator();

export const DrawerNavigation = () => {
    // const [user, setUser] = useState(null);

    // if (user) {
    return (
        <DrawerNavigator.Navigator
            drawerContent={() => {
                // if (user) {
                return <DrawerSideBar />;
                // } else {
                //     return null;
                // }
            }}
            screenOptions={{ drawerPosition: "left", headerShown: false }}
        >
            {/* <DrawerNavigator.Screen name="Home">
                    {(props) => <HomePage {...props} user={user} />}
                </DrawerNavigator.Screen>
                <DrawerNavigator.Screen name="MyWorkspaces" component={MapPage} />
                <DrawerNavigator.Screen name="BrowseWorkspaces">
                    {(props) => <ForumPage {...props} user={user} />}
                </DrawerNavigator.Screen>
                <DrawerNavigator.Screen name="Settings">
                    {(props) => <ChatList {...props} user={user} />}
                </DrawerNavigator.Screen> */}
            <DrawerNavigator.Screen name="Home">
                {(props) => <Home {...props} />}
            </DrawerNavigator.Screen>
            <DrawerNavigator.Screen name="pastBookings">
                {(props) => <PastBookings {...props} />}
            </DrawerNavigator.Screen>
            <DrawerNavigator.Screen name="futureBookings">
                {(props) => <FutureBookings {...props} />}
            </DrawerNavigator.Screen>
            <DrawerNavigator.Screen name="myWorkspaces">
                {(props) => <MyWorkspacesStack {...props} />}
            </DrawerNavigator.Screen>
            <DrawerNavigator.Screen name="browseWorkspaces">
                {(props) => <BrowseWorkspacesStack {...props} />}
            </DrawerNavigator.Screen>
            <DrawerNavigator.Screen name="settings">
                {(props) => <Settigns {...props} />}
            </DrawerNavigator.Screen>
        </DrawerNavigator.Navigator>
    );
    // } else {
    //     return null;
    // }
}