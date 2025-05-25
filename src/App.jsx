import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import "bootstrap/dist/css/bootstrap.min.css";
import NavUser from "./Komponenten/navigations/NavUser";
import Login from "./Komponenten/Login";
import Vertrag from "./Komponenten/vertrag";
import AdminDashboard from "./Komponenten/dashboards/AdminDashboard";
import EditorDashboard from "./Komponenten/dashboards/EditorDashboard";
import UserDashboard from "./Komponenten/dashboards/UserDashboard";
import Profil from "./Komponenten/Profil";
import "./App.css";
import Profiledit from "./Komponenten/Profiledit";
import EditEventPage from "./Komponenten/EditEventPage";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(null); // null = Auth wird geprüft
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsLoggedIn(true);
        // Rolle aus Firestore laden
        const db = getFirestore();
        const userDocRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists()) {
          setUserRole(userSnap.data().role || "");
        } else {
          setUserRole("");
        }
      } else {
        setIsLoggedIn(false);
        setUserRole("");
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="app-wrapper">
      <Router basename="/organizer">
        <header className="app-header bg-primary text-white text-center d-flex align-items-center justify-content-center">
          <h1 className="fs-3 mb-0 ">Verwaltungstool-Autovermietung</h1>
          {isLoggedIn && userRole === "user" && (
            <NavUser role={userRole} className="nav-user" />
          )}
        </header>

        <main className="app-main bg-light">
          <Routes>
            <Route path="/" element={<Login />} />

            {isLoggedIn === null ? (
              <Route
                path="*"
                element={<p>Authentifizierung wird geprüft...</p>}
              />
            ) : isLoggedIn ? (
              <>
                <Route path="/edit-event/:id" element={<EditEventPage />} />
                <Route path="/vertrag" element={<Vertrag />} />
                <Route path="/profil" element={<Profil />} />
                <Route path="/profiledit" element={<Profiledit />} />
                {userRole === "admin" && (
                  <Route
                    path="/dashboards/admin-dashboard"
                    element={<AdminDashboard />}
                  />
                )}
                {userRole === "editor" && (
                  <Route
                    path="/editor-dashboard"
                    element={<EditorDashboard />}
                  />
                )}
                {userRole === "user" && (
                  <Route path="/user-dashboard" element={<UserDashboard />} />
                )}
              </>
            ) : (
              <Route path="*" element={<Navigate to="/" />} />
            )}
          </Routes>
        </main>

        <footer className="app-footer bg-dark text-white">
          <p className="mb-0 small font-monospace"></p>
          <p className="mb-0 small font-monospace text-center">
            © 2025 A.Schurer. Alle Rechte vorbehalten.
          </p>
          <p className="mb-0 small font-monospace text-end">
            Version 0.0.1-alpha.1
          </p>
        </footer>
      </Router>
    </div>
  );
}

export default App;
