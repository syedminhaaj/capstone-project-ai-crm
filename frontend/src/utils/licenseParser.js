// src/utils/licenseParser.js

// Find all AAMVA-like field segments by code boundaries
function extractFields(rawText) {
  if (!rawText) return {};

  // Normalize: strip leading/trailing @ and weird line breaks
  let text = rawText
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\u2028|\u2029/g, "\n") // unicode line separators
    .replace(/@/g, "")
    .trim();

  const fields = {};
  // Match any code starting with D or Z followed by 2 alphanumerics: Dxx / Zxx
  const regex = /(D[A-Z0-9]{2}|Z[A-Z0-9]{2})/g;
  const matches = [];

  let match;
  while ((match = regex.exec(text)) !== null) {
    matches.push({ code: match[1], index: match.index });
  }

  for (let i = 0; i < matches.length; i++) {
    const { code, index } = matches[i];
    const start = index + 3; // skip the 3-char code itself
    const end = i + 1 < matches.length ? matches[i + 1].index : text.length;

    const value = text
      .slice(start, end)
      .replace(/[\r\n]+/g, " ") // collapse newlines in value
      .trim();

    if (!fields[code]) {
      fields[code] = value;
    }
  }

  return fields;
}

function formatDateYyyyMmDd(raw) {
  if (!raw) return "";
  const digits = raw.replace(/\D/g, ""); // keep only digits
  if (digits.length === 8) {
    const y = digits.slice(0, 4);
    const m = digits.slice(4, 6);
    const d = digits.slice(6, 8);
    return `${y}-${m}-${d}`; // good for <input type="date">
  }
  return digits;
}

export function parseLicenseTextToStudent(rawText) {
  const fields = extractFields(rawText);

  // AAMVA fields we care about
  const lastName = fields.DCS || ""; // SYED
  const givenNames = fields.DAC || ""; // ALLAHBAKSH SAMEER
  const middleField = fields.DAD || "";
  const street = fields.DAG || ""; // 1695 RENNIE ST
  const city = fields.DAI || ""; // OSHAWA
  const state = fields.DAJ || ""; // ON
  let postal = fields.DAK || ""; // L1K0N8.

  let licenseNumber = fields.DAQ || ""; // S96390260903311
  const dobRaw = fields.DBB || ""; // 19901112
  const issueRaw = fields.DBD || ""; // 20240809
  const expiryRaw = fields.DBA || ""; // 20290808
  const height = fields.DAU || ""; // 170 cm
  const licenseClass = fields.DCA || ""; // G1
  const countryCode = fields.DCG || fields.DCG || "CAN";

  // Clean postal (remove trailing dots)
  postal = postal.replace(/\.+$/, "").trim();

  // Clean license number to alphanumerics only
  licenseNumber = licenseNumber.replace(/[^A-Z0-9]/gi, "").trim();

  // Parse DOB / issue / expiry to YYYY-MM-DD
  const dateOfBirth = formatDateYyyyMmDd(dobRaw);
  const issueDate = formatDateYyyyMmDd(issueRaw);
  const expiryDate = formatDateYyyyMmDd(expiryRaw);

  // Split given names
  let firstName = givenNames;
  let middleName = middleField;

  if (givenNames) {
    const parts = givenNames.split(/\s+/);
    firstName = parts[0] || "";
    const rest = parts.slice(1).join(" ");
    if (!middleName && rest) {
      middleName = rest;
    }
  }

  // Full name for your form
  const fullName = [firstName, middleName, lastName].filter(Boolean).join(" ");

  const addressLine = street;
  const cityStatePostal = [city, state, postal].filter(Boolean).join(" ");
  const fullAddress = [addressLine, cityStatePostal].filter(Boolean).join(", ");

  // This is what your StudentModal expects to fill the form
  const student = {
    name: fullName,
    license_number: licenseNumber,
    date_of_birth: dateOfBirth, // "YYYY-MM-DD"
    address: fullAddress,

    // extra fields (you can use later if you want)
    email: "",
    phone: "",
    emergency_contact: "",
    emergency_phone: "",
    status: "Active",
    lessons_completed: 0,
    instructor_id: null,
  };

  // Optional: raw breakdown for debugging / templates
  const licenseRaw = {
    first_name: firstName,
    middle_name: middleName,
    last_name: lastName,
    street,
    city,
    state,
    postal_code: postal,
    license_number: licenseNumber,
    dob: dateOfBirth,
    issue_date: issueDate,
    expiry_date: expiryDate,
    height,
    license_class: licenseClass,
    country: countryCode,
  };

  return { student, licenseRaw };
}
