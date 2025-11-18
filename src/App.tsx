import { Provider } from "react-redux";
import { useState, useEffect } from "react";
import store from "./store";
import ProfileCalendar from "./components/ProfileCalendar";
import Login from "./pages/Login";
import AuthSession from "./utils/session";
import './App.css'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const userId = AuthSession.getId();
    setIsAuthenticated(!!userId && userId !== 'null' && userId !== 'undefined');
    setIsChecking(false);
  }, []);

  if (isChecking) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div style={{ 
          fontSize: '18px', 
          color: '#19979c',
          fontWeight: 600
        }}>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <Provider store={store()}>
      {isAuthenticated ? <ProfileCalendar /> : <Login />}
    </Provider>
  );
}

export default App;
