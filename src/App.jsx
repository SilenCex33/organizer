import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import NavUser from "./Komponenten/navigations/NavUser"; // NavUser importieren
import Login from "./Komponenten/Login";
import Vertrag from "./Komponenten/vertrag"; // Vertrag importieren
import AdminDashboard from "./Komponenten/dashboards/AdminDashboard";
import EditorDashboard from "./Komponenten/dashboards/EditorDashboard";
import UserDashboard from "./Komponenten/dashboards/UserDashboard";
import Profil from "./Komponenten/Profil";
import "./App.css";
import Profiledit from "./Komponenten/Profiledit";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Zustand für Login verwalten
  const [userRole, setUserRole] = useState(""); // Benutzerrolle speichern

  // Funktion für das Login (wird von Login-Komponente aufgerufen)
  const handleLogin = (role) => {
    setIsLoggedIn(true);
    setUserRole(role); // Benutzerrolle setzen
  };

  return (
    <div className="app-wrapper">
      <Router basename="/organizer">
        <header className="app-header bg-primary text-white text-center d-flex align-items-center justify-content-center">
          <h1 className="fs-3 mb-0 ">Verwaltungstool-Autovermietung</h1>
          {isLoggedIn && userRole === "user" && (
            <NavUser role={userRole} className="nav-user" />
          )}{" "}
          {/* NavUser nur für Rolle 'user' */}
        </header>

        <main className="app-main bg-light">
          <Routes>
            {/* Login-Seite */}
            <Route path="/" element={<Login onLogin={handleLogin} />} />

            {/* Geschützte Routen */}
            {isLoggedIn ? (
              <>
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
                <Route path="/profil" element={<Profil />} />{" "}
                {/* Profil-Route */}
                <Route path="/profiledit" element={<Profiledit />} />{" "}
                {/* ProfilEdit-Route */}
                <Route path="/vertrag" element={<Vertrag />} />
              </>
            ) : (
              // Umleitung auf Login, wenn nicht eingeloggt
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
