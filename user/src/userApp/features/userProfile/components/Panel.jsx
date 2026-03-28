import React from "react";

const Panel = ({ icon, title, children }) => (
  <div className="ep-card ep-panel">
    <div className="ep-panel-head">
      <div className="ep-panel-icon">{icon}</div>
      <span className="ep-panel-title">{title}</span>
    </div>
    <div className="ep-panel-body">{children}</div>
  </div>
);

export default Panel;
