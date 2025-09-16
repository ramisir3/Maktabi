import React from "react"
import { useEffect } from "react"
import { useState } from "react"
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { Header } from "../components/header"
import { Colors } from "../Colors/colors"
import { TextInput } from "react-native"
import { useNavigation } from "@react-navigation/native";
import { useUser } from "../APIs/customHooks"
import { getAllPublicWorkspaces, getUser, getWorkspaceAvatarById, searchPublicWorkspaces, searchPublicWorkspacesByNameAndCity, subscribeUserToWorkspace, unsubscribeUserFromWorkspace } from "../APIs/API"
import { Toast } from "react-native-toast-message/lib/src/Toast"
import * as Updates from 'expo-updates';
import { getTokenFromLocalStorage } from "../APIs/common"


export default function BrowseWorkspaces({ navigation }) {
    const { user, authenticated } = useUser()
    const [currentUser, setCurrentUser] = useState({})
    const [registeredWorkspaces, setRegisteredWorkspaces] = useState(null)
    const [searchText, setSearchText] = useState('')
    const [filteredWorkspacesList, setFilteredWorkspacesList] = useState([])


    useEffect(() => {
        async function updateUser() {
            let token = await getTokenFromLocalStorage()
            await getUser(token).then((res) => {
                setCurrentUser(res.data)
            })
        }
        const focusHandler = navigation.addListener('focus', () => {
            console.log('refresehed')
            updateUser()
        });
        return focusHandler;
    }, [navigation]);

    useEffect(() => {
        setCurrentUser(user)
    }, [user])

    useEffect(() => {
        if (user && currentUser) {
            loadWorkspaces()
        }
    }, [currentUser])

    async function loadWorkspaces() {
        await getAllPublicWorkspaces().then((res) => {
            let reg_ws = res.data.filter((ws) => {
                let isNotReg = false;
                for (let i in currentUser.workspaces) {
                    if (currentUser.workspaces[i]._id == ws._id) {
                        currentUser.workspaces[i].key = currentUser.workspaces[i]._id
                        isNotReg = true;
                    }
                }
                return !isNotReg
            })
            setRegisteredWorkspaces(reg_ws)
            setFilteredWorkspacesList(reg_ws)
        })
    }



    async function search() {
        try {
            if (searchText == '') {
                setFilteredWorkspacesList(currentUser.workspaces)
            } else {
                await searchPublicWorkspacesByNameAndCity(user._id, searchText).then(async (res) => {
                    for (let i in res.data) {
                        await getWorkspaceAvatarById(res.data[i]._id).then((ws_avatar) => {
                            if (ws_avatar.data.size > 0) {
                                res.data[i].avatar = ws_avatar.data
                                res.data[i].key = res.data[i]._id
                            }
                        })
                    }
                    setFilteredWorkspacesList(res.data)
                })
            }
        } catch (err) {
            console.log(err)
        }
    }

    useEffect(() => {
        search()
    }, [searchText])

    return (
        <>
            <Header></Header>
            <View style={{ alignItems: 'center', marginTop: 10 }}><Text style={{ fontSize: 30, color: Colors.darkGreen, fontWeight: 'bold' }}>Browse Workspaces</Text></View>
            {registeredWorkspaces && registeredWorkspaces.length > 0 &&
                <>
                    <TextInput
                        style={styles.input}
                        value={searchText}
                        placeholder="Search for workspace"
                        onChangeText={setSearchText}
                    />
                    <FlatList
                        data={registeredWorkspaces}
                        renderItem={({ item }) =>
                            <TouchableOpacity onPress={() => { navigation.navigate('workspaceinfo', { isSubscribed: false, workspace: item }) }}>
                                <View style={{
                                    flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', paddingRight: 20, height: 80,
                                    borderWidth: 2, borderColor: Colors.darkGreen, borderRadius: 12, marginHorizontal: 20, marginVertical: 10
                                }}>
                                    <Image
                                        style={{
                                            width: 76,
                                            height: 76,
                                            borderRadius: 10,
                                            borderTopRightRadius: 0,
                                            borderBottomRightRadius: 0,
                                            backgroundColor: "#fff",
                                            flexShrink: 0,
                                            marginRight: 10
                                        }}
                                        source={item.avatar ? {
                                            uri: 'data:image/png;base64,' + item.avatar
                                        } : require("../images/moscow-russia-january-sdeskStock.jpg")}
                                    />
                                    <Text>{item.name}</Text>
                                </View>
                            </TouchableOpacity>}
                        keyExtractor={item => item.id}>
                    </FlatList>

                </>
            }
            {(registeredWorkspaces && registeredWorkspaces.length == 0) &&
                <View>
                    <Text style={{ textAlign: 'center' }}>
                        No workpsaces
                    </Text>
                </View>}
            {(!registeredWorkspaces) &&
                <View>
                    <Text style={{ textAlign: 'center' }}>
                        Loading...
                    </Text>
                </View>}
        </>
    )
}

const styles = StyleSheet.create({
    input: {
        height: 40,
        borderWidth: 1,
        padding: 10,
        borderRadius: 6,
        borderColor: Colors.darkGreen,
        color: Colors.darkGreen,
        margin: 20
    },
});
