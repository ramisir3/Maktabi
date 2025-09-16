import React from "react"
import { useEffect } from "react"
import { useState } from "react"
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { Header } from "../components/header"
import { Colors } from "../Colors/colors"
import { TextInput } from "react-native"
import { useNavigation } from "@react-navigation/native";
import { useUser } from "../APIs/customHooks"
import { getUser, getWorkspaceAvatarById, searchUserWorkspaces } from "../APIs/API"
import { getTokenFromLocalStorage } from "../APIs/common"


export default function MyWorkspaces({ navigation }) {
    const { user, authenticated } = useUser()
    const [currentUser, setCurrentUser] = useState({})
    const [registeredWorkspaces, setRegisteredWorkspaces] = useState([])
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
        if (user) {
            setCurrentUser(user)
            setLists(user.workspaces)
        }
    }, [user])

    useEffect(() => {
        async function updateList() {
            let ws = currentUser.workspaces;
            for (let i in ws) {
                ws[i].key = ws[i]._id
                await getWorkspaceAvatarById(ws[i]._id).then((ws_avatar) => {
                    if (ws_avatar.data.size > 0) {
                        res.data[i].avatar = ws_avatar.data
                    }
                })
            }
            setLists(ws)
        }
        if (user && currentUser) {
            updateList()
        }
    }, [currentUser])

    function setLists(ws) {
        setRegisteredWorkspaces(ws)
        setFilteredWorkspacesList(ws)
    }

    async function search() {
        try {
            if (searchText == '') {
                setFilteredWorkspacesList(registeredWorkspaces)
            } else {
                await searchUserWorkspaces(user._id, searchText).then(async (res) => {
                    for (let i in res.data) {
                        res.data[i].key = res.data[i]._id
                        await getWorkspaceAvatarById(res.data[i]._id).then(async (ws_avatar) => {
                            if (ws_avatar.data.size > 0) {
                                res.data[i].avatar = ws_avatar.data
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

    return (user &&
        <>
            <Header></Header>
            <View style={{ alignItems: 'center', marginTop: 10 }}><Text style={{ fontSize: 30, color: Colors.darkGreen, fontWeight: 'bold' }}>My Workspaces</Text></View>
            {filteredWorkspacesList && filteredWorkspacesList.length > 0 &&
                <>
                    <TextInput
                        style={styles.input}
                        value={searchText}
                        placeholder="Search for workspace"
                        onChangeText={(e) => { setSearchText(e) }}
                    />
                    <FlatList
                        data={filteredWorkspacesList}
                        renderItem={({ item }) =>
                            <TouchableOpacity onPress={() => { navigation.navigate('workspaceinfo', { isSubscribed: true, workspace: item }) }}>
                                <View style={{
                                    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingRight: 20, height: 80,
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
                                            flexShrink: 0
                                        }}
                                        source={item.avatar ? {
                                            uri: 'data:image/png;base64,' + item.avatar
                                        } : require("../images/moscow-russia-january-sdeskStock.jpg")}
                                    />
                                    <Text>{item.name}</Text>
                                    <TouchableOpacity style={{ flexShrink: 0, backgroundColor: Colors.lightGreen, padding: 10, borderRadius: 10 }} onPress={() => { navigation.navigate('book', { workspace: item, user: user }) }}>
                                        <Text style={{ color: 'white', fontWeight: 'bold' }}>Book</Text>
                                    </TouchableOpacity>
                                </View>
                            </TouchableOpacity>}
                        keyExtractor={item => item.id}>
                    </FlatList>
                </>
            }
            {(!registeredWorkspaces || registeredWorkspaces.length == 0) &&
                <View>
                    <Text style={{ textAlign: 'center' }}>
                        No workpsaces
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

// const ws = [
//     {
//         id: 'kl434l23n41234n2342',
//         name: 'Workspace 1',
//         image: '',
//     },
//     {
//         id: 'kl434l23n4fsdfs34n2342',
//         name: 'Workspace 2',
//         image: '',
//     },
//     {
//         id: 'kl434l23n412dfsdfwer42',
//         name: 'Workspace 3',
//         image: '',
//     },
//     {
//         id: 'kl434l23sdfsfn41234nfs42',
//         name: 'Workspace 4',
//         image: '',
//     },
//     {
//         id: 'kl434l23n41gdf23faf4n2342',
//         name: 'Workspace 1',
//         image: '',
//     },
//     {
//         id: 'kl434l23n4dfgdfg1234n2342',
//         name: 'Workspace 2',
//         image: '',
//     },
//     {
//         id: 'kl434l23ngdfgd412wer42',
//         name: 'Workspace 3',
//         image: '',
//     },
//     {
//         id: 'kl434l23rwernrw41234nfs42',
//         name: 'Workspace 4',
//         image: '',
//     }
// ]