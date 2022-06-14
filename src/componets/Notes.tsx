import { useState, useEffect, useRef, useContext, FC } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { useParams, NavLink } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';

import { FilteredTreeView } from './FilteredTreeView';
import { useSecureRPC } from '../rpc';
import { withHokey } from '../hotkeys';

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

type classNameT = {
  isActive: boolean;
};

const Notes: FC<NotesProps> = ({title}) => {
  const { auth } = useContext(AuthContext);
  const { id } = useParams();
  const [ notes, setNotes ] = useState<INote[]>([]);
  const [ note, setNote ] = useState<INote | null>(null);
  const [ init, setInit ] = useState<boolean>(true);
  const input = useRef<HTMLTextAreaElement | null>(null);

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
    call: getNotes,
    result: initNotes,
    authError,
    isLoading
  } = useSecureRPC<INote[]>('get_notes');

  const {
    error: saveError,
    call: saveNotes
  } = useSecureRPC<void>('save_note');

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
    if (note && input?.current) {
      input.current.value = note?.content;
    }
  }, [note]);

  useEffect(() => {
    if (auth) {
      getNotes(auth.username);
    }
  }, [auth]);

  useEffect(() => {
    if (saveError) {
      toast((saveError as Error).toString(), {
        position: "bottom-right",
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        progress: undefined
      });
    }
  }, [saveError]);

  const updateNote = (value: string) => {
    const index = findNoteIndex();
    notes[index].content = value;
    notes[index].dirty = true;
    setNotes([...notes]);
  };

  const makePristine = () => {
    const index = findNoteIndex();
    delete notes[index].dirty;
  }

  const findNoteIndex = () => {
    const id = note?.id;
    const index = notes.findIndex(note => note.id == id);
    return index;
  }

  if (isLoading) {
    return <p>Loading...</p>;
  }
  if (error || !initNotes) {
    return <p>{error}</p>;
  }
  if (authError) {
    return <p>Error: {authError}</p>;
  }

  const keymap = {
    'CTRL+S': (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (auth) {
        saveNotes(auth.username, note);
        makePristine();
      }
      e.preventDefault();
    }
  };
  const className = ({isActive}: classNameT) => {
    const classNames = [style.link];
    if (isActive) {
      classNames.push(style.activeLink);
    }
    return classNames.join(' ');
  };
  // TODO: add toaster for RPC errors

  return (
    <div className={ style.app }>
      <header>
        <p>Welcome { auth.username }</p>
        <h1>This is { note?.name }</h1>
      </header>
      <div className={style.note}>
        <textarea ref={input}
                  onKeyDown={withHokey(keymap)}
                  onChange={(e) => {
                    updateNote(e.target.value);
                  }} />
        <ToastContainer
          position="bottom-right"
          autoClose={2000}
          hideProgressBar={true}
          newestOnTop={false}
          closeOnClick
        />
      </div>
      <FilteredTreeView className={style.sidebar}
                        data={notes}
                        filter={(re, note) => !!note.name.match(re)}
                        link={(note: INote) => {
                          return <NavLink to={`/notes/${note.id}`}
                                          className={className}>
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
