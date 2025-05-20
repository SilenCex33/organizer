import React, { useState } from "react";
import { useLocation } from "react-router-dom";

const VertragForm = () => {
  const [form, setForm] = useState({
    name: "",
    vorname: "",
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
    schaden: "",           // hinzugefügt für Checkbox "Schaden"
    ladebordwand: false,   // hinzugefügt für Checkbox "Ladebordwand erklärt"
    fahrtenschreiber: false, // hinzugefügt für Checkbox "Fahrtenschreiber erklärt"
    tankvoll: false        // hinzugefügt für Checkbox "Tank voll"
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const location = useLocation();
  const uidFromTermin = location.state?.uid || "Keine UID übergeben";

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Vertrag abgeschickt:\n" + JSON.stringify(form, null, 2));
    // Hier kannst du die Daten weiterverarbeiten (z.B. an ein Backend senden)
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
                  className="form-control"
                  name="plz"
                  value={form.plz}
                  onChange={handleChange}
                  required
                />
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
                <label className="form-label">Führerschein Nr.:</label>
                <input
                  type="text"
                  className="form-control"
                  name="plz"
                  value={form.plz}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-1">
                <label className="form-label ">Führerscheinklasse</label>
                <input
                  type="text"
                  className="form-control"
                  name="führerscheinklasse"
                  value={form.führerscheinklasse}
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
          <div className="col-6 d-flex flex-column align-items-center justify-content-center">
            <div className="row-12 text-center">
              <img
                src="ford.png"
                alt="Logo"
                style={{
                  width: "auto",
                  height: "200px",
                  objectFit: "contain",
                  objectPosition: "top",
                }}
              />
              <div className="d-flex align-items-center gap-3 mt-3">
                <p className="mb-0">Sind Schäden vorhanden?</p>

                <div className="form-check form-check-inline mb-0">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="schadenJa"
                    name="schaden"
                    value="ja"
                  />
                  <label className="form-check-label" htmlFor="schadenJa">
                    Ja
                  </label>
                </div>

                <div className="form-check form-check-inline mb-0">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="schadenNein"
                    name="schaden"
                    value="nein"
                  />
                  <label className="form-check-label" htmlFor="schadenNein">
                    Nein
                  </label>
                </div>
              </div>
              <div className="d-flex flex-wrap gap-4 mt-4">
                <div className="d-flex align-items-center gap-2">
                  <span>Ladeboardwand erklärt</span>
                  <div className="form-check mb-0">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="ladebordwand"
                      name="ladebordwand"
                      value="ja"
                    />
                    <label className="form-check-label" htmlFor="ladebordwand">
                      Ja
                    </label>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-2">
                  <span>Fahrtenschreiber erklärt</span>
                  <div className="form-check mb-0">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="fahrtenschreiber"
                      name="fahrtenschreiber"
                      value="ja"
                    />
                    <label
                      className="form-check-label"
                      htmlFor="fahrtenschreiber"
                    >
                      Ja
                    </label>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-2">
                  <span>Tank voll</span>
                  <div className="form-check mb-0">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="tankvoll"
                      name="tankvoll"
                      value="ja"
                    />
                    <label className="form-check-label" htmlFor="tankvoll">
                      Ja
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default VertragForm;
