export const updatePriceAndKm = async (formData, loadedVehicles, setFormData) => {
  const { preis, freiKm, type } = await calculatePriceAndKm(formData, loadedVehicles);
  setFormData((prevState) => ({
    ...prevState,
    preis,
    freiKm,
    info: ` ${type} - ${preis} € (${freiKm} km frei)`,
  }));
};