// Single source of truth for the motor proposal fields.
// Used by VehicleFormBlock (manual entry), ExcelUploadPanel (bulk import),
// and MotorProposalForm (validation + submit payload shape).

export const FIELD_SECTIONS = [
  {
    title: "Vehicle Details",
    fields: [
      { key: "make", label: "Make", type: "text", placeholder: "e.g. Hyundai" },
      { key: "model", label: "Model", type: "text", placeholder: "e.g. Creta" },
      { key: "year", label: "Year of Manufacture", type: "number", placeholder: "2021" },
      {
        key: "vehicle_type",
        label: "Vehicle Type",
        type: "select",
        options: ["car", "suv", "hatchback", "sedan", "bike", "truck", "van"],
      },
      { key: "engine_cc", label: "Engine Capacity (cc)", type: "number", placeholder: "1500" },
      {
        key: "fuel_type",
        label: "Fuel Type",
        type: "select",
        options: ["petrol", "diesel", "electric", "cng", "hybrid"],
      },
      { key: "vehicle_value", label: "Vehicle Value (₹)", type: "number", placeholder: "1200000" },
      { key: "color", label: "Color", type: "text", placeholder: "e.g. White" },
      { key: "safety_features", label: "Safety Features (airbags/ABS etc.)", type: "select", options: ["yes", "no"] },
      { key: "anti_theft", label: "Anti-Theft Device", type: "select", options: ["yes", "no"] },
    ],
  },
  {
    title: "Driver Details",
    fields: [
      { key: "driver_age", label: "Driver Age", type: "number", placeholder: "32" },
      { key: "driving_experience", label: "Driving Experience (yrs)", type: "number", placeholder: "10" },
      { key: "license_age", label: "License Held Since (yrs)", type: "number", placeholder: "10" },
      { key: "previous_accidents", label: "Previous Accidents", type: "number", placeholder: "0" },
      { key: "previous_claims", label: "Previous Claims", type: "number", placeholder: "0" },
      { key: "traffic_violations", label: "Traffic Violations", type: "number", placeholder: "0" },
    ],
  },
  {
    title: "Usage & Location",
    fields: [
      { key: "usage_type", label: "Usage Type", type: "select", options: ["private", "commercial"] },
      { key: "annual_mileage", label: "Annual Mileage (km)", type: "number", placeholder: "12000" },
      { key: "city", label: "City", type: "text", placeholder: "e.g. Chennai" },
      { key: "region", label: "State / Region", type: "text", placeholder: "e.g. Tamil Nadu" },
    ],
  },
  {
    title: "Insurance History",
    fields: [
      { key: "previous_insurance", label: "Previously Insured Elsewhere", type: "select", options: ["yes", "no"] },
      { key: "policy_lapses", label: "Policy Lapses (count)", type: "number", placeholder: "0" },
    ],
  },
];

export const ALL_FIELDS = FIELD_SECTIONS.flatMap((s) => s.fields);
export const ALL_FIELD_KEYS = ALL_FIELDS.map((f) => f.key);

export function emptyVehicle() {
  return ALL_FIELD_KEYS.reduce((obj, key) => ({ ...obj, [key]: "" }), {});
}

// A fully-filled sample row, used for the downloadable Excel template
// and as placeholder inspiration for the empty state.
export const SAMPLE_VEHICLE = {
  make: "Hyundai",
  model: "Creta",
  year: 2021,
  vehicle_type: "suv",
  engine_cc: 1500,
  fuel_type: "diesel",
  vehicle_value: 1200000,
  safety_features: "yes",
  anti_theft: "no",
  color: "white",
  driver_age: 32,
  driving_experience: 10,
  license_age: 10,
  previous_accidents: 0,
  previous_claims: 0,
  traffic_violations: 1,
  usage_type: "private",
  annual_mileage: 12000,
  city: "Chennai",
  region: "Tamil Nadu",
  previous_insurance: "yes",
  policy_lapses: 0,
};

// Basic per-field validation — returns an error string, or null if valid.
export function validateField(key, value) {
  const field = ALL_FIELDS.find((f) => f.key === key);
  if (!field) return null;
  if (value === "" || value === null || value === undefined) return "Required";
  if (field.type === "number" && Number.isNaN(Number(value))) return "Must be a number";
  if (field.type === "select" && !field.options.includes(String(value).toLowerCase())) {
    return `Must be one of: ${field.options.join(" / ")}`;
  }
  return null;
}

export function validateVehicle(vehicle) {
  const errors = {};
  ALL_FIELD_KEYS.forEach((key) => {
    const err = validateField(key, vehicle[key]);
    if (err) errors[key] = err;
  });
  return errors;
}
