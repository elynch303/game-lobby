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

function AuthenticationButtons() {
    const auth = useAuth();
    const signIn = async () => {
        await auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
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