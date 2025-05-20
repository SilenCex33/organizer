import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase"; // Firestore-Instanz importieren

/**
 * Prüft, ob ein Fahrzeug in einem bestimmten Zeitraum belegt ist.
 * @param {string} vehicleId - Die ID des Fahrzeugs.
 * @param {Date} formStart - Startzeit des Formulars.
 * @param {Date} formEnd - Endzeit des Formulars.
 * @returns {Promise<boolean>} - Gibt `true` zurück, wenn ein Konflikt vorliegt, sonst `false`.
 */
export const isVehicleConflicting = async (vehicleId, formStart, formEnd) => {
  try {
    // Abrufen aller bestehenden Buchungen aus der Collection "events"
    const bookingsSnapshot = await getDocs(collection(db, "events"));
    const bookings = bookingsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Prüfen, ob es Konflikte gibt
    return bookings.some((booking) => {
      const bookingStart = booking.start.toDate(); // Firestore-Timestamp in JavaScript-Datum umwandeln
      const bookingEnd = booking.end.toDate(); // Firestore-Timestamp in JavaScript-Datum umwandeln

      return (
        booking.fahrzeug === vehicleId && // Fahrzeug-IDs müssen übereinstimmen
        ((formStart >= bookingStart && formStart < bookingEnd) || // Startzeit liegt im Buchungszeitraum
          (formEnd > bookingStart && formEnd <= bookingEnd) || // Endzeit liegt im Buchungszeitraum
          (formStart <= bookingStart && formEnd >= bookingEnd)) // Buchungszeitraum liegt vollständig innerhalb
      );
    });
  } catch (error) {
    console.error("Fehler beim Prüfen von Konflikten:", error);
    return false; // Im Fehlerfall keinen Konflikt melden
  }
};

/**
 * Kategorisiert Fahrzeuge und prüft Konflikte.
 * @param {Object} formData - Die Formulardaten mit Start- und Endzeit.
 * @param {Object} groupToCategory - Mapping von Gruppen zu Kategorien.
 * @returns {Promise<Object>} - Gibt ein Objekt mit kategorisierten Fahrzeugen zurück.
 */
export const fetchAndCategorizeVehicles = async (formData, groupToCategory) => {
  try {
    // Abrufen aller Fahrzeuge aus der Collection "vehicles"
    const querySnapshot = await getDocs(collection(db, "vehicles"));

    const categories = {};
    const formStart = new Date(`${formData.dateStart}T${formData.timeStart}`);
    const formEnd = new Date(`${formData.dateEnd}T${formData.timeEnd}`);

    for (const doc of querySnapshot.docs) {
      const data = doc.data();
      const group = data.group; // Annahme: "group" ist ein Feld im Dokument
      const category = groupToCategory[group] || "Sonstige"; // Fallback zu "Sonstige", wenn keine Kategorie passt

      if (!categories[category]) {
        categories[category] = [];
      }

      // Konfliktprüfung
      const isConflicting = await isVehicleConflicting(doc.id, formStart, formEnd);

      // Fahrzeug zur richtigen Kategorie hinzufügen
      categories[category].push({ id: doc.id, ...data, isConflicting });
    }

    return categories;
  } catch (error) {
    console.error("Fehler beim Abrufen und Kategorisieren der Fahrzeuge:", error);
    return {};
  }
};