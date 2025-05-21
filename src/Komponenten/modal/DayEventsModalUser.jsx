import React, { useState } from "react";
import { doc, deleteDoc, getDocs, collection } from "firebase/firestore";
import { db } from "../../firebase"; // Passe den Pfad zu deiner Firebase-Konfiguration an
import EventDetailsModalUser from "./EventDetailsModalUser"; // Import des Modals
import { color } from "framer-motion";
import { useNavigate } from "react-router-dom"; // <--- hinzufügen

const DayEventsModalUser = ({ events, onUpdate, fetchEventDetails }) => {
  const [localEvents, setLocalEvents] = useState(events);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const navigate = useNavigate(); // <--- hinzufügen

  // Funktion zum Löschen eines Events
  const handleDelete = async (eventId) => {
    try {
      await deleteDoc(doc(db, "events", eventId)); // Löscht das Dokument aus Firestore
      alert("Termin erfolgreich gelöscht!");

      // Lokale Events-Liste aktualisieren
      const updatedEvents = localEvents.filter((event) => event.id !== eventId);
      setLocalEvents(updatedEvents);

      // Übergeordnete Komponente informieren
      onUpdate();
    } catch (error) {
      console.error("Fehler beim Löschen des Termins:", error);
      alert("Fehler beim Löschen des Termins.");
    }
  };

  const handleSelectEvent = async (event) => {
    try {
      const eventDetails = await fetchEventDetails(event.id); // Abrufen der Eventdetails
      if (eventDetails) {
        setSelectedEvent(eventDetails); // Eventdetails setzen
        setIsEventModalOpen(true); // Modal öffnen
      }
    } catch (error) {
      console.error("Fehler beim Abrufen der Eventdetails:", error);
    }
  };

  return (
    <div className="modal-content bg-white p-4 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">Termine</h2>
      {localEvents && localEvents.length > 0 ? (
        <ul className="list-group">
          {localEvents.map((event, index) => {
            return (
              <li
                key={index}
                className="list-group-item mb-3 border rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="row mb-2">
                  <div className="col-3">
                    <strong className="text-lg font-semibold">
                      {event.title}
                    </strong>
                    <br />
                  </div>
                  <div className="col-3">
                    <span className="text-sm text-gray-500">
                      Datum: {event.start?.toLocaleDateString()} -{" "}
                      {event.end?.toLocaleDateString()}
                    </span>
                    <br />
                    <span className="text-sm text-gray-500">
                      Zeit: {event.start?.toLocaleTimeString()} -{" "}
                      {event.end?.toLocaleTimeString()}
                    </span>
                    <br />
                  </div>
                  <div className="col-3">
                    <span className="text-s text-black-500">
                      Info: {event.description || "Keine Info verfügbar"}
                    </span>
                  </div>
                  <div className="col-3 text-end">
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(event.id)} // Event-ID wird übergeben
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                    <button className="btn btn-primary btn-sm ">
                      <i className="bi bi-pencil"></i>
                    </button>
                    <button
                      className="btn btn-secondary btn-sm "
                      disabled
                      onClick={() => {
                        handleSelectEvent(event);
                      }}
                    >
                      <i className="bi bi-eye"></i>
                    </button>
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() =>
                        navigate("/vertrag", {
                          state: {
                            uid: event.id,
                            eventData: event, // <--- alle Eventdaten übergeben
                          },
                        })
                      }
                    >
                      <i className="bi bi-currency-euro"></i>
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-center text-gray-500">Keine Termine vorhanden.</p>
      )}
    </div>
  );
};

export default DayEventsModalUser;
