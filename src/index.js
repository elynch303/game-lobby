import './index.css';
// Components
import Channel from './components/Channel';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import React, { useContext, useState } from 'react';
import { createRoot } from 'react-dom';
import {
  AuthCheck,
  FirebaseAppProvider,
  SuspenseWithPerf,
  useAuth,
  useFirestore,
  useFirestoreCollectionData,
  useUser
} from 'reactfire';

const firebaseConfig = {
  apiKey: "AIzaSyDmz0Ab7ybY-z15n6NCtBOZ6ImUydkc8z8",
  authDomain: "game-lobby-d9a96.firebaseapp.com",
  projectId: "game-lobby-d9a96",
  storageBucket: "game-lobby-d9a96.appspot.com",
  messagingSenderId: "1073651672274",
  appId: "1:1073651672274:web:60a07163ef12e0ea4af90b",
  measurementId: "G-5LG9W8NX0M"
};
const LobbyContext = React.createContext();

function AuthenticationButtons() {
  const [setUser] = useState(null);
  const auth = useAuth();
  const signIn = async () => {
    await auth.signInWithPopup(new firebase.auth.GoogleAuthProvider()).then((result) => {
      setUser(result.user);
    });
  };
  const signOut = async () => {
    await auth.signOut();
  };

  return (
    <AuthCheck
      fallback={
        <button className='button is-primary' onClick={signIn}>
          Sign In
        </button>
      }
    >
      <button className='button is-info' onClick={signOut}>
        Sign Out
      </button>
    </AuthCheck>
  );
}

function Navbar() {
  return (
    <nav className='navbar'>
      <div className='navbar-brand'>Fire Lobby </div>
      <div className='navbar-menu'>
        <div className='navbar-start'></div>
        <div className='navbar-end'>
          <div className='navbar-item'>
            <div className='buttons'>
              <AuthenticationButtons />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}



function LobbyProvider(props) {
  const { email, displayName, uid, photoURL } = useUser();
  const lobbyCollection = useFirestore().collection('lobby');
  const lobby = useFirestoreCollectionData(lobbyCollection);
  const user = { email, displayName, uid, photoURL };

  const userInLobby = lobby.find(m => m.email === email);

  const joinLobby = async () => {
    await lobbyCollection.doc(uid).set({ email, displayName, ready: false });
  };

  const leaveLobby = async () => {
    await lobbyCollection.doc(uid).delete();
  };

  const toggleReadiness = async newReadiness => {
    await lobbyCollection.doc(uid).set({ ready: newReadiness }, { merge: true });
  };

  return (
    <LobbyContext.Provider value={{ userInLobby, lobby, joinLobby, leaveLobby, toggleReadiness, user }}>
      <p>Welcome <img className="avatar" src={photoURL} alt="profile" /> {displayName}!</p>
      {props.children}
    </LobbyContext.Provider>
  );
}

function Lobby() {
  const { lobby } = useContext(LobbyContext);

  return (
    <div className='container is-fluid'>
      {lobby.map(m => {
        return (
          <article key={m.email} className='tile is-child notification'>
            <p className='title'>
              {m.displayName} - {m.ready ? 'Ready 🎮' : 'Not Ready ❌'}
            </p>
          </article>
        );
      })}
    </div>
  );
}

function LobbyActions() {
  const { userInLobby, joinLobby, leaveLobby, toggleReadiness } = useContext(LobbyContext);
  const components = [];

  if (userInLobby) {
    components.push(
      <div key='readyButton' className='column is-1'>
        <button key='readyButton' className='button is-primary' onClick={() => toggleReadiness(!userInLobby.ready)}>
          {userInLobby.ready ? 'Not Ready!' : 'Ready!'}
        </button>
      </div>
    );
    components.push(
      <div key='leaveButton' className='column is-1'>
        <button className='button is-primary' onClick={leaveLobby}>
          Leave
        </button>
      </div>
    );
  } else {
    components.push(
      <div key='joinButton' className='column is-1'>
        <button className='button is-primary' onClick={joinLobby}>
          Join
        </button>
      </div>
    );
  }

  return (
    <div className='container is-fluid'>
      <div className='columns'>{components}</div>
    </div>
  );
}

function LobbyChat() {
  const { userInLobby, user } = useContext(LobbyContext);
  const components = [];

  if (userInLobby) {
    components.push(
      <Channel user={user} className='is-1' />
    );
  } else {
    components.push(
      <p className='is-fluid'>Joing The Lobby & Chat With Other Players</p>
    );
  }

  return (
    <div className='container is-fluid'>
      <div className='columns'>{components}</div>
    </div>
  );
}

function App() {
  return (
    <FirebaseAppProvider firebaseConfig={firebaseConfig}>
      <SuspenseWithPerf fallback={<p>Loading...</p>} traceId={'loading-app-status'}>
        <Navbar />
        <AuthCheck fallback={<p>Not Logged In...</p>}>
          <LobbyProvider>
            <Lobby></Lobby>
            <LobbyActions />
            <LobbyChat />
          </LobbyProvider>
        </AuthCheck>
      </SuspenseWithPerf>
    </FirebaseAppProvider>
  );
}

createRoot(document.getElementById('root')).render(<App />);