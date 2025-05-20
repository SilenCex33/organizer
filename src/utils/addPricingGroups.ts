import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase.js"; // dein Firebase-Setup

// Preislisten für private Fahrzeug-Mieter
const pricingGroupsPrivate = [
  {
    group: "A",
    type: "private",
    pricePerDay: 45,
    kmPerDay: 250,
    pricePerWeek: 225,
    kmPerWeek: 1000,
    pricePerMonth: 675,
    kmPerMonth: 4000,
    extraKmPrice: 0.15,
    extraKmPackages: [
      { km: 300, price: 40 },
      { km: 500, price: 60 },
      { km: 1000, price: 100 }
    ],
    isNetPrice: false,
  },
  {
    group: "B",
    type: "private",
    pricePerDay: 55,
    kmPerDay: 250,
    pricePerWeek: 275,
    kmPerWeek: 1000,
    pricePerMonth: 825,
    kmPerMonth: 4000,
    extraKmPrice: 0.20,
    extraKmPackages: [
      { km: 300, price: 50 },
      { km: 500, price: 75 },
      { km: 1000, price: 130 }
    ],
    isNetPrice: false,
  },
  {
    group: "CPKW",
    type: "private",
    pricePerDay: 65,
    kmPerDay: 250,
    pricePerWeek: 325,
    kmPerWeek: 1000,
    pricePerMonth: 975,
    kmPerMonth: 4000,
    extraKmPrice: 0.25,
    extraKmPackages: [
      { km: 300, price: 60 },
      { km: 500, price: 90 },
      { km: 1000, price: 150 }
    ],
    isNetPrice: false,
  },
  {
    group: "DPKW",
    type: "private",
    pricePerDay: 140,
    kmPerDay: 250,
    pricePerWeek: 700,
    kmPerWeek: 1000,
    pricePerMonth: 2100,
    kmPerMonth: 4000,
    extraKmPrice: 0.30,
    extraKmPackages: [
      { km: 400, price: 75 },
      { km: 800, price: 100 },
      { km: 1500, price: 170 }
    ],
    isNetPrice: false,
  },
  {
    group: "EPKW",
    type: "private",
    pricePerDay: 165,
    kmPerDay: 250,
    pricePerWeek: 825,
    kmPerWeek: 1000,
    pricePerMonth: 2475,
    kmPerMonth: 4000,
    extraKmPrice: 0.30,
    extraKmPackages: [
      { km: 400, price: 75 },
      { km: 800, price: 100 },
      { km: 1500, price: 170 }
    ],
    isNetPrice: false,
  },
    {
    group: "C",
    type: "private",
    pricePerHour: 25,
    kmPerHour: 20,
    pricePerFiveHours: 70,
    kmPerFiveHours: 60,
    pricePerExtraHour: 17.50,
    kmPerExtraHour: 20,
    pricePerDay: 120,
    kmPerDay: 100,
    pricePerWeek: 600,
    kmPerWeek: 1000,
    pricePerMonth: 1800,
    kmPerMonth: 4000,
    extraKmPrice: 0.25,
    extraKmPackages: [
      { km: 100, price: 25},
      { km: 300, price: 50 },
      { km: 500, price: 85 },
      { km: 1000, price: 160 }
    ],
    isNetPrice: false,
  },
  {
    group: "D",
    type: "private",
    pricePerHour: 30,
    kmPerHour: 20,
    pricePerFiveHours: 80,
    kmPerFiveHours: 60,
    pricePerExtraHour: 22.50,
    kmPerExtraHour: 20,
    pricePerDay: 130,
    kmPerDay: 100,
    pricePerWeek: 650,
    kmPerWeek: 1000,
    pricePerMonth: 1950,
    kmPerMonth: 4000,
    extraKmPrice: 0.30,
    extraKmPackages: [
      { km: 100, price: 30},
      { km: 300, price: 60 },
      { km: 500, price: 105 },
      { km: 1000, price: 190 }
    ],
    isNetPrice: false,
  },
  {
    group: "E",
    type: "private",
    pricePerHour: 35,
    kmPerHour: 20,
    pricePerFiveHours: 90,
    kmPerFiveHours: 60,
    pricePerExtraHour: 22.50,
    kmPerExtraHour: 20,
    pricePerDay: 150,
    kmPerDay: 100,
    pricePerWeek: 750,
    kmPerWeek: 1000,
    pricePerMonth: 2250,
    kmPerMonth: 4000,
    extraKmPrice: 0.35,
    extraKmPackages: [
      { km: 100, price: 35},
      { km: 300, price: 70 },
      { km: 500, price: 125 },
      { km: 1000, price: 220 }
    ],
    isNetPrice: false,
  },
  {
    group: "F",
    type: "private",
    pricePerHour: 35,
    kmPerHour: 20,
    pricePerFiveHours: 95,
    kmPerFiveHours: 60,
    pricePerExtraHour: 30,
    kmPerExtraHour: 20,
    pricePerDay: 160,
    kmPerDay: 100,
    pricePerWeek: 800,
    kmPerWeek: 1000,
    pricePerMonth: 2400,
    kmPerMonth: 4000,
    extraKmPrice: 0.40,
    extraKmPackages: [
      { km: 100, price: 40},
      { km: 300, price: 80 },
      { km: 500, price: 140 },
      { km: 1000, price: 250 }
    ],
    isNetPrice: false,
  },
  {
    group: "G",
    type: "private",
    pricePerHour: 40,
    kmPerHour: 20,
    pricePerFiveHours: 100,
    kmPerFiveHours: 60,
    pricePerExtraHour: 35.00,
    kmPerExtraHour: 20,
    pricePerDay: 225,
    kmPerDay: 100,
    pricePerWeek: 1125,
    kmPerWeek: 1000,
    pricePerMonth: 3375,
    kmPerMonth: 4000,
    extraKmPrice: 0.65,
    extraKmPackages: [
      { km: 100, price: 60},
      { km: 300, price: 170 },
      { km: 500, price: 240 },
      { km: 1000, price: 420 }
    ],
    isNetPrice: false,
  },
  {
    group: "APK",
    type: "private",
    pricePerFiveHours: 30,
    pricePerDay: 45,
    pricePerWeek: 225,
    pricePerMonth: 675,
    isNetPrice: false,
  },
  {
    group: "APG",
    type: "private",
    pricePerFiveHours: 35,
    pricePerDay: 55,
    pricePerWeek: 275,
    pricePerMonth: 825,
    isNetPrice: false,
  },
  {
    group: "AK",
    type: "private",
    pricePerFiveHours: 35,
    pricePerDay: 60,
    pricePerWeek: 300,
    pricePerMonth: 900,
    isNetPrice: false,
  },
  {
    group: "AP",
    type: "private",
    pricePerFiveHours: 30,
    pricePerDay: 45,
    pricePerWeek: 225,
    pricePerMonth: 675,
    isNetPrice: false,
  },
  {
    group: "AAT",
    type: "private",
    pricePerFiveHours: 50,
    pricePerDay: 85,
    pricePerWeek: 425,
    pricePerMonth: 1275,
    isNetPrice: false,
  },
];

async function addPricingGroupsPrivate() {
  try {
      console.log("Erstelle die Sammlung 'pricingGroupsPrivate'...");
    for (const group of pricingGroupsPrivate) {
      await setDoc(doc(db, "pricingGroupsPrivate", group.group), group);
      console.log(`Pricing group ${group.group} wurde erfolgreich hinzugefügt.`);
    }
  } catch (error) {
    console.error("Fehler beim Hinzufügen der Pricing Groups:", error);
  }
}

addPricingGroupsPrivate();

// Preislisten für Business-Kunden
const pricingGroupsBusiness = [
  {
    group: "A",
    type: "business",
    pricePerDay: 37.82,
    kmPerDay: 500,
    pricePerWeek: 189.10,
    kmPerWeek: 2000,
    pricePerMonth: 567.30,
    kmPerMonth: 8000,
    extraKmPrice: 0.10,
    extraKmPackages: [
      { km: 300, price: 20 },
      { km: 500, price: 35 },
      { km: 1000, price: 50 }
    ],
    isNetPrice: true,
  },
  {
    group: "B",
    type: "business",
    pricePerDay: 46.22,
    kmPerDay: 500,
    pricePerWeek: 231.10,
    kmPerWeek: 2000,
    pricePerMonth: 693.30,
    kmPerMonth: 8000,
    extraKmPrice: 0.15,
    extraKmPackages: [
      { km: 300, price: 30 },
      { km: 500, price: 45 },
      { km: 1000, price: 70 }
    ],
    isNetPrice: true,
  },
  {
    group: "CPKW",
    type: "business",
    pricePerDay: 54.63,
    kmPerDay: 500,
    pricePerWeek: 273.15,
    kmPerWeek: 2000,
    pricePerMonth: 819.45,
    kmPerMonth: 8000,
    extraKmPrice: 0.20,
    extraKmPackages: [
      { km: 300, price: 40 },
      { km: 500, price: 55 },
      { km: 1000, price: 90 }
    ],
    isNetPrice: true,
  },
  {
    group: "DPKW",
    type: "business",
    pricePerDay: 117.65,
    kmPerDay: 500,
    pricePerWeek: 588.25,
    kmPerWeek: 2000,
    pricePerMonth: 1764.75,
    kmPerMonth: 8000,
    extraKmPrice: 0.25,
    extraKmPackages: [
      { km: 300, price: 50 },
      { km: 500, price: 75 },
      { km: 1000, price: 125 }
    ],
    isNetPrice: true,
  },
  {
    group: "EPKW",
    type: "business",
    pricePerDay: 138.66,
    kmPerDay: 500,
    pricePerWeek: 690.30,
    kmPerWeek: 2000,
    pricePerMonth: 2070.90,
    kmPerMonth: 8000,
    extraKmPrice: 0.25,
    extraKmPackages: [
      { km: 300, price: 50 },
      { km: 500, price: 75 },
      { km: 1000, price: 125 }
    ],
    isNetPrice: true,
  },
  {
    group: "C",
    type: "business",
    pricePerFiveHours: 58.83,
    kmPerFiveHours: 100,
    pricePerExtraHour: 14.71,
    kmPerExtraHour: 20,
    pricePerDay: 100.84,
    kmPerDay: 200,
    pricePerWeek: 504.21,
    kmPerWeek: 1500,
    pricePerMonth: 1512.63,
    kmPerMonth: 4000,
    extraKmPrice: 0.21,
    extraKmPackages: [
      { km: 100, price: 21},
      { km: 300, price: 42 },
      { km: 500, price: 63 },
      { km: 1000, price: 105 }
    ],
    isNetPrice: true,
  },
  {
    group: "D",
    type: "business",
    pricePerFiveHours: 67.23,
    kmPerFiveHours: 100,
    pricePerExtraHour: 18.91,
    kmPerExtraHour: 20,
    pricePerDay: 109.25,
    kmPerDay: 200,
    pricePerWeek: 546.25,
    kmPerWeek: 1500,
    pricePerMonth: 1638.75,
    kmPerMonth: 4000,
    extraKmPrice: 0.26,
    extraKmPackages: [
      { km: 100, price: 26},
      { km: 300, price: 52 },
      { km: 500, price: 78 },
      { km: 1000, price: 130 }
    ],
    isNetPrice: true,
  },
  {
    group: "E",
    type: "business",
    pricePerFiveHours: 75.63,
    kmPerFiveHours: 100,
    pricePerExtraHour: 18.91,
    kmPerExtraHour: 20,
    pricePerDay: 126.05,
    kmPerDay: 200,
    pricePerWeek: 630.25,
    kmPerWeek: 1500,
    pricePerMonth: 1890.75,
    kmPerMonth: 4000,
    extraKmPrice: 0.26,
    extraKmPackages: [
      { km: 100, price: 30},
      { km: 300, price: 60 },
      { km: 500, price: 90 },
      { km: 1000, price: 150 }
    ],
    isNetPrice: true,
  },
 {
    group: "F",
    type: "business",
    pricePerFiveHours: 79.84,
    kmPerFiveHours: 100,
    pricePerExtraHour: 25.21,
    kmPerExtraHour: 20,
    pricePerDay: 134.46,
    kmPerDay: 200,
    pricePerWeek: 672.30,
    kmPerWeek: 1500,
    pricePerMonth: 2016.90,
    kmPerMonth: 4000,
    extraKmPrice: 0.34,
    extraKmPackages: [
      { km: 100, price: 34},
      { km: 300, price: 68 },
      { km: 500, price: 102 },
      { km: 1000, price: 170 }
    ],
    isNetPrice: true,
  },
  {
    group: "G",
    type: "business",
    pricePerFiveHours: 84.04,
    kmPerFiveHours: 100,
    pricePerExtraHour: 29.42,
    kmPerExtraHour: 20,
    pricePerDay: 189.08,
    kmPerDay: 200,
    pricePerWeek: 945.40,
    kmPerWeek: 1500,
    pricePerMonth: 2836.20,
    kmPerMonth: 4000,
    extraKmPrice: 0.55,
    extraKmPackages: [
      { km: 100, price: 55},
      { km: 300, price: 110 },
      { km: 500, price: 165 },
      { km: 1000, price: 275 }
    ],
    isNetPrice: true,
  },
  {
    group: "APK",
    type: "business",
    pricePerFiveHours: 25.21,
    pricePerDay: 37.82,
    pricePerWeek: 189.10,
    pricePerMonth: 567.30,
    isNetPrice: true,
  },
  {
    group: "APG",
    type: "business",
    pricePerFiveHours: 29.42,
    pricePerDay: 45.22,
    pricePerWeek: 231.10,
    pricePerMonth: 693.30,
    isNetPrice: true,
  },
  {
    group: "AK",
    type: "business",
    pricePerFiveHours: 29.42,
    pricePerDay: 50.42,
    pricePerWeek: 252.10,
    pricePerMonth: 756.30,
    isNetPrice: true,
  },
  {
    group: "AP",
    type: "business",
    pricePerFiveHours: 25.21,
    pricePerDay: 37.82,
    pricePerWeek: 189.10,
    pricePerMonth: 567.30,
    isNetPrice: true,
  },
  {
    group: "AAT",
    type: "business",
    pricePerFiveHours: 42.02,
    pricePerDay: 71.43,
    pricePerWeek: 357.15,
    pricePerMonth: 882.35,
    isNetPrice: true,
  },
  
  
];

async function addPricingGroupsBusiness() {
  try {
      console.log("Erstelle die Sammlung 'pricingGroupsBusiness'...");
    for (const group of pricingGroupsBusiness) {
      await setDoc(doc(db, "pricingGroupsBusiness", group.group), group);
      console.log(`Pricing group ${group.group} wurde erfolgreich hinzugefügt.`);
    }
  } catch (error) {
    console.error("Fehler beim Hinzufügen der Pricing Groups (Business):", error);
  }
}

addPricingGroupsBusiness();

// Funktion zur Generierung einer eindeutigen ID
function generateUID(plate: string): string {
  return plate + "-" + Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Fahrzeuglisten
const vehicles = [
  {
    // Allgemeine Klassifizierung
    group: "B", // Preisgruppe
    type: "Mittelklassewagen", // Fahrzeugtyp
    brand: "Fiat", // Marke
    model: "Tipo", // Modell
    year: "", // Baujahr
    description: "Fiat Tipo", // Fahrzeugbeschreibung
    // Verfügbarkeit und Zustand
    isAvailable: true,
    maintenance: false, // Wartung notwendig
    mainInspectionDate: "", // HU / Hauptuntersuchung
    // Ausstattung
    hitch: false, // Anhängerkupplung
    seats: "5", // Anzahl der Sitze
    // Standortinformationen
    homebase: "Kranenburg", // Heimatstation
    rentalLocation: "Kranenburg", // Vermietung in
    currentLocation: "Kranenburg", // Aktueller Standort
    // Identifikation
    plate: "GEL-PL-127", // Kennzeichen
    uid: "", // Eindeutige ID
    // Sonstiges
    note: "", // Bemerkung
  },
  {
    // Allgemeine Klassifizierung
    group: "DPKW", // Preisgruppe
    type: "9-Sitzer klein", // Fahrzeugtyp
    brand: "", // Marke
    model: "", // Modell
    year: "", // Baujahr
    description: "", // Fahrzeugbeschreibung
    // Verfügbarkeit und Zustand
    isAvailable: true,
    maintenance: false, // Wartung notwendig
    mainInspectionDate: "", // HU / Hauptuntersuchung
    // Ausstattung
    hitch: false, // Anhängerkupplung
    seats: "9", // Anzahl der Sitze
    // Standortinformationen
    homebase: "Kranenburg", // Heimatstation
    rentalLocation: "Kranenburg", // Vermietung in
    currentLocation: "Kranenburg", // Aktueller Standort
    // Identifikation
    plate: "KLE-CD-146", // Kennzeichen
    uid: "", // Eindeutige ID
    // Sonstiges
    note: "", // Bemerkung
  },
  {
    // Allgemeine Klassifizierung
    group: "DPKW", // Preisgruppe
    type: "9-Sitzer klein", // Fahrzeugtyp
    brand: "", // Marke
    model: "", // Modell
    year: "", // Baujahr
    description: "", // Fahrzeugbeschreibung
    // Verfügbarkeit und Zustand
    isAvailable: true,
    maintenance: false, // Wartung notwendig
    mainInspectionDate: "", // HU / Hauptuntersuchung
    // Ausstattung
    hitch: false, // Anhängerkupplung
    seats: "9", // Anzahl der Sitze
    // Standortinformationen
    homebase: "Kranenburg", // Heimatstation
    rentalLocation: "Kranenburg", // Vermietung in
    currentLocation: "Kranenburg", // Aktueller Standort
    // Identifikation
    plate: "KLE-PL-917", // Kennzeichen
    uid: "", // Eindeutige ID
    // Sonstiges
    note: "", // Bemerkung
  },
  {
    // Allgemeine Klassifizierung
    group: "EPKW", // Preisgruppe
    type: "9-Sitzer groß", // Fahrzeugtyp
    brand: "", // Marke
    model: "", // Modell
    year: "", // Baujahr
    description: "", // Fahrzeugbeschreibung
    // Verfügbarkeit und Zustand
    isAvailable: true,
    maintenance: false, // Wartung notwendig
    mainInspectionDate: "", // HU / Hauptuntersuchung
    // Ausstattung
    hitch: false, // Anhängerkupplung
    seats: "9", // Anzahl der Sitze
    // Standortinformationen
    homebase: "Kranenburg", // Heimatstation
    rentalLocation: "Kranenburg", // Vermietung in
    currentLocation: "Kranenburg", // Aktueller Standort
    // Identifikation
    plate: "KLE-PL-977", // Kennzeichen
    uid: "", // Eindeutige ID
    // Sonstiges
    note: "", // Bemerkung
  },
  {
    // Allgemeine Klassifizierung
    group: "C", // Preisgruppe
    type: "Transporter klein", // Fahrzeugtyp
    brand: "", // Marke
    model: "", // Modell
    year: "", // Baujahr
    description: "", // Fahrzeugbeschreibung
    // Verfügbarkeit und Zustand
    isAvailable: false,
    maintenance: true, // Wartung notwendig
    mainInspectionDate: "", // HU / Hauptuntersuchung
    // Ausstattung
    hitch: false, // Anhängerkupplung
    seats: "", // Anzahl der Sitze
    // Standortinformationen
    homebase: "Kranenburg", // Heimatstation
    rentalLocation: "Kranenburg", // Vermietung in
    currentLocation: "Kranenburg", // Aktueller Standort
    // Identifikation
    plate: "KLE-DC-146", // Kennzeichen
    uid: "", // Eindeutige ID
    // Sonstiges
    note: "", // Bemerkung
  },
  {
    // Allgemeine Klassifizierung
    group: "D", // Preisgruppe
    type: "Transporter groß", // Fahrzeugtyp
    brand: "", // Marke
    model: "", // Modell
    year: "", // Baujahr
    description: "", // Fahrzeugbeschreibung
    // Verfügbarkeit und Zustand
    isAvailable: false,
    maintenance: true, // Wartung notwendig
    mainInspectionDate: "", // HU / Hauptuntersuchung
    // Ausstattung
    hitch: false, // Anhängerkupplung
    seats: "", // Anzahl der Sitze
    // Standortinformationen
    homebase: "Kranenburg", // Heimatstation
    rentalLocation: "Kranenburg", // Vermietung in
    currentLocation: "Kranenburg", // Aktueller Standort
    // Identifikation
    plate: "KLE-PL-227", // Kennzeichen
    uid: "", // Eindeutige ID
    // Sonstiges
    note: "", // Bemerkung
  },
  {
    // Allgemeine Klassifizierung
    group: "F", // Preisgruppe
    type: "LKW 3,5t", // Fahrzeugtyp
    brand: "", // Marke
    model: "", // Modell
    year: "", // Baujahr
    description: "", // Fahrzeugbeschreibung
    // Verfügbarkeit und Zustand
    isAvailable: true,
    maintenance: false, // Wartung notwendig
    mainInspectionDate: "", // HU / Hauptuntersuchung
    // Ausstattung
    hitch: false, // Anhängerkupplung
    seats: "", // Anzahl der Sitze
    // Standortinformationen
    homebase: "Kranenburg", // Heimatstation
    rentalLocation: "Kranenburg", // Vermietung in
    currentLocation: "Kranenburg", // Aktueller Standort
    // Identifikation
    plate: "KLE-PL-447", // Kennzeichen
    uid: "", // Eindeutige ID
    // Sonstiges
    note: "", // Bemerkung
  },
  {
    // Allgemeine Klassifizierung
    group: "G", // Preisgruppe
    type: "LKW 7,5t", // Fahrzeugtyp
    brand: "", // Marke
    model: "", // Modell
    year: "", // Baujahr
    description: "", // Fahrzeugbeschreibung
    // Verfügbarkeit und Zustand
    isAvailable: true,
    maintenance: false, // Wartung notwendig
    mainInspectionDate: "", // HU / Hauptuntersuchung
    // Ausstattung
    hitch: false, // Anhängerkupplung
    seats: "", // Anzahl der Sitze
    // Standortinformationen
    homebase: "Kranenburg", // Heimatstation
    rentalLocation: "Kranenburg", // Vermietung in
    currentLocation: "Kranenburg", // Aktueller Standort
    // Identifikation
    plate: "KLE-PL-557", // Kennzeichen
    uid: "", // Eindeutige ID
    // Sonstiges
    note: "", // Bemerkung
  },
  {
    // Allgemeine Klassifizierung
    group: "APK", // Preisgruppe
    type: "Planenanhänger klein", // Fahrzeugtyp
    brand: "", // Marke
    model: "", // Modell
    year: "", // Baujahr
    description: "", // Fahrzeugbeschreibung
    // Verfügbarkeit und Zustand
    isAvailable: true,
    maintenance: false, // Wartung notwendig
    mainInspectionDate: "", // HU / Hauptuntersuchung
    // Ausstattung
    hitch: false, // Anhängerkupplung
    seats: "", // Anzahl der Sitze
    // Standortinformationen
    homebase: "Kranenburg", // Heimatstation
    rentalLocation: "Kranenburg", // Vermietung in
    currentLocation: "Kranenburg", // Aktueller Standort
    // Identifikation
    plate: "KLE-PL-506", // Kennzeichen
    uid: "", // Eindeutige ID
    // Sonstiges
    note: "", // Bemerkung
  },
  {
    // Allgemeine Klassifizierung
    group: "AAT", // Preisgruppe
    type: "Anhänger Autotrailer", // Fahrzeugtyp
    brand: "", // Marke
    model: "", // Modell
    year: "", // Baujahr
    description: "", // Fahrzeugbeschreibung
    // Verfügbarkeit und Zustand
    isAvailable: true,
    maintenance: false, // Wartung notwendig
    mainInspectionDate: "", // HU / Hauptuntersuchung
    // Ausstattung
    hitch: false, // Anhängerkupplung
    seats: "", // Anzahl der Sitze
    // Standortinformationen
    homebase: "Kranenburg", // Heimatstation
    rentalLocation: "Kranenburg", // Vermietung in
    currentLocation: "Kranenburg", // Aktueller Standort
    // Identifikation
    plate: "KLE-PL-503", // Kennzeichen
    uid: "", // Eindeutige ID
    // Sonstiges
    note: "", // Bemerkung
  },
];

// Generiere UID für jedes Fahrzeug
vehicles.forEach(vehicle => {
  vehicle.uid = generateUID(vehicle.plate);
});

// Funktion zum Hinzufügen der Fahrzeuge in Firestore
async function addVehicles() {
  try {
    console.log("Erstelle die Sammlung 'vehicles'...");
    for (const vehicle of vehicles) {
      // Verwende das Kennzeichen (plate) als Dokumentname
      await setDoc(doc(db, "vehicles", vehicle.plate), vehicle);
      console.log(`Vehicle ${vehicle.plate} wurde erfolgreich hinzugefügt.`);
    }
  } catch (error) {
    console.error("Fehler beim Hinzufügen der Fahrzeuge:", error);
  }
}


addVehicles();
