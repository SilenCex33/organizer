import React, { useState } from "react";

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
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Vertrag abgeschickt:\n" + JSON.stringify(form, null, 2));
    // Hier kannst du die Daten weiterverarbeiten (z.B. an ein Backend senden)
  };

  return (
    <div className="container">
      <h2>Vertragsformular</h2>
      <div className="col-6">
        <form onSubmit={handleSubmit}>
          {/* Kundendaten */}

          <div className="row">
            <div className="col-6">
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
            <div className="col-6">
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
        </form>
      </div>
      <button type="submit" className="mt-4 btn btn-primary">
        Abschicken
      </button>
    </div>
  );
};

export default VertragForm;
