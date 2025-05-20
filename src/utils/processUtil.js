console.log("processUtil.js geladen");

/**
 * Verarbeitet die ausgewählte Paketoption und berechnet die Preis- und Kilometerdaten.
 * Aktualisiert die Info-Daten für das Formular.
 * @param {Object} formData - Der aktuelle Formularzustand.
 * @param {Object} selectedOption - Die ausgewählte Paketoption.
 * @param {Object} loadedVehicles - Die geladenen Fahrzeugdaten.
 * @returns {Promise<Object>} - Aktualisierter Formularzustand.
 */
export const processFormData = async (formData, selectedOption, loadedVehicles) => {
  const priceData = await calculatePriceAndKm(formData, loadedVehicles);
  const vehicleInfo = formData.vehicle ? `Fahrzeug: ${formData.vehicle}` : "Kein Fahrzeug ausgewählt";
  const packageInfo = selectedOption
    ? `Ausgewähltes Paket: Preis: ${selectedOption.price} € + ${selectedOption.km} km`
    : "Kein Paket ausgewählt";
  const priceInfo = priceData
    ? `${priceData.type} - ${priceData.preis} € (${priceData.freiKm} km frei)`
    : "Keine Preisdaten verfügbar";

  return {
    ...formData,
    package: selectedOption ? JSON.stringify(selectedOption) : formData.package,
    info: `${priceInfo}\n${packageInfo}`,
  };
};