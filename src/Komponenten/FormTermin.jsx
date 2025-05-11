import React, { useState, useEffect } from 'react';
import { collection, doc, getDocs, getDoc, addDoc } from 'firebase/firestore'; // Importiere Firestore-Funktionen
import { db } from '../firebase'; // Firestore-Instanz importieren

function SimpleForm() {
  // State für Formulardaten
  const [formData, setFormData] = useState({
    vehicle: '', // Fahrzeug wird hier gespeichert
    option: '',
    name: '',
    firstName: '',
    phoneNumber: '',
    dateStart: '',
    dateEnd: '',
    timeStart: '',
    timeEnd: '',
  });

  // State für die kategorisierten Fahrzeuglisten
  const [categorizedVehicles, setCategorizedVehicles] = useState({});
  const [priceDetails, setPriceDetails] = useState({
    preis: 0,
    inklusiveKm: 0,
  });
  const [kmPackets, setKmPackets] = useState([]);

  // Mapping von Gruppen zu Kategorien
  const groupToCategory = {
    a: "PKW klein",
    b: "PKW mittel",
    cpkw: "PKW groß/7-Sitzer",
    dpkw: "9-Sitzer klein",
    epkw: "9-Sitzer groß",
    c:"Transporter kurz",
    d:"Transporter lang",
    e:"Transporter extra lang",
    f:"LKW 3,5t",
    g:"LKW 7,5t",
    apk:"Anhänger Plane klein",
    apg:"Anhänger Plane groß",
    ak:"Anhänger Koffer",
    ap:"Anhänger Pritsche",
    aat:"Anhänger Autotrailer",
  };

  // Fahrzeuge aus Firestore laden und kategorisieren
  useEffect(() => {
    const fetchAndCategorizeVehicles = async () => {
      try {
        // Abrufen aller Dokumente aus der Sammlung "vehiclesBooking"
        const querySnapshot = await getDocs(collection(db, 'vehiclesBooking'));

        // Fahrzeuge basierend auf ihrer Gruppe kategorisieren
        const categories = {};
        querySnapshot.docs.forEach((doc) => {
          const data = doc.data();
          const group = data.group; // Annahme: "group" ist ein Feld im Dokument
          const category = groupToCategory[group] || "Sonstige"; // Fallback zu "Sonstige", wenn keine Kategorie passt

          if (!categories[category]) {
            categories[category] = [];
          }

          // Fahrzeug zur richtigen Kategorie hinzufügen
          categories[category].push({ id: doc.id, ...data });
        });

        setCategorizedVehicles(categories); // Kategorisierte Fahrzeuge im State speichern
      } catch (error) {
        console.error('Fehler beim Abrufen und Kategorisieren der Fahrzeuge:', error);
      }
    };

    fetchAndCategorizeVehicles();
  }, []); // Läuft nur einmal beim Laden der Komponente

  // Änderungen in den Eingabefeldern verfolgen
  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === 'vehicle' && value) {
      try {
        // Fahrzeugdetails aus Firebase abrufen
        const vehicleDoc = await getDoc(doc(db, "vehiclesBooking", value));
        if (!vehicleDoc.exists()) {
          console.error("Fahrzeug nicht gefunden.");
          setKmPackets([]);
          return;
        }
  
        const group = vehicleDoc.data()?.group; // Gruppe des Fahrzeugs
        if (!group) {
          console.error("Fahrzeuggruppe nicht definiert.");
          setKmPackets([]);
          return;
        }
  
        // Kilometerdaten abrufen
        const kmDocRef = doc(db, "km", group);
        const kmDocSnap = await getDoc(kmDocRef);
        if (!kmDocSnap.exists()) {
          console.error(`Kilometerdaten für Gruppe ${group} nicht gefunden.`);
          setKmPackets([]);
          return;
        }
  
        const kmData = kmDocSnap.data();
  
        // Nur Felder, die mit "km+" beginnen, extrahieren
        const kmPlusFields = Object.entries(kmData)
          .filter(([key]) => key.startsWith("km+"))
          .map(([key, value]) => ({ key, value }));
  
        setKmPackets(kmPlusFields); // Km-Packet-Daten setzen
      } catch (error) {
        console.error("Fehler beim Abrufen der Km-Packets:", error);
        setKmPackets([]);
      }
    }
  };

  const calculatePriceAndKm = async () => {
    try {
      // Sicherstellen, dass alle erforderlichen Eingabedaten vorhanden sind
      if (!formData.vehicle || !formData.dateStart || !formData.timeStart || !formData.dateEnd || !formData.timeEnd) {
        console.error("Fehlende Eingabedaten für die Berechnung.");
        return;
      }
  
      // Start- und Endzeit erstellen
      const start = new Date(`${formData.dateStart}T${formData.timeStart}`);
      const end = new Date(`${formData.dateEnd}T${formData.timeEnd}`);
  
      // Sicherstellen, dass start und end gültige Date-Objekte sind
      if (isNaN(start) || isNaN(end)) {
        console.error("Ungültige Datums- oder Zeitangaben.");
        return;
      }
  
      // Prüfen, ob die Endzeit vor der Startzeit liegt
      const diffInMs = end - start;
      if (diffInMs < 0) {
        console.error("Endzeit liegt vor der Startzeit. Bitte korrigieren.");
        return;
      }
  
      const diffInHours = Math.ceil(diffInMs / (1000 * 60 * 60)); // Zeitdifferenz in Stunden berechnen
      const totalDays = Math.floor(diffInHours / 24); // Ganze Tage
      const remainingHours = diffInHours % 24; // Übriggebliebene Stunden
  
      console.log("Zeitdifferenz (in Stunden):", diffInHours);
      console.log("Tage:", totalDays, " | Zusätzliche Stunden:", remainingHours);
  
      // Fahrzeuggruppe ermitteln
      const vehicleDoc = await getDoc(doc(db, "vehiclesBooking", formData.vehicle));
      if (!vehicleDoc.exists()) {
        console.error("Fahrzeug nicht gefunden.");
        return;
      }
  
      const group = vehicleDoc.data()?.group;
      if (!group) {
        console.error("Fahrzeuggruppe nicht definiert.");
        return;
      }
  
      console.log("Fahrzeuggruppe:", group);
  
      // Preis aus Firebase abrufen
      const pricesDocRef = doc(db, "prices", group);
      const pricesDocSnap = await getDoc(pricesDocRef);
      if (!pricesDocSnap.exists()) {
        console.error(`Preisdokument für Gruppe ${group} nicht gefunden.`);
        return;
      }
  
      const pricesData = pricesDocSnap.data();
      let basePrice = 0;
  
      console.log("Preise aus Firebase geladen:", pricesData);
  
      // Kilometer aus Firebase abrufen
      const kmDocRef = doc(db, "km", group);
      const kmDocSnap = await getDoc(kmDocRef);
      if (!kmDocSnap.exists()) {
        console.error(`Kilometerdokument für Gruppe ${group} nicht gefunden.`);
        return;
      }
  
      const kmData = kmDocSnap.data();
      let includedKm = 0;
  
      console.log("Kilometerdaten aus Firebase geladen:", kmData);
  
      // Fixe Preise und Kilometer verwenden, wenn die Mietdauer exakt passt
      if (diffInHours === 1) {
        basePrice = pricesData["1h"] ?? 0;
        includedKm = kmData["1h"] ?? 0;
        console.log("Angewendeter Tarif: 1h =", basePrice, " | Inklusive Kilometer:", includedKm);
      } else if (diffInHours === 5) {
        basePrice = pricesData["5h"] ?? 0;
        includedKm = kmData["5h"] ?? 0;
        console.log("Angewendeter Tarif: 5h =", basePrice, " | Inklusive Kilometer:", includedKm);
      } else if (diffInHours === 24) {
        basePrice = pricesData["24h"] ?? 0;
        includedKm = kmData["24h"] ?? 0;
        console.log("Angewendeter Tarif: 24h =", basePrice, " | Inklusive Kilometer:", includedKm);
      } else if (totalDays === 7 && remainingHours === 0) {
        basePrice = pricesData["7d"] ?? 0;
        includedKm = kmData["7d"] ?? 0;
        console.log("Angewendeter Tarif: 7d =", basePrice, " | Inklusive Kilometer:", includedKm);
      } else if (totalDays === 30 && remainingHours === 0) {
        basePrice = pricesData["30d"] ?? 0;
        includedKm = kmData["30d"] ?? 0;
        console.log("Angewendeter Tarif: 30d =", basePrice, " | Inklusive Kilometer:", includedKm);
      } else {
        // Dynamische Berechnung für Zwischenwerte
        if (diffInHours < 5) {
          // Dynamische Berechnung für Stunden zwischen 2h und 4h
          basePrice = pricesData["1h"] ?? 0; // Erste Stunde
          includedKm = kmData["1h"] ?? 0; // Kilometer für die erste Stunde
          basePrice += (diffInHours - 1) * (pricesData["1h+"] ?? 0); // Zusätzliche Stunden
          includedKm += (diffInHours - 1) * (kmData["1h+"] ?? 0); // Kilometer für zusätzliche Stunden
          console.log(
            `Preisberechnung: 1h = ${pricesData["1h"] ?? 0} + (${diffInHours - 1}x 1h+ = ${
              (diffInHours - 1) * (pricesData["1h+"] ?? 0)
            })`
          );
          console.log(
            `Kilometerberechnung: 1h = ${kmData["1h"] ?? 0} + (${diffInHours - 1}x 1h+ = ${
              (diffInHours - 1) * (kmData["1h+"] ?? 0)
            })`
          );
        } else if (diffInHours < 24) {
          // Dynamische Berechnung für Stunden zwischen 6h und 23h
          basePrice = pricesData["5h"] ?? 0; // Fixpreis für 5 Stunden
          includedKm = kmData["5h"] ?? 0; // Kilometer für 5 Stunden
          basePrice += (diffInHours - 5) * (pricesData["1h+"] ?? 0); // Zusätzliche Stunden
          includedKm += (diffInHours - 5) * (kmData["1h+"] ?? 0); // Kilometer für zusätzliche Stunden
          console.log(
            `Preisberechnung: 5h = ${pricesData["5h"] ?? 0} + (${diffInHours - 5}x 1h+ = ${
              (diffInHours - 5) * (pricesData["1h+"] ?? 0)
            })`
          );
          console.log(
            `Kilometerberechnung: 5h = ${kmData["5h"] ?? 0} + (${diffInHours - 5}x 1h+ = ${
              (diffInHours - 5) * (kmData["1h+"] ?? 0)
            })`
          );
        } else {
          // Dynamische Berechnung für Tage
          if (totalDays > 0) {
            basePrice += totalDays * (pricesData["24h"] ?? 0);
            includedKm += totalDays * (kmData["24h"] ?? 0);
            console.log(`+ ${totalDays}x 24h = ${totalDays * (pricesData["24h"] ?? 0)}`);
            console.log(`+ ${totalDays}x 24h = ${totalDays * (kmData["24h"] ?? 0)} km`);
          }
  
          if (remainingHours > 0) {
            basePrice += pricesData["1h"] ?? 0; // Erste Stunde
            includedKm += kmData["1h"] ?? 0; // Kilometer für die erste Stunde
            basePrice += (remainingHours - 1) * (pricesData["1h+"] ?? 0); // Zusätzliche Stunden
            includedKm += (remainingHours - 1) * (kmData["1h+"] ?? 0); // Kilometer für zusätzliche Stunden
            console.log(
              `+ 1h = ${pricesData["1h"] ?? 0} + (${remainingHours - 1}x 1h+ = ${
                (remainingHours - 1) * (pricesData["1h+"] ?? 0)
              })`
            );
            console.log(
              `+ 1h = ${kmData["1h"] ?? 0} + (${remainingHours - 1}x 1h+ = ${
                (remainingHours - 1) * (kmData["1h+"] ?? 0)
              }) km`
            );
          }
        }
      }
  
      console.log("Endpreis:", basePrice.toFixed(2));
      console.log("Inklusive Kilometer:", includedKm);
      setPriceDetails({ preis: basePrice.toFixed(2), inklusiveKm: includedKm });
    } catch (error) {
      console.error("Fehler bei der Berechnung von Preis und Kilometer:", error);
    }
  };

  const calculatePrice = async () => {
    if (!startDate || !endDate) {
      console.warn("Startzeit oder Endzeit fehlt.");
      return;
    }
  
    // Prüfen, ob die Eingaben gültige Datumsobjekte sind
    if (!(startDate instanceof Date) || !(endDate instanceof Date) || isNaN(startDate) || isNaN(endDate)) {
      console.error("Ungültige Datumswerte.");
      return;
    }
  
    // Zeitdifferenz berechnen
    const diffInMs = endDate.getTime() - startDate.getTime();
    if (diffInMs < 0) {
      console.warn("Endzeit liegt vor Startzeit.");
      return;
    }
  
    const totalHours = Math.ceil(diffInMs / (1000 * 60 * 60)); // Gesamtstunden
    const totalDays = Math.floor(totalHours / 24); // Ganze Tage
    const remainingHours = totalHours % 24; // Übriggebliebene Stunden
  
    console.log("Startzeit:", startDate);
    console.log("Endzeit:", endDate);
    console.log("Gesamtstunden:", totalHours);
    console.log("Tage:", totalDays, " | Zusätzliche Stunden:", remainingHours);
  
    // Preise aus Firebase abrufen
    const pricesDocRef = doc(db, "preise", "preise");
    const pricesDocSnap = await getDoc(pricesDocRef);
  
    if (!pricesDocSnap.exists()) {
      console.warn("Keine Preisdaten gefunden.");
      return;
    }
  
    const prices = pricesDocSnap.data();
    let basePrice = 0;
  
    // Tarifberechnung
    if (totalHours <= 1) {
      basePrice = prices["1h"] ?? 0;
      console.log("Angewendeter Tarif: 1h =", basePrice);
    } else if (totalHours <= 5) {
      basePrice = prices["5h"] ?? 0;
      console.log("Angewendeter Tarif: 5h =", basePrice);
    } else if (totalHours <= 24) {
      basePrice = prices["24h"] ?? 0;
      console.log("Angewendeter Tarif: 24h =", basePrice);
    } else if (totalDays < 7) {
      basePrice = prices["7d"] ?? 0;
      console.log("Angewendeter Tarif: 7d =", prices["7d"]);
  
      // Zusätzliche Tage und Stunden berechnen
      const extraDayPrice = totalDays * (prices["24h"] ?? 0);
      const extraHourPrice = remainingHours * (prices["1h+"] ?? 0);
  
      basePrice += extraDayPrice + extraHourPrice;
  
      console.log(`+ ${totalDays}x 24h = ${extraDayPrice}`);
      console.log(`+ ${remainingHours}x 1h+ = ${extraHourPrice}`);
    } else if (totalDays < 30) {
      basePrice = prices["30d"] ?? 0;
      console.log("Angewendeter Tarif: 30d =", prices["30d"]);
  
      // Zusätzliche Tage und Stunden berechnen
      const extraDayPrice = (totalDays - 7) * (prices["24h"] ?? 0);
      const extraHourPrice = remainingHours * (prices["1h+"] ?? 0);
  
      basePrice += extraDayPrice + extraHourPrice;
  
      console.log(`+ ${totalDays - 7}x 24h = ${extraDayPrice}`);
      console.log(`+ ${remainingHours}x 1h+ = ${extraHourPrice}`);
    } else {
      basePrice = prices["30d"] ?? 0;
      console.log("Tarif über 30d, Basispreis:", basePrice);
  
      // Zusätzliche Tage und Stunden berechnen
      const extraDayPrice = (totalDays - 30) * (prices["24h"] ?? 0);
      const extraHourPrice = remainingHours * (prices["1h+"] ?? 0);
  
      basePrice += extraDayPrice + extraHourPrice;
  
      console.log(`+ ${totalDays - 30}x 24h = ${extraDayPrice}`);
      console.log(`+ ${remainingHours}x 1h+ = ${extraHourPrice}`);
    }
  
    console.log("Endpreis:", basePrice.toFixed(2));
    setTotalPrice(basePrice.toFixed(2)); // Setze den berechneten Preis
  };

  useEffect(() => {
    if (
      formData.vehicle && // Fahrzeug ist ausgewählt
      formData.dateStart && // Startdatum ist eingegeben
      formData.timeStart && // Startzeit ist eingegeben
      formData.dateEnd && // Enddatum ist eingegeben
      formData.timeEnd // Endzeit ist eingegeben
    ) {
      calculatePriceAndKm(); // Preise und Kilometer neu berechnen
    }
  }, [
    formData.vehicle, // Abhängig von der Fahrzeugauswahl
    formData.dateStart, // Abhängig vom Startdatum
    formData.timeStart, // Abhängig von der Startzeit
    formData.dateEnd, // Abhängig vom Enddatum
    formData.timeEnd, // Abhängig von der Endzeit
  ]);

  // Formular absenden
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent form from reloading the page

    try {
      // Prepare the data to be saved in Firebase
      const eventData = {
        Abgerechnet: false, // Default to false
        Datumende: formData.dateEnd,
        Datumstart: formData.dateStart,
        Fahrzeug: formData.vehicle,
        Km: priceDetails.inklusiveKm, // Add logic to calculate or input this value
        KmPacket: "", // Add logic to calculate or input this value
        Kunde: formData.option,
        Name: formData.name,
        Preis: priceDetails.preis, // Use the calculated price
        TelNr: formData.phoneNumber,
        Vorname: formData.firstName,
        Zeitende: formData.timeEnd,
        Zeitstart: formData.timeStart,
      };
  
      // Add a new document with the event data to the "events" collection
      const docRef = await addDoc(collection(db, "events"), eventData);
  
      console.log("Neues Event angelegt mit ID:", docRef.id);
      alert("Das Event wurde erfolgreich erstellt!");
    } catch (error) {
      console.error("Fehler beim Anlegen des Events:", error);
      alert("Fehler beim Anlegen des Events. Bitte versuchen Sie es erneut.");
    }
  };
  const formatDate = (date) => {
    if (!date) return ''; // Wenn kein Datum vorhanden ist, leere Zeichenkette zurückgeben
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Intl.DateTimeFormat('de-DE', options).format(new Date(date));
  };
  const formatTime = (time) => {
    if (!time) return ''; // Wenn keine Zeit vorhanden ist, leere Zeichenkette zurückgeben
    return time; // Zeit im HH:mm-Format direkt zurückgeben
  };
  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">Termin erstellen</h2>
      <form onSubmit={handleSubmit}>
        {/* Dropdown-Menü für die Auswahl */}
        <div className="mb-3">
          <label htmlFor="dropdown" className="form-label">Kunde</label>
          <select
            className="form-select"
            id="dropdown"
            name="option"
            value={formData.option}
            onChange={handleInputChange}
            required
          >
            <option value="">Bitte auswählen</option>
            <option value="privat">Privat</option>
            <option value="geschäftlich">Geschäftlich</option>
          </select>
        </div>

        {/* Eingabefelder */}
        <div className="row mb-3">
          <div className="col-6">
            <label htmlFor="name" className="form-label">Name</label>
            <input
              type="text"
              className="form-control"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="col-6">
            <label htmlFor="firstName" className="form-label">Vorname</label>
            <input
              type="text"
              className="form-control"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>
        <div className="col-12">
          <label htmlFor="phoneNumber" className="form-label">Telefonnummer</label>
          <input
            type="text"
            className="form-control"
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="row mt-3">
          <div className="col-6">
            <label htmlFor="dateStart" className="form-label">Datum Start</label>
            <input
              type="date"
              className="form-control"
              id="dateStart"
              name="dateStart"
              value={formData.dateStart}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="col-6">
            <label htmlFor="dateEnd" className="form-label">Datum Ende</label>
            <input
              type="date"
              className="form-control"
              id="dateEnd"
              name="dateEnd"
              value={formData.dateEnd}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>
        <div className="row mt-3">
          <div className="col-6">
            <label htmlFor="timeStart" className="form-label">Uhrzeit Start</label>
            <input
              type="time"
              className="form-control"
              id="timeStart"
              name="timeStart"
              value={formData.timeStart}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="col-6">
            <label htmlFor="dateEnd" className="form-label">Uhrzeit Ende</label>
            <input
              type="time"
              className="form-control"
              id="timeEnd"
              name="timeEnd"
              value={formData.timeEnd}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>
        <div className="col-12 mt-3">
          <label htmlFor="vehicle" className="form-label">Fahrzeug</label>
          <select
            className="form-select"
            id="vehicle"
            name="vehicle"
            value={formData.vehicle}
            onChange={handleInputChange}
            required
          >
            <option value="" >Fahrzeug wählen...</option>
            {/* Iteriere über die Kategorien in der Reihenfolge von groupToCategory */}
            {Object.keys(groupToCategory).map((groupKey) => {
              const category = groupToCategory[groupKey];
              const vehicles = categorizedVehicles[category] || [];

              // Wenn keine Fahrzeuge in der Kategorie, überspringen
              if (vehicles.length === 0) return null;

              return (
                <optgroup key={category} label={category}>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.id} {/* Zeige die Dokument-ID oder andere Fahrzeugdetails an */}
                    </option>
                  ))}
                </optgroup>
              );
            })}
          </select>
        </div>
        

        <div className="mt-3 p-3 border rounded shadow-sm bg-light">
          <h4 className="text-danger">Preis/Inklusive Km</h4>
          <p className="mb-1"><strong>Preis:</strong> {priceDetails.preis} €</p>
          <p><strong>Inklusive Kilometer:</strong> {priceDetails.inklusiveKm} km</p>
        </div>

        <button type="submit" className="btn btn-primary mt-4">Absenden</button>
      </form>

      {/* Aktuelle Daten anzeigen */}
      {/* <div className="mt-4"> */}
        {/* <h3>Aktuelle Daten:</h3> */}
        {/* <div className="container"> */}
          {/* <p>Kunde: {formData.option}</p> */}
          {/* <div className="row"> */}
            {/* <div className="col-6"> */}
              {/* <p>Name: {formData.name}</p> */}
            {/* </div> */}
            {/* <div className="col-6"> */}
              {/* <p>Vorname: {formData.firstName}</p> */}
            {/* </div> */}
          {/* </div> */}
          {/* <div className="col-12"> */}
            {/* <p>Telefonnummer: {formData.phoneNumber}</p> */}
          {/* </div> */}
          {/* <div className="row"> */}
            {/* <div className="col-6"> */}
            {/* <p>Startdatum: {formatDate(formData.dateStart)}</p> */}
            {/* </div> */}
            {/* <div className="col-6"> */}
            {/* <p>Enddatum: {formatDate(formData.dateEnd)}</p> */}
            {/* </div> */}
          {/* </div> */}
          {/* <div className="row"> */}
            {/* <div className="col-6"> */}
            {/* <p>Startzeit: {formatTime(formData.timeStart)}</p> */}
            {/* </div> */}
            {/* <div className="col-6"> */}
            {/* <p>Endzeit: {formatTime(formData.timeEnd)}</p> */}
            {/* </div> */}
          {/* </div> */}
          {/* <div className='col-12'> */}
            {/* <p>Fahrzeug: {formData.vehicle}</p> */}
          {/* </div> */}
          {/*  */}
        {/* </div> */}
       {/* </div> */}
     </div>
  );
}

export default SimpleForm;