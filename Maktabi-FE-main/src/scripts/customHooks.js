import { useState, useEffect } from 'react';
import { getAuthenticatedAdmin, getAuthenticatedUser } from './common';
import { useNavigate } from 'react-router-dom';

export function useUser() {
    const [user, setUser] = useState(null);
    const [authenticated, setAuthenticated] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        async function getUserDetails() {
            const { authenticated, user } = await getAuthenticatedUser();
            if (!authenticated) {
                return;
            }
            setUser(user);
            setAuthenticated(authenticated);
        }
        getUserDetails();
    }, []);
    return { user, authenticated };
}

export function useMaktabiAdmin() {
    const [authenticated, setAuthenticated] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        async function getUserDetails() {
            const { authenticated } = await getAuthenticatedAdmin();
            if (!authenticated) {
                navigate('/admin/login');
                return;
            }
            setAuthenticated(authenticated);
        }
        getUserDetails();
    }, []);

    return { authenticated };
}