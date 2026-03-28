import React from "react";

const Toggle = ({ label, description, checked, onChange }) => (
  <div className="ep-toggle-row">
    <div className="ep-toggle-info">
      <p>{label}</p>
      <span>{description}</span>
    </div>
    <label className="ep-toggle-switch">
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span className="ep-toggle-track" />
    </label>
  </div>
);

export default Toggle;
