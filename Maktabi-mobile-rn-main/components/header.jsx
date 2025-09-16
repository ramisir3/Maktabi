import { faBars } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome"
import React from "react"
import { Colors } from "../Colors/colors"
import { Image, Pressable, View } from "react-native"
import { useNavigation } from "@react-navigation/native"

export const Header = () => {
    const navigation = useNavigation();
    return (<View style={{ paddingHorizontal: 20, backgroundColor: Colors.darkGreen, height: 90, alignItems: 'center', justifyContent: 'flex-start', flexDirection: 'row', }}>
        <Pressable
            style={{ marginRight: 60 }}
            onPress={() => { navigation.openDrawer() }}>
            <FontAwesomeIcon style={{ color: 'white' }} size={25} icon={faBars} />
        </Pressable>
        <Image source={require('../images/logo-no-background-white.png')} style={{ width: 200, height: 50, resizeMode: 'contain' }} />
    </View>)
}