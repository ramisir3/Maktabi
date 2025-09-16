import {
    getUser, logoutUser
} from "./APIs";

export function storeTokenInLocalStorage(token) {
    localStorage.setItem('token', token);
}

export function getTokenFromLocalStorage() {
    return localStorage.getItem('token');
}

export function removeTokenFromLocalStorage() {
    return localStorage.removeItem('token');
}

export function storeAdminTokenInLocalStorage(token) {
    localStorage.setItem('maktabi_token', token);
}

export function getAdminTokenFromLocalStorage() {
    return localStorage.getItem('maktabi_token');
}

export function removeAdminTokenFromLocalStorage() {
    return localStorage.removeItem('maktabi_token');
}


export async function getAuthenticatedUser() {
    const defaultReturnObject = { authenticated: false, user: null };
    try {
        const token = getTokenFromLocalStorage();
        if (!token) {
            return defaultReturnObject;
        }
        const response = await getUser(token)
        let authenticated = false;
        if (response.data == 'Please Authenticate!') {
            authenticated = false;
        } else {
            authenticated = true;
        }
        console.log(authenticated)
        return authenticated ? { 'authenticated': authenticated, 'user': response.data } : { 'authenticated': false, 'user': null };
    }
    catch (err) {
        console.log('getAuthenticatedUser, Something Went Wrong', err);
        return defaultReturnObject;
    }
}

export async function getAuthenticatedAdmin() {
    const defaultReturnObject = { authenticated: false };
    try {
        const token = getAdminTokenFromLocalStorage();
        if (!token) {
            return defaultReturnObject;
        }
        return { 'authenticated': true };
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

export async function adminLogout(token) {
    if (token) {
        try {
            await logoutUser(token)
                .then((res) => {
                    removeAdminTokenFromLocalStorage();
                })
        } catch (err) {
            console.log(err)
        }
    };
}