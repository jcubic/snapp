import { useState, useEffect, useContext, FC } from 'react';
import { useParams, NavLink } from 'react-router-dom';
import { FilteredTreeView } from './FilteredTreeView';
import { useSecureRPC } from '../rpc';

interface INote {
  id: string;
  name: string;
  user: string;
  dirty?: boolean;
  content: string;
}

import style from './Notes.module.css';
import { AuthContext } from '../auth';

type NotesProps = {
    title?: (arg: INote) => string;
}

const Notes: FC<NotesProps> = ({title}) => {
  const { auth } = useContext(AuthContext);
  const { id } = useParams();
  const [ notes, setNotes ] = useState<INote[]>([]);
  const [ note, setNote ] = useState<INote | null>(null);
  const [ init, setInit ] = useState<boolean>(true);
  if (!auth) {
    return null;
  }
  useEffect(() => {
    if (note && title) {
      document.title = title(note);
    }
  }, [note]);
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
      </header>
      <div className={style.note}>
        <textarea value={note?.content}
                  onChange={(e) => {
                    updateNote(e.target.value);
                  }} />
      </div>
      <FilteredTreeView className={style.sidebar}
                        data={notes}
                        filter={(re, note) => !!note.name.match(re)}
                        link={(note: INote) => {
                          return <NavLink to={`/notes/${note.id}`}
                                          className={({isActive}) => {
                                            const classNames = [style.link];
                                            if (isActive) {
                                              classNames.push(style.activeLink);
                                            }
                                            return classNames.join(' ');
                                          }}>
                            {note.name}{note.dirty ? "*" : ""}
                          </NavLink>;
                        }}/>
      <footer className={style.footer}>
        <p>
          Copyright (C) 2022 <a href="https://jakub.jankiewicz.org">Jakub T. Jankiewicz</a>
        </p>
      </footer>
    </div>
  );
}

export default Notes;
