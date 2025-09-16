import axios from "axios";
import { API_ROUTES } from "./ApiConst";


export async function getUser(token) {
    return await axios({
        method: 'GET',
        url: API_ROUTES.GET_USER,
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};

export async function getDeskInfo(id) {
    return await axios({
        method: 'GET',
        url: API_ROUTES.DESKS + "/" + id,
    });
};


export async function getWSDesks(id) {
    return await axios({
        method: 'GET',
        url: API_ROUTES.DESKS + "/workspaceId/" + id,
    });
};

export async function login(email, password) {
    return await axios({
        method: 'post',
        url: API_ROUTES.SIGN_IN,
        data: {
            email,
            password
        }
    });
}


export async function getDeskBookings(deskId) {
    return await axios({
        method: 'get',
        url: API_ROUTES.BOOKINGS + '/deskId/' + deskId
    })
}

export async function logoutUser(token) {
    return await axios({
        method: 'POST',
        url: API_ROUTES.USER_LOGOUT,
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};

export async function userSignUp(firstName, lastName, email, password, userType, phone) {
    return await axios({
        method: 'post',
        url: API_ROUTES.SIGN_UP,
        data: {
            firstName,
            lastName,
            email,
            password,
            role: 'basic',
            phone: phone
        }
    });
};

export async function updateAvatar(token, data) {
    return await axios.post(API_ROUTES.UPDATE_AVATAR, data, {
        headers: {
            'accept': 'application/json',
            'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
            'Authorization': `Bearer ${token}`
        }
    })
};

export async function getUsersById(id) {
    return await axios({
        method: 'GET',
        url: API_ROUTES.USERS_ID + '/' + id
    });
}

export async function bookDesk(data) {
    return await axios.post(API_ROUTES.BOOKINGS, data)
};

export async function getWorkspaceById(id) {
    return await axios.get(API_ROUTES.WORKSPACE + '/' + id)
}


export async function getUserBookings(userId) {
    return await axios({
        method: 'get',
        url: API_ROUTES.BOOKINGS + '/userId/' + userId
    })
}


export async function deleteBookingsById(id) {
    return await axios({
        method: 'delete',
        url: API_ROUTES.BOOKINGS + '/' + id
    })
}


export async function searchUserWorkspaces(userId, name) {
    return await axios({
        method: 'get',
        url: API_ROUTES.USERS + '/' + userId + '/workspaces/' + name
    })
}

export async function getWorkspaceAvatarById(id) {
    return await axios({
        method: 'GET',
        url: API_ROUTES.WORKSPACE + '/avatar/' + id,
        responseType: 'blob'
    });
}


export async function getUserAvatarById(id) {
    return await axios({
        method: 'GET',
        url: API_ROUTES.USERS + '/' + id + '/avatar',
        responseType: 'blob'
    });
}


export async function searchPublicWorkspacesByNameAndCity(text) {
    return await axios({
        method: 'get',
        url: API_ROUTES.WORKSPACE + '/name_city/' + text
    })
}

export async function getAllPublicWorkspaces(text) {
    return await axios({
        method: 'get',
        url: API_ROUTES.WORKSPACE + '/public/all'
    })
}

export async function unsubscribeUserFromWorkspace(userId, workspaceId) {
    return await axios({
        method: 'delete',
        url: API_ROUTES.USERS + '/' + userId + '/workspaces/' + workspaceId
    })
}

export async function subscribeUserToWorkspace(userId, workspaceId) {
    return await axios({
        method: 'post',
        url: API_ROUTES.USERS + '/' + userId + '/workspaces/' + workspaceId
    })
}