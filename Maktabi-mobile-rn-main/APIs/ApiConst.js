const API_URL = 'http://192.168.89.240:3000'
export const API_ROUTES = {
    SIGN_UP: `${API_URL}/users`,
    SIGN_IN: `${API_URL}/users/login`,
    USER_LOGOUT: `${API_URL}/users/logout`,
    GET_USER: `${API_URL}/users/me`,
    UPDATE_AVATAR: `${API_URL}/users/me/avatar`,
    SIGN_IN_ADMIN: `${API_URL}/admin/login`,
    LOGOUT_ADMIN: `${API_URL}/admin/logout`,
    USERS: `${API_URL}/users`,
    USERS_NAME: `${API_URL}/users`,
    USERS_EMAIL: `${API_URL}/users`,
    USERS_ID: `${API_URL}/users`,
    USER_EMAIL: `${API_URL}/user/email`,
    USER_TYPE_ADMIN: `${API_URL}/users/admin`,
    WORKSPACE: `${API_URL}/workspaces`,
    DESKS: `${API_URL}/desks`,
    BOOKINGS: `${API_URL}/bookings`,
}