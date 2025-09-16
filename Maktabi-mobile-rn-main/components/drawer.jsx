import * as React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Entypo, FontAwesome, Fontisto } from "@expo/vector-icons";
import { DrawerActions } from '@react-navigation/native'
import { Colors } from "../Colors/colors";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { userLogout } from "../APIs/common";
import { useUser } from "../APIs/customHooks";
import { useEffect } from "react";
import { useState } from "react";
import { getUserAvatarById } from "../APIs/API";

function DrawerSideBar() {

    const navigation = useNavigation();
    const { user, authenticated } = useUser()
    const [avatar, setAvatar] = useState(null)

    const logout = async () => {
        navigation.dispatch(DrawerActions.closeDrawer());
        await userLogout().then(result => {
            navigation.navigate('login');
        }
        ).catch(err => {
            console.log(err);
        })
    }
    return (
        user &&
        <View style={styles.container}>
            <View style={styles.imageNameContainer}>
                <Image source={require('../images/logo-no-background.png')} style={{ width: 200, height: 80, resizeMode: 'contain' }} />
                <Image
                    style={{
                        width: 150,
                        height: 150,
                        borderRadius: 150,
                        backgroundColor: "#fff",
                    }}
                    source={user.avatar ? { uri: user.avatar } : require("../images/user-stock.png")}
                />
                <Text style={{ margin: 20, fontSize: 30, color: Colors.darkGreen, fontWeight: 'bold' }}>{user.firstName + ' ' + user.lastName}</Text>
            </View>

            <View style={{ width: "100%" }}>
                <Pressable style={styles.drawerItem} onPress={() => { navigation.navigate('Home') }}>
                    <Text style={{ marginHorizontal: 20, fontWeight: 'bold' }}>Home</Text>
                    <Entypo name="home" size={24} color={Colors.darkGreen} />
                </Pressable>
                <Pressable style={styles.drawerItem} onPress={() => { navigation.navigate('myWorkspaces') }}>
                    <Text style={{ marginHorizontal: 20, fontWeight: 'bold' }}>My Workspaces</Text>
                    <Entypo name="laptop" size={24} color={Colors.darkGreen} />
                </Pressable>
                <Pressable style={styles.drawerItem} onPress={() => { navigation.navigate('browseWorkspaces') }}>
                    <Text style={{ marginHorizontal: 20, fontWeight: 'bold' }}>Browse Workspaces</Text>
                    <Entypo name="magnifying-glass" size={24} color={Colors.darkGreen} />
                </Pressable>
                <Pressable style={styles.drawerItem} onPress={() => { navigation.navigate('settings') }}>
                    <Text style={{ marginHorizontal: 20, fontWeight: 'bold' }}>Settings</Text>
                    <Entypo name="cog" size={24} color={Colors.darkGreen} />
                </Pressable>
                <Pressable style={styles.drawerItem} onPress={logout}>
                    <Text style={{ marginHorizontal: 20, fontWeight: 'bold' }}>Logout</Text>
                    <Entypo name="log-out" size={24} color={Colors.darkGreen} />
                </Pressable>

            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: "100%",
        flex: 1,
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: Colors.backgroundDarker,
    },
    imageNameContainer: {
        alignItems: "center",
        justifyContent: "center",
        // marginTop: 100,
        // backgroundColor:Colors.darkGreen,
        width: '100%'
    },
    drawerItem: {
        width: "95%",
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 10,
        margin: 5,
        borderRadius: 20,
    },
});
export default DrawerSideBar;