import React, { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, push, onValue } from "firebase/database";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import { Button, Input, Card, CardContent } from "@/components/ui";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  databaseURL: "YOUR_DATABASE_URL",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const Home = () => {
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  const handleJoin = () => {
    if (username.trim()) {
      push(ref(db, "users"), { username, color: null });
      navigate(`/select-color/${username}`);
    }
  };

  return (
    <Card>
      <CardContent>
        <Input type="text" placeholder="Voer je gebruikersnaam in" value={username} onChange={(e) => setUsername(e.target.value)} />
        <Button onClick={handleJoin}>Deelnemen</Button>
      </CardContent>
    </Card>
  );
};

const SelectColor = ({ username }) => {
  const colors = ["rood", "oranje", "geel", "groen", "blauw", "indigo", "violet"];
  const navigate = useNavigate();

  const handleColorSelect = (color) => {
    set(ref(db, `users/${username}`), { username, color });
    navigate("/waiting");
  };

  return (
    <Card>
      <CardContent>
        <h2>Kies een kleur</h2>
        {colors.map((color) => (
          <Button key={color} style={{ backgroundColor: color }} onClick={() => handleColorSelect(color)}>
            {color}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
};

const Host = () => {
  const [users, setUsers] = useState([]);
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    onValue(ref(db, "users"), (snapshot) => {
      const data = snapshot.val();
      setUsers(data ? Object.values(data) : []);
    });
  }, []);

  const handleAuth = () => {
    if (password === "admin123") setIsAuthenticated(true);
  };

  return (
    <Card>
      <CardContent>
        {!isAuthenticated ? (
          <>
            <Input type="password" placeholder="Voer wachtwoord in" value={password} onChange={(e) => setPassword(e.target.value)} />
            <Button onClick={handleAuth}>Inloggen</Button>
          </>
        ) : (
          <>
            <h2>Deelnemers</h2>
            {users.map((user) => (
              <p key={user.username}>{user.username}: {user.color || "Nog geen keuze"}</p>
            ))}
          </>
        )}
      </CardContent>
    </Card>
  );
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/select-color/:username" element={<SelectColor />} />
        <Route path="/host" element={<Host />} />
      </Routes>
    </Router>
  );
};

export default App;
