import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import FormTermin from "./FormTermin";

function EditEventPage() {
  const { id } = useParams(); // entspricht der Event-UID aus 'events'
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/"); // zurück zum Login
        return;
      }

      const db = getFirestore();
      const userDocRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userDocRef);

      // Zugriff für alle eingeloggten Nutzer – keine Rollenbeschränkung
      if (!userSnap.exists()) {
        console.error("Benutzerdokument nicht gefunden.");
        navigate("/unauthorized");
        return;
      }

      // Event-Daten aus 'events/:id' laden
      try {
        const eventDocRef = doc(db, "events", id);
        const eventSnap = await getDoc(eventDocRef);

        if (!eventSnap.exists()) {
          console.error("Event nicht gefunden");
          navigate("/user-dashboard");
          return;
        }

        const eventData = eventSnap.data();

        const startDateObj = eventData.start.toDate();
        const endDateObj = eventData.end.toDate();

        const formatDate = (date) => date.toISOString().split("T")[0];

        const formatTime = (date) =>
          date.toLocaleTimeString("de-DE", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          });

        // Event-Daten umstrukturieren für FormTermin
        const mappedData = {
          name: eventData.name || "",
          firstName: eventData.vorname || "",
          phoneNumber: eventData.telNr || "",
          vehicle: eventData.fahrzeug || "",
          dateStart: formatDate(startDateObj),
          timeStart: formatTime(startDateObj),
          dateEnd: formatDate(endDateObj),
          timeEnd: formatTime(endDateObj),
          kunde: eventData.kunde || "privat",
          info: eventData.description || "",
          preis: eventData.preis || 0,
          freiKm: eventData.km || 0,
          extraOption: "",
          extraKm: 0,
        };

        setInitialData(mappedData);
      } catch (error) {
        console.error("Fehler beim Laden des Events:", error);
      }

      setLoading(false);
      setAuthChecked(true);
    });

    return () => unsubscribe();
  }, [id, navigate]);

  const handleUpdate = async (updatedData) => {
    const db = getFirestore();
    const eventDocRef = doc(db, "events", id);

    try {
      const eventData = {
        title: `${updatedData.firstName} ${updatedData.name} / ${updatedData.vehicle}`,
        start: new Date(`${updatedData.dateStart}T${updatedData.timeStart}`),
        end: new Date(`${updatedData.dateEnd}T${updatedData.timeEnd}`),
        fahrzeug: updatedData.vehicle,
        name: updatedData.name,
        vorname: updatedData.firstName,
        telNr: updatedData.phoneNumber,
        kunde: updatedData.kunde,
        preis: updatedData.preis,
        km: updatedData.freiKm + (updatedData.extraKm || 0),
        description: updatedData.info,
        abgerechnet: false,
      };

      await setDoc(eventDocRef, eventData, { merge: true });
      navigate("/user-dashboard");
    } catch (error) {
      console.error("Fehler beim Speichern:", error);
    }
  };

  if (!authChecked)
    return <p className="container mt-5">Authentifizierung wird geprüft...</p>;
  if (loading) return <p className="container mt-5">Event wird geladen...</p>;

  return (
    <div className="container mt-5">
      <FormTermin
        initialData={initialData}
        onSubmit={handleUpdate}
        onClose={() => navigate(-1)}
        isEdit={true}
      />
    </div>
  );
}

export default EditEventPage;
