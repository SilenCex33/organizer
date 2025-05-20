import React, { useState, useEffect } from "react";
import { fetchAndCategorizeVehicles } from "../utils/conflictChecker";
import { calculatePriceAndKm } from "../utils/priceAndKmCalculator";
import "./css/FormTermin.css";
import {
  fetchVehicles,
  mapGroupsToCategories,
  groupToCategory,
  categoryOrder,
} from "../utils/vehicleUtils";
import { getCurrentDate } from "../utils/dateUtils";
import { handleInputChange } from "../utils/formUtils";
import { isValidPhoneNumber } from "../utils/validationUtils";
import { getExtraKmPackages } from "../utils/packageUtil";
import { getFirestore, doc, getDoc } from "firebase/firestore";

function FormTermin({ onSubmit, onClose }) {
  const [formData, setFormData] = useState({
    kunde: "privat",
    vehicle: "",
    name: "",
    firstName: "",
    phoneNumber: "",
    dateStart: getCurrentDate(),
    dateEnd: getCurrentDate(),
    timeStart: "06:00",
    timeEnd: "22:00",
    preis: 0,
    freiKm: 0,
    info: "",
    extraOption: "",
    extraKm: 0,
  });

  const [extraKmPackages, setExtraKmPackages] = useState([]);
  const [packageOptions, setPackageOptions] = useState([]);
  const [categorizedVehicles, setCategorizedVehicles] = useState({});
  const [loadedVehicles, setLoadedVehicles] = useState({});
  const [currentPreisProKm, setCurrentPreisProKm] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      const databaseName = "vehicles";
      try {
        const categories = await fetchAndCategorizeVehicles(
          formData,
          groupToCategory,
          databaseName
        );
        setCategorizedVehicles(categories);
        setLoadedVehicles(categories);
      } catch (error) {
        console.error(
          `Fehler beim Laden der Daten aus der Firestore-Datenbank '${databaseName}':`,
          error
        );
      }
    }, 100);

    return () => clearTimeout(timeout);
  }, [
    formData.dateStart,
    formData.timeStart,
    formData.dateEnd,
    formData.timeEnd,
  ]);

  useEffect(() => {
    const loadExtraKmPackages = async () => {
      if (formData.vehicle) {
        const vehicleGroup = findVehicleGroupById(
          formData.vehicle,
          categorizedVehicles
        );

        const isBusiness = formData.kunde === "geschäftlich";
        const packages = await getExtraKmPackages(vehicleGroup, isBusiness);
        setExtraKmPackages(packages);
      } else {
        setExtraKmPackages([]);
      }
    };

    loadExtraKmPackages();
  }, [formData.vehicle, categorizedVehicles]);

  // --- Neuer Effekt: Preise und Pakete bei Kundenwechsel aktualisieren ---
  useEffect(() => {
    const updatePricingBasedOnCustomerType = async () => {
      if (!formData.vehicle) return;

      const isBusiness = formData.kunde === "geschäftlich";
      const vehicleGroup = findVehicleGroupById(
        formData.vehicle,
        categorizedVehicles
      );

      // Fahrzeugpreis neu berechnen
      const priceData = await calculatePriceAndKm(
        formData,
        loadedVehicles,
        isBusiness
      );

      // Zusatzpakete neu laden
      const packages = await getExtraKmPackages(vehicleGroup, isBusiness);

      // Auswahl-Option erneut finden (falls vorhanden)
      let selectedOption = null;
      if (formData.extraOption) {
        try {
          const parsedOption = JSON.parse(formData.extraOption);
          selectedOption = packages.find(
            (p) => p.km === parsedOption.km && p.price === parsedOption.price
          );
        } catch (e) {
          console.warn("Fehler beim Parsen der Zusatzoption:", e);
        }
      }

      // Preis pro km laden
      const preisProKm = await fetchExtraKmPrice(vehicleGroup, isBusiness);
      setCurrentPreisProKm(preisProKm);
      const zusatzKmPreis = (formData.extraKm * preisProKm).toFixed(2);

      // Info-Feld neu zusammensetzen
      let newInfo = (
        `${priceData.type} - ${priceData.preis} € (${priceData.freiKm} km frei)` +
        (priceData.details &&
        ![
          "5-Stunden-Basis-Preis",
          "Tagesbasis-Preis",
          "Wochenbasis-Preis",
          "Monatsbasis-Preis",
          "24-Stunden-Basis-Preis",
          "7-Tage-Basis-Preis",
          "30-Tage-Basis-Preis",
        ].includes(priceData.type)
          ? `\n${priceData.details}`
          : "")
      ).trim();

      if (selectedOption) {
        newInfo += `\nZusatzoption: ${selectedOption.km} km - ${selectedOption.price} €`;
      }

      if (formData.extraKm > 0) {
        newInfo += `\nZusatz-km: ${formData.extraKm} km - ${zusatzKmPreis} €`;
      }

      // Daten übernehmen
      setFormData((prev) => ({
        ...prev,
        preis: priceData.preis,
        freiKm: priceData.freiKm,
        info: newInfo.trim(),
      }));

      // Zusatzpakete neu setzen
      setExtraKmPackages(packages);
    };

    updatePricingBasedOnCustomerType();
  }, [formData.kunde]);

  useEffect(() => {
    const updateInfo = async () => {
      if (!formData.vehicle) return;

      const isBusiness = formData.kunde === "geschäftlich";
      const vehicleGroup = findVehicleGroupById(
        formData.vehicle,
        categorizedVehicles
      );

      const priceData = await calculatePriceAndKm(
        formData,
        loadedVehicles,
        isBusiness
      );
      const preisProKm = await fetchExtraKmPrice(vehicleGroup, isBusiness);
      setCurrentPreisProKm(preisProKm);

      const zusatzKmPreis = parseFloat(
        (formData.extraKm * preisProKm).toFixed(2)
      );

      let basePrice = priceData.preis;
      let packagePrice = 0;
      let total = basePrice;

      let infoText = `${priceData.type} - ${basePrice} € (${priceData.freiKm} km frei)`;
      if (
        priceData.details &&
        ![
          "5-Stunden-Basis-Preis",
          "Tagesbasis-Preis",
          "Wochenbasis-Preis",
          "Monatsbasis-Preis",
          "24-Stunden-Basis-Preis",
          "7-Tage-Basis-Preis",
          "30-Tage-Basis-Preis",
        ].includes(priceData.type)
      ) {
        infoText += `\n${priceData.details}`;
      }

      if (formData.extraOption) {
        try {
          const parsedOption = JSON.parse(formData.extraOption);
          packagePrice = parseFloat(parsedOption.price);
          infoText += `\nZusatzoption: ${parsedOption.km} km - ${packagePrice} €`;
          total += packagePrice;
        } catch (e) {
          console.warn("Fehler beim Parsen der Zusatzoption:", e);
        }
      }

      if (formData.extraKm > 0) {
        infoText += `\nZusatz-km: ${formData.extraKm} km - ${zusatzKmPreis} €`;
        total += zusatzKmPreis;
      }

      const totalKm =
        priceData.freiKm +
        (formData.extraOption ? JSON.parse(formData.extraOption).km : 0) +
        (formData.extraKm || 0);

      infoText += `
__________________________________________________________________
Gesamtpreis: ${total.toFixed(2)} € / Gesamtkilometer: ${totalKm.toFixed(0)} km`;

      setFormData((prev) => ({
        ...prev,
        preis: total,
        freiKm: priceData.freiKm,
        info: infoText.trim(),
      }));
    };

    updateInfo();
  }, [
    formData.vehicle,
    formData.dateStart,
    formData.dateEnd,
    formData.timeStart,
    formData.timeEnd,
    formData.kunde,
    formData.extraOption,
    formData.extraKm,
  ]);

  const fetchExtraKmPrice = async (vehicleGroup, isBusiness = false) => {
    if (!vehicleGroup) return 0;
    const db = getFirestore();
    const collectionName = isBusiness
      ? "pricingGroupsBusiness"
      : "pricingGroupsPrivate";
    const docRef = doc(db, collectionName, vehicleGroup.toUpperCase());

    try {
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        return data.extraKmPrice || 0;
      }
    } catch (err) {
      console.error("Fehler beim Laden des extraKmPrice:", err);
    }

    return 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  const handleInputChangeWrapper = (e) => {
    handleInputChange(e, setFormData);
  };
  const findVehicleGroupById = (vehicleId, categorizedVehicles) => {
    for (const category in categorizedVehicles) {
      for (const vehicle of categorizedVehicles[category]) {
        if (vehicle.id === vehicleId) {
          return vehicle.group;
        }
      }
    }
    return null;
  };

  return (
    <div className="container-flex mt-4">
      <h2 className="text-center mb-4">Termin erstellen</h2>
      <form onSubmit={handleSubmit}>
        <div className="row mb-3">
          <div className="col-6 mt-3 border-r-2 border-gray-400">
            <div className="mb-3">
              <label htmlFor="kunde" className="form-label">
                Kunde
              </label>
              <select
                className="form-select"
                id="kunde"
                name="kunde"
                value={formData.kunde}
                onChange={(e) =>
                  setFormData({ ...formData, kunde: e.target.value })
                }
              >
                <option value="privat">Privat</option>
                <option value="geschäftlich">Geschäftlich</option>
              </select>
            </div>

            <div className="row mb-3">
              <div className="col-6">
                <label htmlFor="firstName" className="form-label">
                  Vorname
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChangeWrapper}
                  required
                />
              </div>
              <div className="col-6">
                <label htmlFor="name" className="form-label">
                  Name
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChangeWrapper}
                  required
                />
              </div>
            </div>
            <div className="col-12">
              <label htmlFor="phoneNumber" className="form-label">
                Telefonnummer
              </label>
              <input
                type="text"
                className={`form-control ${!isValidPhoneNumber(formData.phoneNumber) ? "is-invalid" : ""}`}
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChangeWrapper}
                required
              />
              {!isValidPhoneNumber(formData.phoneNumber) && (
                <div className="invalid-feedback">
                  Bitte geben Sie eine gültige Telefonnummer ein.
                </div>
              )}
            </div>
            <label htmlFor="info" className="form-label mt-3">
              Info
            </label>
            <textarea
              className="col-12 border rounded shadow-sm bg-light"
              id="info"
              name="info"
              style={{ height: 100 }}
              value={formData.info}
              onChange={(e) =>
                setFormData({ ...formData, info: e.target.value })
              }
              placeholder="Zusätzliche Informationen"
            />
          </div>

          <div className="col-6">
            <div className="row mt-3">
              <div className="col-6">
                <label htmlFor="dateStart" className="form-label">
                  Datum Start
                </label>
                <input
                  type="date"
                  className="form-control"
                  id="dateStart"
                  name="dateStart"
                  value={formData.dateStart}
                  onChange={handleInputChangeWrapper}
                  required
                />
              </div>
              <div className="col-6">
                <label htmlFor="dateEnd" className="form-label">
                  Datum Ende
                </label>
                <input
                  type="date"
                  className={`form-control ${formData.dateEnd < formData.dateStart ? "is-invalid" : ""}`}
                  id="dateEnd"
                  name="dateEnd"
                  value={formData.dateEnd}
                  onChange={handleInputChangeWrapper}
                  required
                />
              </div>
            </div>
            <div className="row mt-3">
              <div className="col-6">
                <label htmlFor="timeStart" className="form-label">
                  Uhrzeit Start
                </label>
                <input
                  type="time"
                  className="form-control"
                  id="timeStart"
                  name="timeStart"
                  value={formData.timeStart}
                  onChange={handleInputChangeWrapper}
                  required
                />
              </div>
              <div className="col-6 mb-3">
                <label htmlFor="timeEnd" className="form-label">
                  Uhrzeit Ende
                </label>
                <input
                  type="time"
                  className={`form-control ${formData.dateEnd + formData.timeEnd < formData.dateStart + formData.timeStart ? "is-invalid" : ""}`}
                  id="timeEnd"
                  name="timeEnd"
                  value={formData.timeEnd}
                  onChange={handleInputChangeWrapper}
                  required
                />
              </div>
            </div>

            <label htmlFor="vehicle" className="form-label">
              Fahrzeug
            </label>
            <select
              className="form-select"
              id="vehicle"
              name="vehicle"
              value={formData.vehicle}
              onChange={async (e) => {
                const newVehicle = e.target.value;

                // Berechne den Preis und die freien Kilometer
                const isBusiness = formData.kunde === "geschäftlich";
                const priceData = await calculatePriceAndKm(
                  { ...formData, vehicle: newVehicle },
                  loadedVehicles,
                  isBusiness
                );

                // Aktualisiere das Formular mit den neuen Daten
                setFormData((prevState) => ({
                  ...prevState,
                  vehicle: newVehicle,
                  preis: priceData.preis,
                  freiKm: priceData.freiKm,
                  info: (
                    `${priceData.type} - ${priceData.preis} € (${priceData.freiKm} km frei)` +
                    (priceData.details &&
                    ![
                      "5-Stunden-Basis-Preis",
                      "Tagesbasis-Preis",
                      "Wochenbasis-Preis",
                      "Monatsbasis-Preis",
                      "24-Stunden-Basis-Preis",
                      "7-Tage-Basis-Preis",
                      "30-Tage-Basis-Preis",
                    ].includes(priceData.type)
                      ? `\n${priceData.details}`
                      : "")
                  ).trim(),
                }));
              }}
              required
            >
              <option value="">Fahrzeug wählen...</option>
              {categoryOrder.map(({ category }) => {
                const vehicles = categorizedVehicles[category] || [];
                if (vehicles.length === 0) return null;
                return (
                  <optgroup key={category} label={category}>
                    {vehicles.map((vehicle) => (
                      <option
                        key={vehicle.id}
                        value={vehicle.id}
                        className={vehicle.isConflicting ? "text-danger" : ""}
                        disabled={vehicle.isConflicting}
                      >
                        {vehicle.id} {vehicle.isConflicting ? "(belegt)" : ""}
                      </option>
                    ))}
                  </optgroup>
                );
              })}
            </select>

            <label htmlFor="extraOptions" className="form-label mt-3">
              Zusatzoptionen auswählen
            </label>
            <select
              className="form-select"
              id="extraOptions"
              name="extraOptions"
              value={formData.extraOption || ""}
              onChange={(e) => {
                const selectedValue = e.target.value;
                if (!selectedValue) {
                  setFormData((prevState) => {
                    const infoWithoutOption = prevState.info
                      .split("\n")
                      .filter((line) => !line.startsWith("Zusatzoption:"))
                      .join("\n");
                    return {
                      ...prevState,
                      extraOption: "",
                      info: infoWithoutOption.trim(),
                    };
                  });
                  return;
                }
                const selectedOption = JSON.parse(selectedValue);

                setFormData((prevState) => {
                  const infoWithoutOption = prevState.info
                    .split("\n")
                    .filter((line) => !line.startsWith("Zusatzoption:"))
                    .join("\n");

                  return {
                    ...prevState,
                    extraOption: selectedValue,
                    info: `${infoWithoutOption}\nZusatzoption: ${selectedOption.km} km - ${selectedOption.price} €`.trim(),
                  };
                });
              }}
            >
              <option value="">Zusatzoption wählen...</option>
              {extraKmPackages.map((option, index) => (
                <option key={index} value={JSON.stringify(option)}>
                  {`${option.km} km - ${option.price} €`}
                </option>
              ))}
              {formData.extraOption &&
                !extraKmPackages.some(
                  (pkg) => JSON.stringify(pkg) === formData.extraOption
                ) && (
                  <option value={formData.extraOption}>
                    {`${JSON.parse(formData.extraOption).km} km - ${JSON.parse(formData.extraOption).price} € (nicht verfügbar)`}
                  </option>
                )}
            </select>

            <label htmlFor="extraKm" className="form-label mt-3">
              Zusatz-km
            </label>
            <input
              type="number"
              className="form-control"
              id="extraKm"
              name="extraKm"
              min={0}
              value={formData.extraKm || ""}
              onChange={async (e) => {
                const value = parseInt(e.target.value, 10) || 0;
                const isBusiness = formData.kunde === "geschäftlich";
                const vehicleGroup = findVehicleGroupById(
                  formData.vehicle,
                  categorizedVehicles
                );
                const preisProKm = await fetchExtraKmPrice(
                  vehicleGroup,
                  isBusiness
                );
                const zusatzpreis = (value * preisProKm).toFixed(2);

                setFormData((prevState) => {
                  // Alte Zusatz-km-Zeile aus info entfernen
                  const infoWithoutExtraKm = prevState.info
                    .split("\n")
                    .filter((line) => !line.startsWith("Zusatz-km:"))
                    .join("\n");

                  return {
                    ...prevState,
                    extraKm: value,
                    info:
                      value > 0
                        ? `${infoWithoutExtraKm}\nZusatz-km: ${value} km - ${zusatzpreis} €`.trim()
                        : infoWithoutExtraKm.trim(),
                  };
                });
              }}
            />
            {formData.extraKm > 0 && (
              <small className="text-muted d-block">
                Preis pro km aktuell: {currentPreisProKm.toFixed(2)} €
              </small>
            )}
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary mt-4"
          disabled={
            formData.dateEnd + formData.timeEnd <
            formData.dateStart + formData.timeStart
          }
        >
          Erstellen
        </button>
      </form>
    </div>
  );
}

export default FormTermin;
