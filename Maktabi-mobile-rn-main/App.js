import { SignUp } from './pages/signup'
import { Login } from './pages/login'
import { DrawerNavigation } from './components/drawerNavigator'
import { StatusBar } from "expo-status-bar";
import { Colors } from "./Colors/colors.js";
import { DefaultTheme, NavigationContainer, useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createContext, useEffect, useState } from "react";
import { Toast } from "react-native-toast-message/lib/src/Toast";
import { BaseToast } from "react-native-toast-message";
import { LogBox } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useRef } from 'react';

const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: Colors.background,
  },
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

async function registerForPushNotificationsAsync() {
  let token;
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log(token);
  } else {
    alert('Must use physical device for Push Notifications');
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return token;
}


const toastconfig = {
  success: (props) => <BaseToast {...props} style={{ borderLeftColor: Colors.darkGreen }} />,
  error: (props) => <BaseToast {...props} style={{ borderLeftColor: 'red' }} />,
};

const Stack = createNativeStackNavigator();
export const AuthContext = createContext();
LogBox.ignoreAllLogs()

export default function App() {
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => setExpoPushToken(token));

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  return (
    <>
      <StatusBar style="auto" hidden animated translucent />

      <NavigationContainer theme={MyTheme}>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="login" component={Login} />
          <Stack.Screen name="drawer" component={DrawerNavigation} />
          <Stack.Screen name="signup" component={SignUp} />

        </Stack.Navigator>
      </NavigationContainer>
      <Toast config={toastconfig} />
    </>
  );
}
