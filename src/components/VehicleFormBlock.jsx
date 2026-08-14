import { useState } from "react";
import { FaChevronDown, FaTrashAlt, FaCarSide, FaExclamationCircle } from "react-icons/fa";
import { FIELD_SECTIONS } from "../data/motorFormFields";
import "./VehicleFormBlock.css";

function slugify(title) {
  return title.toLowerCase().replace(/&/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function VehicleFormBlock({ index, vehicle, errors = {}, onChange, onRemove, canRemove, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);

  const label = vehicle.make || vehicle.model
    ? `${vehicle.make || "New"} ${vehicle.model || "Vehicle"}`.trim()
    : `Vehicle ${index + 1}`;

  const errorCount = Object.keys(errors).length;

  return (
    <div className={`vfb-card ${open ? "vfb-open" : ""}`}>
      <button type="button" className="vfb-head" onClick={() => setOpen((o) => !o)}>
        <div className="vfb-head-left">
          <span className="vfb-head-icon"><FaCarSide /></span>
          <div>
            <span className="vfb-head-title">{label}</span>
            <span className="vfb-head-sub">Vehicle {index + 1}</span>
          </div>
        </div>
        <div className="vfb-head-right">
          {errorCount > 0 && (
            <span className="vfb-error-badge">
              <FaExclamationCircle /> {errorCount} field{errorCount > 1 ? "s" : ""}
            </span>
          )}
          {canRemove && (
            <span
              role="button"
              tabIndex={0}
              className="vfb-remove"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              title="Remove this vehicle"
            >
              <FaTrashAlt />
            </span>
          )}
          <FaChevronDown className="vfb-chevron" />
        </div>
      </button>

      {open && (
        <div className="vfb-body">
          {FIELD_SECTIONS.map((section) => (
            <div className="vfb-section" id={`mpf-step-${slugify(section.title)}`} key={section.title}>
              <h4 className="vfb-section-title">{section.title}</h4>
              <div className="vfb-field-grid">
                {section.fields.map((field) => (
                  <label key={field.key} className="vfb-field">
                    <span className="vfb-field-label">{field.label}</span>
                    {field.type === "select" ? (
                      <select
                        className={`vfb-input ${errors[field.key] ? "vfb-input-error" : ""}`}
                        value={vehicle[field.key] ?? ""}
                        onChange={(e) => onChange(field.key, e.target.value)}
                      >
                        <option value="" disabled>Select…</option>
                        {field.options.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt.charAt(0).toUpperCase() + opt.slice(1)}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        className={`vfb-input ${errors[field.key] ? "vfb-input-error" : ""}`}
                        type={field.type}
                        placeholder={field.placeholder || ""}
                        value={vehicle[field.key] ?? ""}
                        onChange={(e) => onChange(field.key, e.target.value)}
                      />
                    )}
                    {errors[field.key] && <span className="vfb-field-error">{errors[field.key]}</span>}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default VehicleFormBlock;