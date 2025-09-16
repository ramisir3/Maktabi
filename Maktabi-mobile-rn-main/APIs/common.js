import AsyncStorage from "@react-native-async-storage/async-storage";
import { getUser, getUserAvatarById, logoutUser } from "./API";

export async function storeTokenInLocalStorage(token) {
    AsyncStorage.setItem('token', token);
}

export async function getTokenFromLocalStorage() {
    return AsyncStorage.getItem('token');
}

export async function removeTokenFromLocalStorage() {
    return AsyncStorage.removeItem('token');
}

export async function getAuthenticatedUser() {
    const defaultReturnObject = { authenticated: false, user: null };
    try {
        const token = await getTokenFromLocalStorage();
        if (!token) {
            return defaultReturnObject;
        }
        const response = await getUser(token)
        let authenticated = false;
        if (response.data == 'Please Authenticate!') {
            authenticated = false;
        } else {
            authenticated = true;
            await getUserAvatarById(response.data._id).then((avatar) => {
                if (avatar.data.size > 0) {
                    let base64data;
                    const fileReaderInstance = new FileReader();
                    fileReaderInstance.readAsDataURL(avatar.data);
                    fileReaderInstance.onload = () => {
                        base64data = fileReaderInstance.result;
                        response.data.avatar = base64data
                    }
                }
            })
        }
        return authenticated ? { 'authenticated': authenticated, 'user': response.data } : { 'authenticated': false, 'user': null };
    }
    catch (err) {
        console.log('getAuthenticatedUser, Something Went Wrong', err);
        return defaultReturnObject;
    }
}

export async function userLogout(token) {
    if (token) {
        try {
            await logoutUser(token)
                .then((res) => {
                    removeTokenFromLocalStorage();
                })
        } catch (err) {
            console.log(err)
        }
    };
}