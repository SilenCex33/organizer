import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/de';
import DatePicker, { registerLocale } from 'react-datepicker';
import { de, km } from 'date-fns/locale';
import { format } from 'date-fns';
import 'react-datepicker/dist/react-datepicker.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './css/Calendar.css';
import Modal from 'react-modal'; // Installiere react-modal mit `npm install react-modal`
import FormTermin from './FormTermin'; // Importiere deine FormTermin-Komponente
import EventDetailsModalUser from './modal/EventDetailsModalUser'; // Importiere die neue Komponente
import { collection, getDocs, doc, getDoc, addDoc } from "firebase/firestore"; // Importiere Firestore-Methoden
import { db } from "../firebase"; // Importiere deinen Firestore-Export
import DayEventsModalUser from './modal/DayEventsModalUser'; // Importiere die neue Komponente



registerLocale('de', de);
const localizer = momentLocalizer(moment);

Modal.setAppElement('#root'); // Setze hier das App-Element

const CustomToolbar = ({ date, onDateChange, onNewEvent }) => {
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleDateChange = (newDate) => {
    onDateChange(newDate);
    setShowDatePicker(false);
  };

  const goToBack = () => {
    const newDate = moment(date).subtract(1, 'month').toDate();
    onDateChange(newDate);
  };

  const goToNext = () => {
    const newDate = moment(date).add(1, 'month').toDate();
    onDateChange(newDate);
  };

  const goToToday = () => {
    const today = new Date();
    onDateChange(today);
  };
  
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px',
      }}
    >
      <button onClick={goToBack} className="btn btn-light">
        <i className="bi bi-arrow-left nav"></i>
      </button>

      <div style={{ textAlign: 'center', position: 'relative', flexGrow: 1 }}>
        <div className="btn btn-light">
          <h3
            onClick={goToToday}
            onDoubleClick={(e) => {
              e.stopPropagation();
              setShowDatePicker(true);
            }}
            style={{ margin: 0, cursor: 'pointer' }}
          >
            {format(date, 'LLLL yyyy', { locale: de })}
          </h3>
        </div>

        {showDatePicker && (
          <div
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 1000,
              padding: '30px',
              borderRadius: '8px',
              backgroundColor: 'white',
              boxShadow: '0 8px 10px rgba(0, 0, 0, 0.41)',
              width: '800px',
              height: '600px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowDatePicker(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '34px',
                  cursor: 'pointer',
                }}
              >
                &times;
              </button>
            </div>

            <DatePicker
              selected={date}
              onChange={handleDateChange}
              showMonthYearPicker
              inline
              locale="de"
              dateFormat="LLLL yyyy"
            />
          </div>
        )}
      </div>

      <button onClick={onNewEvent} className="btn btn-light fs-3">
        <i className="bi bi-calendar-plus"></i>
      </button>

      <button onClick={goToNext} className="btn btn-light">
        <i className="bi bi-arrow-right nav"></i>
      </button>
    </div>
  );
};

const CalendarComponent = () => {
  const [events, setEvents] = useState([]);

  // Funktion zum Laden der Events
  const loadEvents = async () => {
    const eventsCollection = collection(db, "events");
    const eventsSnapshot = await getDocs(eventsCollection);
    const eventsData = eventsSnapshot.docs.map((doc) => {
      const data = doc.data();

      // Konvertiere Firestore Timestamps in JavaScript Date-Objekte
      const start = data.start?.toDate();
      const end = data.end?.toDate();

      return {
        id: doc.id,
        title: data.title,
        start: start,
        end: end,
        kunde: data.kunde,
        fahrzeug: data.fahrzeug,
        preis: data.preis,
        km: data.km,
        telNr: data.telNr,
        description: data.description,
        abgerechnet: data.abgerechnet,
      };
    });

    setEvents(eventsData.filter((event) => event !== null));
  };

  // Wrapper-Funktion zum Neuladen der Events
  const reloadEvents = async () => {
    try {
      const eventsCollection = collection(db, "events");
      const eventsSnapshot = await getDocs(eventsCollection);
      const eventsData = eventsSnapshot.docs.map((doc) => {
        const data = doc.data();
        if (!data.Datumstart || !data.Zeitstart || !data.Datumende || !data.Zeitende) {
          console.error("Fehlende Felder im Dokument:", doc.id);
          return null;
        }
        const start = new Date(`${data.Datumstart}T${data.Zeitstart}`);
        const end = new Date(`${data.Datumende}T${data.Zeitende}`);
        return {
          id: doc.id,
          title: `${data.Vorname} / ${data.Fahrzeug}`,
          start: start,
          end: end,
          telNr: data.TelNr,
          kunde: data.Kunde,
          preis: data.Preis,
          fahrzeug: data.Fahrzeug,
          abgerechnet: data.Abgerechnet,
          km: data.Km,
        };
      });
  
      setEvents(eventsData.filter((event) => event !== null));
      console.log("Events erfolgreich neu geladen");
    } catch (error) {
      console.error("Fehler beim Neuladen der Events:", error);
    }
  };
  

  useEffect(() => {
    loadEvents();
  }, []);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isDayEventsModalOpen, setIsDayEventsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalStartDate, setModalStartDate] = useState(null);
  const [modalEndDate, setModalEndDate] = useState(null);
  const [dayEvents, setDayEvents] = useState([]);

  const isAnyModalOpen = () => isModalOpen || isEventModalOpen || isDayEventsModalOpen;

  // Funktion zum Abrufen eines spezifischen Termins aus Firebase
  const fetchEventDetails = async (eventId) => {
    const docRef = doc(db, "events", eventId); // Referenz auf das spezifische Dokument
    const docSnapshot = await getDoc(docRef);

    if (docSnapshot.exists()) {
      return { id: docSnapshot.id, ...docSnapshot.data() }; // UID und Daten zurückgeben
    } else {
      console.error("Kein Dokument mit dieser ID gefunden:", eventId);
      return null;
    }
  };

 

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    loadEvents(); // Aktualisiere die Events
  };

  const closeEventModal = () => {
    setIsEventModalOpen(false); // Zustand zurücksetzen
    setSelectedEvent(null); // Event zurücksetzen
  };

  const handleFormSubmit = async (formData) => {
    try {
      await addDoc(collection(db, "events"), {
        title: `${formData.name} / ${formData.vehicle}`,
        start: new Date(`${formData.dateStart}T${formData.timeStart}`),
        end: new Date(`${formData.dateEnd}T${formData.timeEnd}`),
        name: formData.name,
        vorname: formData.firstName,
        kunde: formData.kunde,
        fahrzeug: formData.vehicle,
        preis: formData.preis,
        km: formData.freiKm,
        telNr: formData.phoneNumber || null, // Telefonnummer hinzufügen
        description: formData.info || null, // Beschreibung hinzufügen
        abgerechnet: false, // Standardwert für Abrechnung
      });
      console.log("Event erfolgreich erstellt!");
    } catch (error) {
      console.error("Fehler beim Erstellen des Events:", error);
    }
  };
let clickTimeout;

const handleSelectSlot = ({ start, end }) => {
  if (isAnyModalOpen()) return;

  setDayEvents(
    events.filter(
      (event) =>
        event.start <= end && event.end >= start // Filtert Events, die in den ausgewählten Zeitraum fallen
    )
  );
  setIsDayEventsModalOpen(true);
  if (clickTimeout) {
    clearTimeout(clickTimeout);
    clickTimeout = null;
    handleDoubleClickSlot({ start, end }); // Doppelklick-Funktion aufrufen
  } else {
    clickTimeout = setTimeout(() => {
      console.log("Einfacher Klick auf den Tag erkannt");
      setDayEvents(events.filter(event => event.start <= end && event.end >= start));
      setIsDayEventsModalOpen(true);
      clickTimeout = null;
    }, 300); // Wartezeit für Doppelklick
  }
};

const handleDoubleClickSlot = ({ start, end }) => {
 

  console.log("Doppelklick auf den Tag erkannt");
  setIsDayEventsModalOpen(false);
  setIsEventModalOpen(false);
  setModalStartDate(start);
  setModalEndDate(end);
  setIsModalOpen(true);
};

const handleRangeChange = (range) => {
    // Überprüfe, ob die Anzahl der Events die Anzeigegrenze überschreitet
    const visibleEvents = events.filter(
      (event) =>
        event.start >= range.start && event.end <= range.end
    );

    if (visibleEvents.length > 10) {
      
      setIsDayEventsModalOpen(true);
    }
  };

useEffect(() => {
 
}, [isModalOpen, isEventModalOpen, isDayEventsModalOpen]);


  return (
    <div style={{ height: '80vh', margin: '5px', width: '90vw' }}>
      <Calendar
        localizer={localizer}
        date={currentDate}
        onNavigate={(newDate) => setCurrentDate(newDate)}
        events={events} // Die geladenen Events aus Firebase
        startAccessor="start"
        endAccessor="end"
        selectable
        views={['day', 'week', 'month']}
        onSelectSlot={handleSelectSlot} // Einfacher Klick
        onDoubleClickEvent={handleDoubleClickSlot} // Doppelklick
        onSelectEvent={handleSelectSlot}
        onRangeChange={handleRangeChange}
        onShowMore={(events, date) => {
          setDayEvents(events);
          setIsDayEventsModalOpen(true);
        }}
        components={{
          toolbar: (props) => (
            <CustomToolbar
              {...props}
              date={currentDate}
              onDateChange={setCurrentDate}
              onNewEvent={openModal} // Binde das Modal-Öffnen an den neuen Button
            />
          ),
          
        }}
        formats={{
          weekdayFormat: (date) => format(date, 'EEEE', { locale: de }),
        }}
        style={{ height: '100%' }}
      />

      {/* Modal for Adding Events */}
      <Modal
  isOpen={isModalOpen}
  onRequestClose={closeModal}
  style={{
    overlay: {
      zIndex: 10,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      padding: '20px',
      borderRadius: '10px',
      width: '75vw',
      height: 'auto',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
      backgroundColor: 'white',
    },
  }}
>
 
  {isModalOpen}
  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-20px', marginRight: '-20px' }}>
    <button
      onClick={closeModal}
      style={{
        backgroundColor: 'red',
        width: '40px',
        height: '40px',
        color: 'white',
        border: 'none',
        fontSize: '28px',
        cursor: 'pointer',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      &times;
    </button>
  </div>

  <FormTermin
    initialStartDate={modalStartDate}
    initialEndDate={modalEndDate}
    onSubmit={handleFormSubmit}
    onClose={closeModal}
  />
</Modal>

{/* Event-Details-Modal */}
<Modal
  isOpen={isEventModalOpen}
  onRequestClose={closeEventModal}
  style={{
    overlay: {
      zIndex: 11,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    content: {
      zIndex: 1000,
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      padding: '20px',
      borderRadius: '10px',
      width: '60vw',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
      backgroundColor: 'white',
    },
  }}
>
  
  {isEventModalOpen}
  <EventDetailsModalUser
    event={selectedEvent}
    onClose={closeEventModal}
  />
</Modal>

{/* Tagesübersicht-Modal */}
<Modal
  isOpen={isDayEventsModalOpen}
  onRequestClose={() => {
    setIsDayEventsModalOpen(false);
    loadEvents();
  }}
  style={{
    overlay: {
      zIndex: 10,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      padding: '20px',
      borderRadius: '10px',
      width: '90vw',
      height: 'auto',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
      backgroundColor: 'white',
    },
  }}
>
  {/* Hier wird die DayEventsModalUser-Komponente eingebunden */}
  <DayEventsModalUser
    events={dayEvents} // Übergibt die Events, die im Modal angezeigt werden sollen
    onClose={() => {
      setIsDayEventsModalOpen(false); // Schließt das Modal
      loadEvents(); // Lädt die Events neu
    }}
    onUpdate={loadEvents} // Funktion zum Aktualisieren der Events
    isEventModalOpen={isEventModalOpen} // Zustand für das Event-Details-Modal
    setIsEventModalOpen={setIsEventModalOpen} // Funktion zum Öffnen/Schließen des Event-Details-Modals
    fetchEventDetails={fetchEventDetails} // Funktion zum Abrufen der Event-Details
    setSelectedEvent={setSelectedEvent} // Funktion zum Setzen des ausgewählten Events
    setIsModalOpen={setIsModalOpen} // Funktion zum Schließen des Hauptmodals
    setIsDayEventsModalOpen={setIsDayEventsModalOpen} // Funktion zum Schließen des DayEvents-Modals
/>
</Modal>

    </div>
  );
};

export default CalendarComponent;

