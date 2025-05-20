import React, { useState, useEffect } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase"; // Passe den Pfad zu deiner Firebase-Konfiguration an

const Profiledit = () => {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");

  // Synonyme für die Felder
  const fieldLabels = {
    uid: "Benutzer-ID",
    email: "E-Mail",
    role: "Rolle",
    displayName: "Anzeigename",
    createdAt: "Erstellt am",
    phoneNumber: "Telefonnummer",
    birthday: "Geburtstag",
    "address.stadt": "Stadt",
    "address.strasse": "Straße",
    "address.hausnummer": "Hausnummer",
    "address.plz": "Postleitzahl",
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser; // Authentifizierter Benutzer
        if (user) {
          const userDocRef = doc(db, "users", user.uid); // Firestore-Dokument basierend auf der UID
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            setFormData(userDoc.data()); // Daten in das Formular laden
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

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Verschachtelte Felder wie "address.stadt" behandeln
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value,
        },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        await updateDoc(userDocRef, formData); // Aktualisiert die Daten in Firestore
        setSuccessMessage("Profil erfolgreich aktualisiert!");
      }
    } catch (error) {
      console.error("Fehler beim Aktualisieren des Profils:", error);
    }
  };

  if (loading) {
    return <p className="text-center mt-5">Lade Benutzerdaten...</p>;
  }

  // Felder in Kategorien unterteilen
  const loginFields = ["uid", "email", "role", "displayName", "createdAt"];
  const profileFields = [
    "phoneNumber",
    "birthday",
    "address.stadt",
    "address.strasse",
    "address.hausnummer",
    "address.plz",
  ];

  return (
    <div className="app-wrapper bg-light min-h-screen flex flex-col items-center justify-center"
    style={{overflowY: "auto", paddingTop: "20%", paddingBottom: "10%", paddingLeft: "10%", paddingRight: "10%"}}>
      <div className="container " style={{ height: "800px", margin: "0 auto" }}></div>
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold">Profil bearbeiten</h1>
          <p className="text-gray-600">Hier können Sie Ihre Profilinformationen bearbeiten.</p>
        <div
          className="card shadow-lg w-100"
          
        >
          <div
            className="card-header bg-primary text-white text-center"
            style={{ padding: "15px" }}
          >
            <h2 className="text-xl font-bold">Profil bearbeiten</h2>
          </div>
          <div className="card-body">
            {successMessage && (
              <div className="alert alert-success" role="alert">
                {successMessage}
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <h4 className="text-lg font-semibold mb-3">Login-Felder</h4>
              <div className="row">
                {loginFields.map((key) => (
                  <div className="col-md-6 mb-3" key={key}>
                    <label className="form-label">{fieldLabels[key]}</label>
                    <input
                      type="text"
                      className="form-control border-gray-300 shadow-sm focus:ring focus:ring-blue-300"
                      name={key}
                      value={formData[key] || ""}
                      onChange={handleChange}
                      disabled={key === "uid" || key === "createdAt"|| key === "role" || key === "email"} // Diese Felder sind nicht bearbeitbar
                    />
                  </div>
                ))}
              </div>

              <h4 className="text-lg font-semibold mb-3">Erweiterte Profilfelder</h4>
              <div className="row">
                {profileFields.map((key) => (
                  <div className="col-md-6 mb-3" key={key}>
                    <label className="form-label">{fieldLabels[key]}</label>
                    <input
                      type="text"
                      className="form-control border-gray-300 shadow-sm focus:ring focus:ring-blue-300"
                      name={key}
                      value={
                        key.includes(".")
                          ? formData[key.split(".")[0]]?.[key.split(".")[1]] || ""
                          : formData[key] || ""
                      }
                      onChange={handleChange}
                    />
                  </div>
                ))}
              </div>

              <div className="text-center">
                <button
                  type="submit"
                  className="btn btn-success px-5 py-2 mt-3 shadow-md hover:bg-green-600"
                >
                  Speichern
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profiledit;