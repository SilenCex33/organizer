import { getFirestore, doc, getDoc } from "firebase/firestore";

/**
 * Lädt die Zusatzoptionen (extraKmPackages) basierend auf der Fahrzeuggruppe aus Firestore.
 * @param {string} vehicleGroup - Die Gruppe des ausgewählten Fahrzeugs.
 * @returns {Promise<Array>} - Eine Liste von Zusatzoptionen.
 */
export const getExtraKmPackages = async (vehicleGroup, isBusiness = false) => {
  if (!vehicleGroup) {
    console.warn("Keine Fahrzeuggruppe angegeben.");
    return [];
  }

  const db = getFirestore();
  const collectionName = isBusiness
    ? "pricingGroupsBusiness"
    : "pricingGroupsPrivate";
  const docRef = doc(db, collectionName, vehicleGroup);

  try {
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log("Geladene Zusatzoptionen:", data.extraKmPackages);
      return data.extraKmPackages || [];
    } else {
      console.warn(
        `Dokument für ${vehicleGroup} in ${collectionName} nicht gefunden.`
      );
      return [];
    }
  } catch (error) {
    console.error(
      "Fehler beim Abrufen der Zusatzoptionen aus Firestore:",
      error
    );
    return [];
  }
};
