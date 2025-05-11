import React, { useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/de';

import DatePicker, { registerLocale } from 'react-datepicker';
import { de } from 'date-fns/locale';
import { format } from 'date-fns';
import 'react-datepicker/dist/react-datepicker.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './css/Calendar.css';

import Modal from 'react-modal'; // Installiere react-modal mit `npm install react-modal`
import FormTermin from './FormTermin'; // Importiere deine FormTermin-Komponente

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
  const newEvent = (newEvent) => {
    onNewEvent();
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
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSelectSlot = ({ start, end }) => {
    const title = window.prompt('Titel des Termins:');
    if (title) {
      setEvents([...events, { start, end, title }]);
    }
  };

  const handleSelectEvent = (event) => {
    alert(`Termin: ${event.title}`);
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleFormSubmit = (newEvent) => {
    // Füge das neue Event hinzu
    setEvents([...events, newEvent]);
    closeModal();
  };

  return (
    <div style={{ height: '80vh', margin: '5px', width: '90vw' }}>
      <Calendar
        localizer={localizer}
        date={currentDate}
        onNavigate={(newDate) => setCurrentDate(newDate)}
        events={events}
        startAccessor="start"
        endAccessor="end"
        selectable
        views={['day', 'week', 'month']}
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
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
            zIndex: 1000,
            backgroundColor: 'rgba(0, 0, 0, 0.5)', // Dunkler, halbtransparenter Hintergrund
          },
          content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)', // Zentriert das Modal
            padding: '20px',
            borderRadius: '10px',
            width: '400px',
            height: 'auto',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
            backgroundColor: 'white',
          },
        }}
      >
        {/* Schließen-Button oben */}
        <div style={{ display: 'flex', justifyContent: 'flex-end',marginTop:'-20px',marginRight:'-20px',  }}>

        <button
  onClick={closeModal}
  style={{
    backgroundColor: 'red', // Hintergrundfarbe des Buttons
    width: '40px',
    height: '40px',
    color: 'white',
    border: 'none',
    fontSize: '28px',
    cursor: 'pointer',
    display: 'flex', // Flexbox aktivieren
    justifyContent: 'center', // Horizontal zentrieren
    alignItems: 'center', // Vertikal zentrieren
  }}
>
  &times;
</button>
</div>

        {/* Formular-Komponente */}
        <FormTermin onSubmit={handleFormSubmit} />
      </Modal>
    </div>
  );
};

export default CalendarComponent;
