// ./utils/priceAndKmCalculator.js (extended with details)

import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

export const calculatePriceAndKm = async (
  formData,
  loadedVehicles,
  isBusiness = false
) => {
  const { dateStart, timeStart, dateEnd, timeEnd, vehicle } = formData;

  const supportedGroupsPKW = ["A", "B", "CPKW", "DPKW", "EPKW"];
  const supportedGroupsAnhänger = ["APK", "APG", "AK", "AP", "AAT"];
  const supportedGroupsComplex = ["C", "D", "E", "F", "G"];

  const startDateTime = new Date(`${dateStart}T${timeStart}`);
  const endDateTime = new Date(`${dateEnd}T${timeEnd}`);
  const durationInHours = Math.ceil(
    (endDateTime - startDateTime) / (1000 * 60 * 60)
  );
  const durationInDays = Math.ceil(durationInHours / 24);

  const selectedVehicle = Object.values(loadedVehicles)
    .flat()
    .find((v) => v.id === vehicle);
  if (!selectedVehicle) {
    console.warn("❌ Fahrzeug nicht gefunden:", vehicle);
    return { preis: 0, freiKm: 0, type: "Keine Daten verfügbar" };
  }

  const vehicleGroup = selectedVehicle.group.toUpperCase();
  const collectionName = isBusiness
    ? "pricingGroupsBusiness"
    : "pricingGroupsPrivate";

  console.log("\n✨ NEUE PREISANFRAGE");
  console.log("🚗 Fahrzeug-ID:", vehicle);
  console.log("🧮 Gruppe:", vehicleGroup);
  console.log("👤 Kundentyp:", isBusiness ? "Geschäftlich" : "Privat");
  console.log(
    "⏱️ Dauer:",
    durationInHours,
    "Stunden /",
    durationInDays,
    "Tage"
  );

  let groupPricing = null;
  try {
    const docRef = doc(db, collectionName, vehicleGroup);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      groupPricing = docSnap.data();
      console.log("📦 Geladene Preisdaten:", groupPricing);
    } else {
      throw new Error(`Keine Daten für Gruppe ${vehicleGroup}`);
    }
  } catch (err) {
    console.error("❌ Fehler beim Laden der Preisdaten:", err);
    return { preis: 0, freiKm: 0, type: "Keine Preisdaten gefunden" };
  }

  const isIn = (groupArray) => groupArray.includes(vehicleGroup);
  let potentialPrices = [];

  const pushPrice = (label, preis, km, details = null) => {
    potentialPrices.push({ preis, freiKm: km, type: label, details });
    console.log(
      `🔹 ${label}: ${preis} € | ${km} km`,
      details ? `| Details: ${details}` : ""
    );
  };

  if (isIn(supportedGroupsComplex)) {
    if (durationInHours <= 1) {
      pushPrice(
        "Stundenbasis-Preis",
        groupPricing.pricePerHour,
        groupPricing.kmPerHour,
        "1h Basis"
      );
    } else if (durationInHours > 1 && durationInHours <= 4) {
      const extraHours = durationInHours - 1;
      const calcPrice =
        groupPricing.pricePerHour + extraHours * groupPricing.pricePerExtraHour;
      const fiveHourPrice = groupPricing.pricePerFiveHours;
      const finalPrice = Math.min(calcPrice, fiveHourPrice);
      const km =
        finalPrice === fiveHourPrice
          ? groupPricing.kmPerFiveHours
          : groupPricing.kmPerHour + extraHours * groupPricing.kmPerExtraHour;
      const details =
        finalPrice === fiveHourPrice
          ? "5h Pauschalpreis"
          : `1h Basis + ${extraHours}h Extra`;
      pushPrice("Stundenbasis mit Extra", finalPrice, km, details);
    }
    if (durationInHours === 5) {
      pushPrice(
        "5-Stunden-Basis-Preis",
        groupPricing.pricePerFiveHours,
        groupPricing.kmPerFiveHours,
        "5h Basis"
      );
    }
    if (durationInHours > 5 && durationInHours < 24) {
      const extraHours = durationInHours - 5;
      const calcPrice =
        groupPricing.pricePerFiveHours +
        extraHours * groupPricing.pricePerExtraHour;
      const dayPrice = groupPricing.pricePerDay;
      const finalPrice = Math.min(calcPrice, dayPrice);
      const km =
        finalPrice === dayPrice
          ? groupPricing.kmPerDay
          : groupPricing.kmPerFiveHours +
            extraHours * groupPricing.kmPerExtraHour;
      const details =
        finalPrice === dayPrice
          ? "Tagespreis"
          : `5h Basis + ${extraHours}h Extra`;
      pushPrice("Tagesbasis (5+ Extra)", finalPrice, km, details);
    }
    if (durationInHours === 24) {
      pushPrice(
        "Tagesbasis-Preis",
        groupPricing.pricePerDay,
        groupPricing.kmPerDay,
        "24h Basis"
      );
    }
    if (durationInHours > 24 && durationInHours < 168) {
      const extraDays = Math.ceil((durationInHours - 24) / 24);
      const calcPrice =
        groupPricing.pricePerDay + extraDays * groupPricing.pricePerDay;
      const weekPrice = groupPricing.pricePerWeek;
      const finalPrice = Math.min(calcPrice, weekPrice);
      const km =
        finalPrice === weekPrice
          ? groupPricing.kmPerWeek
          : groupPricing.kmPerDay + extraDays * groupPricing.kmPerDay;
      const details =
        finalPrice === weekPrice
          ? "Wochenpreis"
          : `1 Tag + ${extraDays} zusätzliche Tage`;
      pushPrice("Wochenpreis kombiniert", finalPrice, km, details);
    }
    if (durationInHours === 168) {
      pushPrice(
        "Wochenbasis-Preis",
        groupPricing.pricePerWeek,
        groupPricing.kmPerWeek,
        "7 Tage"
      );
    }
    if (durationInHours > 168 && durationInHours < 720) {
      const extraWeeks = Math.floor((durationInHours - 168) / 168);
      const remainingDays = Math.ceil(((durationInHours - 168) % 168) / 24);
      const calcPrice =
        groupPricing.pricePerWeek * (1 + extraWeeks) +
        remainingDays * groupPricing.pricePerDay;
      const monthPrice = groupPricing.pricePerMonth;
      const finalPrice = Math.min(calcPrice, monthPrice);
      const km =
        finalPrice === monthPrice
          ? groupPricing.kmPerMonth
          : groupPricing.kmPerWeek * (1 + extraWeeks) +
            remainingDays * groupPricing.kmPerDay;
      const details =
        finalPrice === monthPrice
          ? "Monatspreis"
          : `${extraWeeks + 1} Wochen + ${remainingDays} Tage`;
      pushPrice("Monatsbasis kombiniert", finalPrice, km, details);
    }
    if (durationInHours >= 720) {
      const months = Math.ceil(durationInHours / 720);
      pushPrice(
        "Monatsbasis-Preis",
        groupPricing.pricePerMonth * months,
        groupPricing.kmPerMonth * months,
        `${months} Monat(e)`
      );
    }
  } else if (isIn(supportedGroupsPKW)) {
    pushPrice(
      "Tagesbasis-Preis",
      groupPricing.pricePerDay * durationInDays,
      groupPricing.kmPerDay * durationInDays,
      `${durationInDays} Tag(e)`
    );
    pushPrice(
      "Wochenbasis-Preis",
      groupPricing.pricePerWeek * Math.ceil(durationInDays / 7),
      groupPricing.kmPerWeek * Math.ceil(durationInDays / 7),
      `${Math.ceil(durationInDays / 7)} Woche(n)`
    );
    pushPrice(
      "Monatsbasis-Preis",
      groupPricing.pricePerMonth * Math.ceil(durationInDays / 30),
      groupPricing.kmPerMonth * Math.ceil(durationInDays / 30),
      `${Math.ceil(durationInDays / 30)} Monat(e)`
    );
  } else if (isIn(supportedGroupsAnhänger)) {
    pushPrice(
      "5-Stunden-Basis-Preis",
      groupPricing.pricePerFiveHours * Math.ceil(durationInHours / 5),
      0,
      `${Math.ceil(durationInHours / 5)}x 5h Blocks`
    );
    pushPrice(
      "24-Stunden-Basis-Preis",
      groupPricing.pricePerDay * Math.ceil(durationInHours / 24),
      0,
      `${Math.ceil(durationInHours / 24)}x 24h`
    );
    pushPrice(
      "7-Tage-Basis-Preis",
      groupPricing.pricePerWeek * Math.ceil(durationInDays / 7),
      0,
      `${Math.ceil(durationInDays / 7)} Woche(n)`
    );
    pushPrice(
      "30-Tage-Basis-Preis",
      groupPricing.pricePerMonth * Math.ceil(durationInDays / 30),
      0,
      `${Math.ceil(durationInDays / 30)} Monat(e)`
    );
  }

  const bestPrice = potentialPrices.reduce(
    (prev, curr) => (curr.preis < prev.preis ? curr : prev),
    potentialPrices[0]
  );
  console.log("\n🏁 Beste Option:", bestPrice);

  return {
    preis: parseFloat(bestPrice.preis.toFixed(2)),
    freiKm: bestPrice.freiKm,
    type: bestPrice.type,
    details: bestPrice.details || null,
  };
};
