import React from "react";
import { Header } from "../components/header";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useState } from "react";
import { Colors } from "../Colors/colors";
import Carousel from 'react-native-swipeable-carousel';
import { subscribeUserToWorkspace, unsubscribeUserFromWorkspace } from "../APIs/API";
import { useUser } from "../APIs/customHooks";
import { Toast } from "react-native-toast-message/lib/src/Toast"
import * as Updates from 'expo-updates';



export default function WorkspacecInfo({ route, navigation }) {
    const { user, authenticated } = useUser()
    const { isSubscribed, workspace } = route.params

    async function subscribe() {
        try {
            await subscribeUserToWorkspace(user._id, workspace._id).then((res) => {
                Toast.show({
                    type: 'success',
                    text1: 'Subscribed to workspace' + workspace.name
                })
            })
        } catch (err) {
            Toast.show({
                type: 'error',
                text1: 'someting went wrong ' + err
            })
        }
    }

    async function unsubscribe() {
        try {
            await unsubscribeUserFromWorkspace(user._id, workspace._id).then((res) => {
                Toast.show({
                    type: 'success',
                    text1: 'Unsubscribed from workspace ' + workspace.name
                })
            })
        } catch (err) {
            Toast.show({
                type: 'error',
                text1: '' + err
            })
        }
    }
    return (
        workspace &&
        <>
            <Header></Header>
            <ScrollView style={{ margin: 15 }}>
                <View style={{ alignItems: 'center', marginBottom: 10 }}>
                    <Image
                        style={{
                            width: '100%',
                            height: 200,
                            borderRadius: 10,
                            backgroundColor: "#fff",
                            flexShrink: 0
                        }}
                        source={workspace.avatar ? { uri: 'data:image/png;base64,' + workspace.avatar } : require("../images/moscow-russia-january-sdeskStock.jpg")}>
                    </Image>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 20 }}>
                    <Text style={{ marginTop: 10, color: Colors.darkGreen, fontSize: 30, fontWeight: 'bold' }}>{workspace.name}</Text>
                    <TouchableOpacity style={{ backgroundColor: Colors.lightGreen, padding: 15, borderRadius: 10 }}
                        onPress={() => {
                            if (isSubscribed) {
                                unsubscribe()
                            } else {
                                subscribe()
                            }
                        }}
                    >
                        <Text style={{ color: 'white' }}>
                            {isSubscribed ? 'Unsubscribe' : 'Subscribe'}
                        </Text>
                    </TouchableOpacity>
                </View>
                <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                    <Text style={{ fontSize: 16, fontWeight: 'bold', marginRight: 10 }}>City:</Text>
                    <Text style={{ fontSize: 16 }}>{workspace.location.city}</Text>
                </View>
                <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                    <Text style={{ fontSize: 16, fontWeight: 'bold', marginRight: 10 }}>Address:</Text>
                    <Text style={{ fontSize: 16 }}>{workspace.location.address}</Text>
                </View>
                <Text>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Pulvinar neque laoreet suspendisse interdum consectetur libero. Varius duis at consectetur lorem donec massa sapien. Vulputate odio ut enim blandit volutpat maecenas volutpat blandit aliquam. Tincidunt augue interdum velit euismod in pellentesque massa. Elit pellentesque habitant morbi tristique senectus et netus et. Viverra aliquet eget sit amet tellus cras adipiscing enim eu. Lectus vestibulum mattis ullamcorper velit. Duis at tellus at urna condimentum. In pellentesque massa placerat duis. Egestas egestas fringilla phasellus faucibus scelerisque. Amet cursus
                </Text>
                <View style={{ marginTop: 20 }}>
                    <Carousel
                        images={images}
                        enableGestureSwipe={true}
                    />
                </View>
            </ScrollView >
        </>
    )
}

const images = [
    require('../images/stock-ws-image-1.jpg'),
    require('../images/stock-ws-image-2.jpg')
]