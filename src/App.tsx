import { useState, useEffect, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, useParams, Link } from 'react-router-dom';

import style from './App.module.css';

import { useSecureRPC } from './rpc';
import { FilteredTreeView } from './componets/FilteredTreeView';
import Login from './componets/Login'
import { useAuth, AuthContext } from './auth';

interface INote {
  id: string;
  name: string;
  user: string;
  dirty?: boolean;
  content: string;
}

function App() {
  const { auth, setAuth } = useAuth();


  if(!auth) {
    return <Login setAuth={setAuth} />
  }

  return (
    <AuthContext.Provider value={{ auth, setAuth }}>
      <Router>
        <Routes>
          <Route path="/" element={<Notes/>}/>
          <Route path="/note/:id" element={<Notes/>}/>
        </Routes>
      </Router>
    </AuthContext.Provider>
  );
}

const Notes = () => {
  const { auth } = useContext(AuthContext);
  const { id } = useParams();
  const [ notes, setNotes ] = useState<INote[]>([]);
  const [ note, setNote ] = useState<INote | null>(null);
  const [ init, setInit ] = useState<boolean>(true);
  if (!auth) {
    return null;
  }
  const {
    error,
    call: get_notes,
    result: initNotes,
    authError,
    isLoading
  } = useSecureRPC<INote[]>('get_notes');

  useEffect(() => {
    if (notes.length && init) {
      setNote(notes[0]);
      setInit(false);
    }
  }, [notes]);

  useEffect(() => {
    if (!init && id) {
      const note = notes.find(note => note.id === id);
      if (note) {
        setNote(note);
      }
    }
  }, [id, init]);

  useEffect(() => {
    if (initNotes) {
      setNotes(initNotes);
    }
  }, [initNotes]);

  useEffect(() => {
    if (auth) {
      get_notes(auth.username);
    }
  }, [auth]);

  const updateNote = (value: string) => {
    const id = note?.id;
    const index = notes.findIndex(note => note.id == id);
    notes[index].content = value;
    notes[index].dirty = true;
    setNotes([...notes]);
  };

  if (isLoading) {
    return <p>Loading...</p>;
  }
  if (error || !initNotes) {
    return <p>{error}</p>;
  }
  if (authError) {
    return <p>Error: {authError}</p>;
  }

  return (
    <div className={ style.app }>
      <header>
        <p>Welcome { auth.username }</p>
        <h1>This is { note?.name }</h1>
        <Test/>
      </header>
      <div className={style.note}>
        <textarea value={note?.content} onChange={(e) => { updateNote(e.target.value) }} />
      </div>
      <FilteredTreeView className={style.sidebar}
                        data={notes}
                        filter={(re, note) => !!note.name.match(re)}
                        link={(note:INote) => {
                          return (
                            <Link to={`/note/${note.id}`}>{note.name}</Link>
                          );
                          return <span onClick={() => setNote(note) }>{note.name}</span>
                        }}/>
      <footer className={style.footer}>
        <p>
          Copyright (C) 2022 <a href="https://jakub.jankiewicz.org">Jakub T. Jankiewicz</a>
        </p>
      </footer>
    </div>
  );
}


function Test() {
  const { auth } = useContext(AuthContext);
  if (auth?.token) {
    return <p>Token: <strong>{ auth.token }</strong></p>;
  }
  return <p>Pending...</p>
}

export default App;
