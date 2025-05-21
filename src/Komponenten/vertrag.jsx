import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase"; // Passe ggf. den Pfad an
import SignatureCanvas from "react-signature-canvas";

const VertragForm = () => {
  const [form, setForm] = useState({
    name: "",
    vorname: "",
    telNr: "",
    vertragsnummer: "",
    strasse: "",
    hausnummer: "",
    plz: "",
    Stadt: "",
    personalausweisnr: "",
    ausgestellt_in: "",
    ausgestellt_am: "",
    geburtsdatum: "",
    geburtsort: "",
    fuehrerscheinnr: "",
    fuehrerscheinklasse: "",
    fsausgestellt_in: "",
    fsausgestellt_am: "",
    schaden: "",
    ladebordwand: false,
    fahrtenschreiber: false,
    tankvoll: false,
    uebergabe_datum: "",
    uebergabe_zeit: "",
    uebergabe_ort: "",
    rueckgabe_datum: "",
    rueckgabe_zeit: "",
    rueckgabe_ort: "",
  });

  const [errors, setErrors] = useState({});
  const [marker, setMarker] = useState([]);
  const [showMarkerModal, setShowMarkerModal] = useState(false);
  const [newMarker, setNewMarker] = useState(null);
  const containerRef = useRef(null);
  const mieterRef = useRef(null);
  const vermieterRef = useRef(null);
  const [signatureData, setSignatureData] = useState({
    mieter: "",
    vermieter: "",
  });

  const location = useLocation();
  const uidFromTermin = location.state?.uid || "Keine UID übergeben";
  const eventData = location.state?.eventData;

  // Firestore-Daten laden und ins Formular übernehmen
  useEffect(() => {
    const fetchFirestoreData = async () => {
      if (uidFromTermin && uidFromTermin !== "Keine UID übergeben") {
        const docRef = doc(db, "events", uidFromTermin);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setForm((prev) => ({
            ...prev,
            ...docSnap.data(), // alle Felder aus Firestore übernehmen
          }));
        }
      }
    };
    fetchFirestoreData();
  }, [uidFromTermin]);

  // EventData aus Navigation übernehmen (überschreibt ggf. einzelne Felder)
  useEffect(() => {
    if (eventData) {
      setForm((prev) => ({
        ...prev,
        name: eventData.name || prev.name,
        vorname: eventData.vorname || prev.vorname,
        telNr: eventData.telNr || prev.telNr,
        strasse: eventData.strasse || prev.strasse,
        hausnummer: eventData.hausnummer || prev.hausnummer,
        plz: eventData.plz || prev.plz,
        Stadt: eventData.Stadt || prev.Stadt,

        // Start/Ende als Datum/Zeit splitten, falls vorhanden
        uebergabe_datum: eventData.start
          ? new Date(eventData.start).toISOString().slice(0, 10)
          : prev.uebergabe_datum,
        uebergabe_zeit: eventData.start
          ? new Date(eventData.start).toISOString().slice(11, 16)
          : prev.uebergabe_zeit,
        rueckgabe_datum: eventData.end
          ? new Date(eventData.end).toISOString().slice(0, 10)
          : prev.rueckgabe_datum,
        rueckgabe_zeit: eventData.end
          ? new Date(eventData.end).toISOString().slice(11, 16)
          : prev.rueckgabe_zeit,
        // Optional: weitere Felder wie telNr, kunde, etc. ergänzen
      }));
    }
  }, [eventData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;
    setForm({ ...form, [name]: val });

    if (name === "personalausweisnr") {
      const isValid = /^[A-Z0-9]{9}$/i.test(value);
      setErrors((prev) => ({
        ...prev,
        personalausweisnr: isValid
          ? ""
          : "Bitte 9 Buchstaben/Ziffern eingeben (z. B. L01X00T42)",
      }));
    }

    if (name === "fuehrerscheinnr") {
      const isValid = /^[A-Z]{1}[0-9]{8,9}$/i.test(value);
      setErrors((prev) => ({
        ...prev,
        fuehrerscheinnr: isValid ? "" : "Ungültiges Format: z. B. B12345678",
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Vertrag abgeschickt:\n" + JSON.stringify(form, null, 2));
  };

  // Marker-Logik
  const handleImageClick = (e) => {
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setNewMarker({ x, y, type: "", note: "" });
    setShowMarkerModal(true);
  };

  const saveMarker = (type, note) => {
    let color = "gray";
    if (type === "Kratzer") color = "blue";
    else if (type === "Beule") color = "red";
    else if (type === "Lack") color = "orange";
    else if (type === "Glasbruch") color = "black";

    setMarker((prev) => [...prev, { ...newMarker, type, note, color }]);
    setShowMarkerModal(false);
    setNewMarker(null);
  };

  const removeMarker = (index) => {
    setMarker((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="container-fluid">
      <h2 className="text-center mb-6 ">Vertragsformular</h2>
      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-6 bg-light p-4 rounded border">
            {/* Kundendaten */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="mb-0">Kundendaten:</h4>
              <div className="d-flex align-items-center gap-2">
                <span className="fw-semibold">Vertrag-ID:</span>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  style={{ width: "170px" }}
                  value={uidFromTermin}
                  readOnly
                />
              </div>
            </div>
            <div className="row align-items-end">
              <div className="col-4">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  className="form-control"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-4">
                <label className="form-label">Vorname</label>
                <input
                  type="text"
                  className="form-control"
                  name="vorname"
                  value={form.vorname}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-4 justify-content-center align-content-center">
                <button
                  className="btn btn-primary btn-sm mb-1 me-2 ms-10 "
                  disabled
                >
                  <i className="bi bi-person"></i>
                </button>
                <button className="btn btn-primary btn-sm mb-1 ms-1  " disabled>
                  <i className="bi bi-plus"></i>
                </button>
              </div>
            </div>
            <div className="row">
              <div className="col-10">
                <label className="form-label">Telefon:</label>
                <input
                  type="number"
                  className={`form-control ${errors.telNr ? "is-invalid" : ""}`}
                  name="telNr"
                  value={form.telNr}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="row">
              <div className="col-10">
                <label className="form-label">Strasse</label>
                <input
                  type="text"
                  className="form-control"
                  name="strasse"
                  value={form.strasse}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-2">
                <label className="form-label">Haus Nr.</label>
                <input
                  type="text"
                  className="form-control"
                  name="hausnummer"
                  value={form.hausnummer}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="row">
              <div className="col-2">
                <label className="form-label">Postleitzahl</label>
                <input
                  type="text"
                  className="form-control"
                  name="plz"
                  value={form.plz}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-10">
                <label className="form-label">Stadt</label>
                <input
                  type="text"
                  className="form-control"
                  name="Stadt"
                  value={form.Stadt}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="row">
              <div className="col-4">
                <label className="form-label">Personalausweis NR.:</label>
                <input
                  type="text"
                  className={`form-control ${errors.personalausweisnr ? "is-invalid" : ""}`}
                  name="personalausweisnr"
                  value={form.personalausweisnr}
                  onChange={handleChange}
                  required
                />
                {errors.personalausweisnr && (
                  <div className="invalid-feedback">
                    {errors.personalausweisnr}
                  </div>
                )}
              </div>

              <div className="col-4">
                <label className="form-label">ausgestellt in:</label>
                <input
                  type="text"
                  className="form-control"
                  name="ausgestellt_in"
                  value={form.ausgestellt_in}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-4">
                <label className="form-label">ausgestellt am:</label>
                <input
                  type="text"
                  className="form-control"
                  name="ausgestellt_am"
                  value={form.ausgestellt_am}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="row">
              <div className="col-6">
                <label className="form-label">geboren am:</label>
                <input
                  type="text"
                  className="form-control"
                  name="geburtsdatum"
                  value={form.geburtsdatum}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-6">
                <label className="form-label">geboren in:</label>
                <input
                  type="text"
                  className="form-control"
                  name="geburtsort"
                  value={form.geburtsort}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="row">
              <div className="col-4">
                <label className="form-label">Führerschein NR.:</label>
                <input
                  type="text"
                  className={`form-control ${errors.fuehrerscheinnr ? "is-invalid" : ""}`}
                  name="fuehrerscheinnr"
                  value={form.fuehrerscheinnr || ""}
                  onChange={handleChange}
                  required
                />
                {errors.fuehrerscheinnr && (
                  <div className="invalid-feedback">
                    {errors.fuehrerscheinnr}
                  </div>
                )}
              </div>

              <div className="col-2">
                <label className="form-label ">Führerscheinklasse</label>
                <input
                  type="text"
                  className="form-control"
                  name="fuehrerscheinklasse"
                  value={form.fuehrerscheinklasse}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="row">
              <div className="col-4">
                <label className="form-label">ausgestellt in:</label>
                <input
                  type="text"
                  className="form-control"
                  name="fsausgestellt_in"
                  value={form.fsausgestellt_in}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-4">
                <label className="form-label">ausgestellt am:</label>
                <input
                  type="text"
                  className="form-control"
                  name="fsausgestellt_am"
                  value={form.fsausgestellt_am}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          {/* Fahrzeugbild mit Markerfunktion */}
          <div className="col-6 d-flex flex-column justify-content-top rounded border">
            <small className="text-center">
              Klicke auf das Bild, um einen Schaden zu markieren. Klicke auf
              einen Marker, um ihn zu entfernen.
            </small>
            {/* Marker-Legende */}
            <div className="mt-0 ">
              <ul className="list-unstyled d-flex gap-4 mt-0 mb-0 justify-content-center">
                <strong>Legende:</strong>
                <li className="d-flex align-items-center gap-1">
                  <span style={{ color: "red" }}>●</span> Beule
                </li>
                <li className="d-flex align-items-center gap-1">
                  <span style={{ color: "blue" }}>●</span> Kratzer
                </li>
                <li className="d-flex align-items-center gap-1">
                  <span style={{ color: "orange" }}>●</span> Lack
                </li>
                <li className="d-flex align-items-center gap-1">
                  <span style={{ color: "black" }}>●</span> Glasbruch
                </li>
              </ul>
            </div>
            <div className="row-12 text-center">
              <div
                ref={containerRef}
                onClick={handleImageClick}
                style={{
                  position: "relative",
                  width: "100%",
                  height: "200px",
                  cursor: "crosshair",
                  background: "#f8f9fa",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                  overflow: "hidden",
                }}
              >
                <img
                  src="ford.png"
                  alt="Fahrzeug"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />

                {marker.map((m, i) => (
                  <div
                    key={i}
                    onClick={(ev) => {
                      ev.stopPropagation();
                      removeMarker(i);
                    }}
                    title={`${m.type}: ${m.note}`}
                    style={{
                      position: "absolute",
                      top: `${m.y}%`,
                      left: `${m.x}%`,
                      transform: "translate(-50%, -50%)",
                      color: m.color,
                      fontSize: "24px",
                      fontWeight: "bold",
                      pointerEvents: "auto",
                      userSelect: "none",
                      cursor: "pointer",
                    }}
                  >
                    ●
                  </div>
                ))}
              </div>
              <div className="row mt-3">
                <div className="col">
                  <div className="form-check form-check-inline">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="ladebordwand"
                      name="ladebordwand"
                      checked={form.ladebordwand}
                      onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor="ladebordwand">
                      Ladebordwand erklärt
                    </label>
                  </div>
                  <div className="form-check form-check-inline">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="fahrtenschreiber"
                      name="fahrtenschreiber"
                      checked={form.fahrtenschreiber}
                      onChange={handleChange}
                    />
                    <label
                      className="form-check-label"
                      htmlFor="fahrtenschreiber"
                    >
                      Fahrtenschreiber erklärt
                    </label>
                  </div>
                  <div className="form-check form-check-inline">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="tankvoll"
                      name="tankvoll"
                      checked={form.tankvoll}
                      onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor="tankvoll">
                      Tank voll
                    </label>
                  </div>
                </div>
              </div>
              <div className="row mt-3">
                <div className="col-6">
                  <label className="form-label">
                    Fahrzeugübergabe: Datum & Zeit / Ort
                  </label>
                  <div className="input-group">
                    <input
                      type="date"
                      className="form-control"
                      name="uebergabe_datum"
                      value={form.uebergabe_datum || ""}
                      onChange={handleChange}
                      required
                    />
                    <input
                      type="time"
                      className="form-control"
                      name="uebergabe_zeit"
                      value={form.uebergabe_zeit || ""}
                      onChange={handleChange}
                      required
                    />
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Ort"
                      name="uebergabe_ort"
                      value={form.uebergabe_ort || ""}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="col-6">
                  <label className="form-label">
                    Vereinbarte Rückgabe: Datum & Zeit / Ort
                  </label>
                  <div className="input-group">
                    <input
                      type="date"
                      className="form-control"
                      name="rueckgabe_datum"
                      value={form.rueckgabe_datum || ""}
                      onChange={handleChange}
                      required
                    />
                    <input
                      type="time"
                      className="form-control"
                      name="rueckgabe_zeit"
                      value={form.rueckgabe_zeit || ""}
                      onChange={handleChange}
                      required
                    />
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Ort"
                      name="rueckgabe_ort"
                      value={form.rueckgabe_ort || ""}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="row mt-1">
                {eventData && (
                  <div className="row mt-4">
                    <div className="col-3">
                      <div className="border rounded p-2 h-100">
                        <strong>Fahrzeug:</strong>
                        <br />
                        {eventData.fahrzeug || "—"}
                      </div>
                    </div>
                    <div className="col-3">
                      <div className="border rounded p-2 h-100">
                        <strong>Zusatzoptionen:</strong>
                        <br />
                        {eventData.zusatzOptionen?.join(", ") || "—"}
                      </div>
                    </div>
                    <div className="col-3">
                      <div className="border rounded p-2 h-100">
                        <strong>Zusatz-Kilometer:</strong>
                        <br />
                        {eventData.zusatzKm || 0} km
                      </div>
                    </div>
                    <div className="col-3">
                      <div className="border rounded p-2 h-100">
                        <strong>Preis/KM gesamt:</strong>
                        <br />
                        {eventData.preis ? `${eventData.preis} €` : "—"}/
                        {eventData.km ? `${eventData.km} km` : "—"}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="row mt-2">
              <div className="col-6">
                <h5>Unterschrift Mieter(in)</h5>
                <SignatureCanvas
                  penColor="black"
                  canvasProps={{
                    width: 500,
                    height: 150,
                    className: "border rounded",
                  }}
                  ref={mieterRef}
                  onEnd={() =>
                    setSignatureData((prev) => ({
                      ...prev,
                      mieter: mieterRef.current?.toDataURL(),
                    }))
                  }
                />
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger mt-2"
                  onClick={() => {
                    mieterRef.current.clear();
                    setSignatureData((prev) => ({ ...prev, mieter: "" }));
                  }}
                >
                  Löschen
                </button>
              </div>

              <div className="col-6 mt-0">
                <h5>Unterschrift Vermieter(in)</h5>
                <SignatureCanvas
                  penColor="black"
                  canvasProps={{
                    width: 500,
                    height: 150,
                    className: "border rounded",
                  }}
                  ref={vermieterRef}
                  onEnd={() =>
                    setSignatureData((prev) => ({
                      ...prev,
                      vermieter: vermieterRef.current?.toDataURL(),
                    }))
                  }
                />
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger mt-2"
                  onClick={() => {
                    vermieterRef.current.clear();
                    setSignatureData((prev) => ({ ...prev, vermieter: "" }));
                  }}
                >
                  Löschen
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Marker-Modal */}
      {showMarkerModal && (
        <div
          className="modal d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Schaden hinzufügen</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowMarkerModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Schadensart</label>
                  <select
                    className="form-select"
                    value={newMarker?.type || ""}
                    onChange={(e) =>
                      setNewMarker((prev) => ({
                        ...prev,
                        type: e.target.value,
                      }))
                    }
                  >
                    <option value="">Wählen...</option>
                    <option value="Beule">Beule</option>
                    <option value="Kratzer">Kratzer</option>
                    <option value="Lack">Lack</option>
                    <option value="Glasbruch">Glasbruch</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Notiz</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newMarker?.note || ""}
                    onChange={(e) =>
                      setNewMarker((prev) => ({
                        ...prev,
                        note: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowMarkerModal(false)}
                >
                  Abbrechen
                </button>
                <button
                  className="btn btn-primary"
                  disabled={!newMarker?.type}
                  onClick={() => saveMarker(newMarker.type, newMarker.note)}
                >
                  Speichern
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VertragForm;
