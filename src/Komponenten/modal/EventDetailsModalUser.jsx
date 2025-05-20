import React, { useEffect, useState } from "react";
import { db } from "../../firebase"; // Import der Firestore-Instanz
import { collection, getDocs, doc, getDoc } from "firebase/firestore";

const EventsList = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // Referenz zur 'events'-Collection
        const eventsCollection = collection(db, "events");
        // Daten abrufen
        const eventsSnapshot = await getDocs(eventsCollection);
        // Daten in ein Array umwandeln
        const eventsList = eventsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setEvents(eventsList); // Events im State speichern
      } catch (error) {
        console.error("Fehler beim Abrufen von Events:", error);
      }
    };

    fetchEvents();
  }, []);

  const fetchEventDetails = async (eventId) => {
    try {
      const eventDoc = await getDoc(doc(db, "events", eventId));
      if (eventDoc.exists()) {
        return { id: eventDoc.id, ...eventDoc.data() };
      } else {
        console.error("Event nicht gefunden");
        return null;
      }
    } catch (error) {
      console.error("Fehler beim Abrufen der Eventdetails:", error);
      return null;
    }
  };

  const handleEventClick = async (eventId) => {
    const eventDetails = await fetchEventDetails(eventId);
    setSelectedEvent(eventDetails);
    setIsEventModalOpen(true);
  };

  return (
    <div>
      <h1>Events</h1>
      <ul>
        {events.map((event) => (
          <li key={event.id} onClick={() => handleEventClick(event.id)}>
            <h2>{event.title}</h2>
            <p>{event.kunde}</p>
            <p>{event.vorname}</p>
            <p>{event.nachname}</p>
            <p>{event.telNr}</p>
            <p>von: {new Date(event.start.toDate()).toLocaleString("de-DE", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
            <p>bis: {new Date(event.end.toDate()).toLocaleString("de-DE", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
            <p>{event.fahrzeug}</p>
            <div className="col-6"><p>{event.preis}€/{event.km}km</p></div>
          </li>
        ))}
      </ul>
      {isEventModalOpen && (
        <EventDetailsModalUser selectedEvent={selectedEvent} setIsEventModalOpen={setIsEventModalOpen} />
      )}
    </div>
  );
};

const EventDetailsModalUser = ({ selectedEvent, setIsEventModalOpen }) => {
  if (!selectedEvent) {
    return null; // Zeige nichts an, wenn kein Event ausgewählt ist
  }

  return (
    <div className="modal-content bg-white p-4 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">Event Details</h2>
      <p><strong>Title:</strong> {selectedEvent.title}</p>
      <p><strong>Kunde:</strong> {selectedEvent.kunde}</p>
      <p><strong>Vorname:</strong> {selectedEvent.vorname}</p>
      <p><strong>Nachname:</strong> {selectedEvent.nachname}</p>
      <p><strong>Telefonnummer:</strong> {selectedEvent.telNr}</p>
      <p><strong>Von:</strong> {new Date(selectedEvent.start.toDate()).toLocaleString("de-DE", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
      <p><strong>Bis:</strong> {new Date(selectedEvent.end.toDate()).toLocaleString("de-DE", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
      <p><strong>Fahrzeug:</strong> {selectedEvent.fahrzeug}</p>
      <p><strong>Preis:</strong> {selectedEvent.preis}€ / {selectedEvent.km}km</p>
      <button className="btn btn-secondary mt-4" onClick={() => setIsEventModalOpen(false)}>
        Schließen
      </button>
    </div>
  );
};

export default EventsList;