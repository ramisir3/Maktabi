import axios from 'axios';
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

export async function getUsers(params) {
    if (params) {
        params = '?' + params;
    }
    return await axios({
        method: 'GET',
        url: API_ROUTES.USERS + params
    });
};

export async function getWorkspaces() {
    return await axios({
        method: 'GET',
        url: API_ROUTES.WORKSPACE
    });
};

export async function getWorkspaceById(id) {
    return await axios({
        method: 'GET',
        url: API_ROUTES.WORKSPACE + '/' + id
    });
};

export async function updateWorkspaceById(id, data) {
    return await axios({
        method: 'PATCH',
        url: API_ROUTES.WORKSPACE + '/' + id,
        data: data
    });
};

export async function getDesksByWorkspaceId(id) {
    return await axios({
        method: 'GET',
        url: API_ROUTES.DESKS + '/workspaceId/' + id
    });
}

export async function updateFloorImageByWrokspaceId(id, floor, data) {
    return await axios({
        method: 'POST',
        url: API_ROUTES.WORKSPACE + '/id/' + id + "/floor/" + floor,
        data: data,
        headers: {
            'accept': 'application/json',
            'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
        }
    });
}

export async function updateWorkspaceDesksByWorkspaceId(id, data) {
    return await axios({
        method: 'post',
        url: API_ROUTES.DESKS + '/workspaceId/' + id,
        data: data
    });
};

export async function deleteUserById(id) {
    return await axios.delete(API_ROUTES.USERS + '/' + id)
};

export async function getUsersByName(name) {
    return await axios({
        method: 'GET',
        url: API_ROUTES.USERS_NAME + '/' + name
    });
}

export async function getBasicUsersByName(name) {
    return await axios({
        method: 'GET',
        url: API_ROUTES.USERS_NAME + '/basic/name/' + name
    });
}

export async function getBasicUsersByEmail(email) {
    return await axios({
        method: 'GET',
        url: API_ROUTES.USERS_EMAIL + '/basic/email/' + email
    });
}

export async function getUsersByEmail(email) {
    return await axios({
        method: 'GET',
        url: API_ROUTES.USERS_EMAIL + '/' + email
    });
}

export async function getUsersById(id) {
    return await axios({
        method: 'GET',
        url: API_ROUTES.USERS_ID + '/' + id
    });
}

export async function getAdminById(id) {
    return await axios({
        method: 'GET',
        url: API_ROUTES.USER_TYPE_ADMIN + '/id/' + id
    });
}

export async function getAdminByEmail(email) {
    return await axios({
        method: 'GET',
        url: API_ROUTES.USER_TYPE_ADMIN + '/email/' + email
    });
}

export async function searchAdminsByName(name) {
    return await axios({
        method: 'GET',
        url: API_ROUTES.USER_TYPE_ADMIN + '/searchName/' + name
    });
}

export async function searchAdminsByEmail(email) {
    return await axios({
        method: 'GET',
        url: API_ROUTES.USER_TYPE_ADMIN + '/searchEmail/' + email
    });
}


export async function searchUsersById(id) {
    return await axios({
        method: 'GET',
        url: API_ROUTES.USERS_ID + '/ids/' + id
    });
}

export async function searchUsersByName(name) {
    return await axios({
        method: 'GET',
        url: API_ROUTES.USERS_ID + '/names/' + name
    });
}

export async function searchUsersByEmail(email) {
    return await axios({
        method: 'GET',
        url: API_ROUTES.USERS_ID + '/emails/' + email
    });
}

export async function searchWorkspacesByName(name) {
    return await axios({
        method: 'GET',
        url: API_ROUTES.WORKSPACE + '/names/' + name
    });
}

export async function searchWorkspacesByCity(city) {
    return await axios({
        method: 'GET',
        url: API_ROUTES.WORKSPACE + '/cities/' + city
    });
}

export async function searchWorkspacesByPrimaryAdminId(id) {
    return await axios({
        method: 'GET',
        url: API_ROUTES.WORKSPACE + '/primaryAdmin/ids/' + id
    });
}

export async function searchWorkspacesByPrimaryAdminName(name) {
    return await axios({
        method: 'GET',
        url: API_ROUTES.WORKSPACE + '/primaryAdmin/names/' + name
    });
}

export async function searchWorkspacesByPrimaryAdminEmail(email) {
    return await axios({
        method: 'GET',
        url: API_ROUTES.WORKSPACE + '/primaryAdmin/emails/' + email
    });
}

export async function updateUsersById(id, data) {
    return await axios({
        method: 'PATCH',
        url: API_ROUTES.USERS_ID + '/' + id,
        data: data
    });
}

export async function getUserAvatarById(id) {
    return await axios({
        method: 'GET',
        url: API_ROUTES.USERS_ID + '/' + id + '/avatar',
        responseType: 'blob'
    });
}

export async function signIn(email, password) {
    return await axios({
        method: 'post',
        url: API_ROUTES.SIGN_IN,
        data: {
            email,
            password
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
            role: userType,
            phone: phone
        }
    });
};

export async function createWorkspace(data) {
    return await axios({
        method: 'post',
        url: API_ROUTES.WORKSPACE,
        data: data
    });
};

export async function updateWorkspaceAvatarById(id, data) {
    return await axios({
        method: 'post',
        url: API_ROUTES.WORKSPACE + '/avatar/' + id,
        data: data,
        headers: {
            'accept': 'application/json',
            'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
        }
    });
}

export async function getWorkspaceAvatarById(id) {
    return await axios({
        method: 'GET',
        url: API_ROUTES.WORKSPACE + '/avatar/' + id,
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

export async function getDeskBookings(deskId) {
    return await axios({
        method: 'get',
        url: API_ROUTES.BOOKINGS + '/deskId/' + deskId
    })
}

export async function getUserBookings(userId) {
    return await axios({
        method: 'get',
        url: API_ROUTES.BOOKINGS + '/userId/' + userId
    })
}

export async function getWorkspaceBookings(workspaceId) {
    return await axios({
        method: 'get',
        url: API_ROUTES.BOOKINGS + '/workspaceId/' + workspaceId
    })
}

export async function searchUserWorkspaces(userId, name) {
    return await axios({
        method: 'get',
        url: API_ROUTES.USERS + '/' + userId + '/workspaces/' + name
    })
}

export async function unsubscribeUserFromWorkspace(userId, workspaceId) {
    return await axios({
        method: 'delete',
        url: API_ROUTES.USERS + '/' + userId + '/workspaces/' + workspaceId
    })
}

export async function subscribeUserFromWorkspace(userId, workspaceId) {
    return await axios({
        method: 'post',
        url: API_ROUTES.USERS + '/' + userId + '/workspaces/' + workspaceId
    })
}

export async function deleteBookingsById(id) {
    return await axios({
        method: 'delete',
        url: API_ROUTES.BOOKINGS + '/' + id
    })
}

export async function updateDeskBookings(deskId, data) {
    return await axios({
        method: 'post',
        url: API_ROUTES.BOOKINGS + '/deskId/' + deskId,
        data: data
    });
}

export async function adminSignUp(firstName, lastName, email, password) {
    return await axios({
        method: 'post',
        url: API_ROUTES.SIGN_UP,
        data: {
            firstName,
            lastName,
            email,
            password,
            role: 'ADMIN'
        }
    });
};

export async function logoutUser(token) {
    return await axios({
        method: 'POST',
        url: API_ROUTES.USER_LOGOUT,
        headers: {
            Authorization: `Bearer ${token}`
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

export async function adminSignIn(email, password) {
    return await axios({
        method: 'post',
        url: API_ROUTES.SIGN_IN_ADMIN,
        data: {
            email,
            password
        }
    });
};


export async function logoutAdmin(token) {
    return await axios({
        method: 'POST',
        url: API_ROUTES.LOGOUT_ADMIN,
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};

export async function getFloorImage(id, number) {
    return await axios({
        method: 'GET',
        url: API_ROUTES.WORKSPACE + '/id/' + id + '/floor/' + number,
        responseType: 'blob'
    });
}