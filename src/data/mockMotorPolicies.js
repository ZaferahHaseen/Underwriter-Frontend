// Stand-in for the real motor API. Shaped to match the response format
// clientLogin() already uses for health ({ client, policies }) so swapping
// this out for a real endpoint later is a drop-in replacement.

export function getMockMotorData(email) {
  return {
    client: {
      full_name: "Arun Kumar",
      email: email || "arun.kumar@example.com",
      age: 32,
      occupation: "Software Engineer",
    },
    vehicles: [
      {
        id: "mv-1",
        policy_number: "MOT-2024-00871",
        status: "Active",
        make: "Hyundai",
        model: "Creta",
        year: 2021,
        vehicle_type: "suv",
        registration_number: "TN 07 CX 4521",
        idv: 1200000,
        premium: 18400,
        issue_date: "2024-03-12",
        expiry_date: "2026-03-11",

        // Underwriting details as originally submitted — shown when the
        // client clicks "View" and lands back on the proposal form.
        fuel_type: "petrol",
        engine_cc: 1500,
        vehicle_value: 1200000,
        color: "white",
        safety_features: "yes",
        anti_theft: "no",
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
      },
    ],
  };
}
