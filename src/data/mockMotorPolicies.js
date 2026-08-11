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
        vehicle_type: "SUV",
        registration_number: "TN 07 CX 4521",
        idv: 1200000,
        premium: 18400,
        issue_date: "2024-03-12",
        expiry_date: "2026-03-11",
      },
    ],
  };
}
