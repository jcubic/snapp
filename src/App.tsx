import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Notes from './componets/Notes';
import Login from './componets/Login'
import { useAuth, AuthContext } from './auth';

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

export default App;
