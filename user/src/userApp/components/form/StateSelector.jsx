import React, { useState, useEffect } from "react";

const StateSelector = ({ states, form, handleChange }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Simple mobile detection - you can improve or use a library
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const mobile = /android|iphone|ipad|mobile/i.test(userAgent);
    setIsMobile(mobile);
  }, []);

  const labelClass = "block mb-1 font-semibold text-gray-700";
  const inputClass =
    "w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#f43397]";

  return (
    <div>
      <label className={labelClass}>State *</label>

      {isMobile ? (
        // Native select on mobile for full-screen picker
        <select
          name="state"
          value={form.state}
          onChange={handleChange}
          required
          className={inputClass}>
          <option value="" disabled>
            Select State
          </option>
          {states.map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>
      ) : (
        // Input + datalist for desktop autocomplete
        <>
          <input
            list="state-list"
            name="state"
            required
            value={form.state}
            onChange={handleChange}
            placeholder="State"
            className={inputClass}
            autoComplete="off"
          />
          <datalist id="state-list">
            {states.map((state) => (
              <option key={state} value={state} />
            ))}
          </datalist>
        </>
      )}
    </div>
  );
};

export default StateSelector;
