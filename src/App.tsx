import { useState, useEffect, useContext } from 'react';

import './App.css';

import { useRPC, useSecureRPC } from './rpc';
import { TreeView } from './componets/TreeView';
import ErrorBoundary from './error';

import { AuthContext, useAuth, setAuth } from './auth';


type LoginProps = {
    setAuth: setAuth
};

function Login({ setAuth }: LoginProps) {
    const { error, call, result: token, isLoading } = useRPC<string>('login');
    const [ username, setUserName ] = useState<string>('');
    const [ password, setPassword ] = useState<string>('');

    useEffect(() => {
        if (username && token) {
            setAuth({ username, token });
        }
    }, [token, setAuth, username]);

    if (isLoading) {
        return <p>Loading....</p>;
    }

    return (
        <ErrorBoundary>
          <form onSubmit={() => call(username, password)}>
            <label>
              <p>Username</p>
              <input type="text" onChange={e => setUserName(e.target.value)} />
            </label>
            <label>
              <p>Password</p>
              <input type="password" onChange={e => setPassword(e.target.value)} />
            </label>
            <div>
              <button type="submit">Submit</button>
            </div>
            { error && <p className="error">{ error }</p> }
          </form>
        </ErrorBoundary>
    );
}

interface INote {
    id: number;
    name: string;
    user: string;
    content: string;
}

function App() {
    const { auth, setAuth } = useAuth();
    const [ note, setNote ] = useState<INote | null>(null);
    const {
        error,
        call: get_notes,
        result: notes,
        authError,
        isLoading
    } = useSecureRPC<INote[]>('get_notes');

    useEffect(() => {
        if (auth) {
            get_notes(auth.username);
        }
    }, [auth]);

    if(!auth) {
        return <Login setAuth={setAuth} />
    }

    if (isLoading) {
        return <p>Loading...</p>;
    }
    if (error || !notes) {
        return <p>error</p>;
    }
    if (authError) {
        return <p>Error: {authError}</p>;
    }

    return (
        <AuthContext.Provider value={{ auth, setAuth }}>
          <div className="App">
            <p>Welcome { auth.username }</p>
            <h1>This is {note?.name}</h1>
          </div>
          <Test/>
          <TreeView data={notes} onChange={note => { setNote(note) }} />
        </AuthContext.Provider>
    );
}

function Test() {
    const { auth } = useContext(AuthContext);
    if (auth?.token) {
        return <p>{ auth.token }</p>;
    }
    return <></>
}

export default App;
