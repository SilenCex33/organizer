import { getFirestore, collection, getDocs } from "firebase/firestore"; // Firebase-Import

// Mapping von Gruppen zu Kategorien
export const groupToCategory = {
  A: "PKW klein",
  B: "PKW mittel",
  CPKW: "PKW groß/7-Sitzer",
  DPKW: "9-Sitzer klein",
  EPKW: "9-Sitzer groß",
  C: "Transporter kurz",
  D: "Transporter lang",
  E: "Transporter extra lang",
  F: "LKW 3,5t",
  G: "LKW 7,5t",
  APK: "Anhänger Plane klein",
  APG: "Anhänger Plane groß",
  AK: "Anhänger Koffer",
  AP: "Anhänger Pritsche",
  AAT: "Anhänger Autotrailer",
};

export const categoryOrder = [
  { category: "PKW klein", groups: ["A"] },
  { category: "PKW mittel", groups: ["B"] },
  { category: "PKW groß/7-Sitzer", groups: ["CPKW"] },
  { category: "9-Sitzer klein", groups: ["DPKW"] },
  { category: "9-Sitzer groß", groups: ["EPKW"] },
  { category: "Transporter kurz", groups: ["C"] },
  { category: "Transporter lang", groups: ["D"] },
  { category: "Transporter extra lang", groups: ["E"] },
  { category: "LKW 3,5t", groups: ["F"] },
  { category: "LKW 7,5t", groups: ["G"] },
  { category: "Anhänger Plane klein", groups: ["APK"] },
  { category: "Anhänger Plane groß", groups: ["APG"] },
  { category: "Anhänger Koffer", groups: ["AK"] },
  { category: "Anhänger Pritsche", groups: ["AP"] },
  { category: "Anhänger Autotrailer", groups: ["AAT"] },
  { category: "Sonstige", groups: [] }, // Standardkategorie
];

// Funktion zum Abrufen der Fahrzeuge aus Firestore
export const fetchVehicles = async () => {
  const db = getFirestore(); // Firebase-Datenbank initialisieren
  const vehiclesCollection = collection(db, "vehicles"); // Sammlung "vehicles" abrufen

  try {
    const snapshot = await getDocs(vehiclesCollection); // Daten abrufen
    const vehicles = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(), // Alle Felder des Dokuments extrahieren
    }));

    console.log("Fetched Vehicles:", vehicles); // Debugging
    return vehicles; // Fahrzeuge zurückgeben
  } catch (error) {
    console.error("Fehler beim Abrufen der Fahrzeugdaten:", error);
    return [];
  }
};

// Funktion zum Gruppieren der Fahrzeuge nach Kategorien
export const mapGroupsToCategories = (vehicles) => {
  const categorizedVehicles = {};

  // Gruppiere die Fahrzeuge nach Kategorien basierend auf `categoryOrder`
  categoryOrder.forEach(({ category, groups }) => {
    categorizedVehicles[category] = vehicles.filter((vehicle) =>
      groups.includes(vehicle.group)
    );
  });

  // Füge Fahrzeuge hinzu, die keiner definierten Gruppe entsprechen, zur Kategorie "Sonstige"
  const remainingVehicles = vehicles.filter(
    (vehicle) =>
      !categoryOrder.some(({ groups }) => groups.includes(vehicle.group))
  );
  if (remainingVehicles.length > 0) {
    categorizedVehicles["Sonstige"] = remainingVehicles;
  }

  return categorizedVehicles;
};

export const fetchAndCategorizeVehicles = async (formData, groupToCategory, databaseName) => {
  const vehicles = await fetchVehicles(); // Fahrzeuge abrufen
  const categorizedVehicles = mapGroupsToCategories(vehicles); // Fahrzeuge kategorisieren
  return categorizedVehicles;
};