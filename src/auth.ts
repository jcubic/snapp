import { useState, useEffect, Dispatch, SetStateAction, createContext } from 'react';

import { useRPC } from './rpc';

type setAuth = Dispatch<SetStateAction<IAuth | null>>;

type AuthContext = {
    auth: IAuth | null,
    setAuth: setAuth | null
};

interface IAuth {
    username: string | null;
    token: string | null;
}

const AuthContext = createContext({} as AuthContext);

const LS_KEY = 'notes_auth';

function getStorageAuth(): IAuth | null {
    const data = localStorage.getItem(LS_KEY);
    if (!data) {
        return null;
    }
    return JSON.parse(data);
}

function setStorageAuth(auth: IAuth | null): void {
    if (!auth) {
        localStorage.removeItem(LS_KEY);
    } else {
        localStorage.setItem(LS_KEY, JSON.stringify(auth));
    }
}

function useAuth() {
    const [ auth, setAuth ] = useState<IAuth | null>(null);
    const { call: checkIfValid, result: validToken } = useRPC<boolean>('valid_token');

    useEffect(() => {
        const auth = getStorageAuth();
        if (auth) {
            if (validToken === null) {
                checkIfValid(auth.username, auth.token);
            } else if (validToken) {
                setStorageAuth(auth);
            } else {
                setStorageAuth(null);
            }
        }
    }, [setAuth, validToken]);

    return { auth, setAuth };
}

export { useAuth, AuthContext, type setAuth }
