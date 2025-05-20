import React, { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase"; // Passe den Pfad zu deiner Firebase-Konfiguration an
import { Link } from "react-router-dom";
const Profil = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser; // Authentifizierter Benutzer
        if (user) {
          const userDocRef = doc(db, "users", user.uid); // Firestore-Dokument basierend auf der UID
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            setUserData(userDoc.data());
          } else {
            console.error("Benutzerdaten nicht gefunden");
          }
        } else {
          console.error("Kein Benutzer angemeldet");
        }
      } catch (error) {
        console.error("Fehler beim Laden der Benutzerdaten:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return <p className="text-center mt-5">Lade Benutzerdaten...</p>;
  }

  if (!userData) {
    return <p className="text-center mt-5">Benutzerdaten konnten nicht geladen werden.</p>;
  }

  return (
    <div className="container mt-5">
      <div className="card shadow-lg">
        <div className="card-header bg-primary text-white text-center">
          <h2>{userData.name || "Unbekannter Benutzer"}</h2>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-3 text-center">
              <img
                src={userData.profilePicture || "https://placehold.co/150"}
                alt="Profilbild"
                className="img-fluid rounded-circle mb-3"
                style={{ width: "150px", height: "150px", objectFit: "cover", margin: "0 auto" }}
              />
            </div>
            <div className="col-md-8">
              <h4 className="card-title"></h4>
              <p className="card-text">
                <strong>Email:</strong> {userData.email || "Keine Email angegeben"}
              </p>
              <p className="card-text">
                <strong>Telefon:</strong> {userData.phone || "Keine Telefonnummer angegeben"}
              </p>
              <p className="card-text">
                <strong>Adresse:</strong> {userData.station || "Keine Adresse angegeben"}
              </p>
                <button className="btn btn-primary mt-3">
                    <Link to="/Profiledit" className="text-white text-decoration-none">
                     Profil bearbeiten
                    </Link>
                </button>            
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profil;