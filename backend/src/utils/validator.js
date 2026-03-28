const ALLOWED_DEPARTMENTS = [
  "General",
  "Water",
  "Electricity",
  "Sanitation",
  "Roads",
  "Transport",
  "Police",
  "Health",
  "Education",
];

const GENERIC_LOCATION_VALUES = new Set([
  "here",
  "there",
  "nearby",
  "my area",
  "our area",
  "area",
  "road",
  "street",
  "footpath",
  "market",
  "park",
  "office",
  "school",
  "college",
  "hospital",
  "home",
  "house",
  "building",
  "society",
  "colony",
  "locality",
  "junction",
  "signal",
  "corner",
  "ward",
  "bus stop",
]);

export const normalizeDepartment = (department) => {
  if (!department || typeof department !== "string") {
    return "General";
  }

  const normalizedDepartment = department.trim();
  const matchedDepartment = ALLOWED_DEPARTMENTS.find(
    (allowedDepartment) =>
      allowedDepartment.toLowerCase() === normalizedDepartment.toLowerCase()
  );

  return matchedDepartment ?? normalizedDepartment;
};

export const isMeaningfulComplaint = (complaint) => {
  if (typeof complaint !== "string") {
    return false;
  }

  const normalizedComplaint = complaint.trim();
  if (normalizedComplaint.length < 12) {
    return false;
  }

  const wordCount = normalizedComplaint.split(/\s+/).length;
  return wordCount >= 4;
};

export const isMeaningfulLocation = (location) => {
  if (typeof location !== "string") {
    return false;
  }

  const normalizedLocation = location.trim();
  if (normalizedLocation.length < 6) {
    return false;
  }

  const loweredLocation = normalizedLocation.toLowerCase();
  if (GENERIC_LOCATION_VALUES.has(loweredLocation)) {
    return false;
  }

  const wordCount = loweredLocation.split(/\s+/).length;
  const hasSpecificMarker =
    /\d/.test(loweredLocation) ||
    loweredLocation.includes(",") ||
    /\b(near|opp|opposite|behind|beside|sector|block|ward|lane|street|road|nagar|colony|market|phase)\b/.test(loweredLocation);

  const looksLikeSinglePlaceName =
    wordCount === 1 && loweredLocation.length >= 4 && !GENERIC_LOCATION_VALUES.has(loweredLocation);

  return wordCount >= 2 || hasSpecificMarker || looksLikeSinglePlaceName;
};

export const validateComplaintFields = (state) => {
  const missingFields = [];

  if (!isMeaningfulComplaint(state?.complaint)) {
    missingFields.push("complaint");
  }

  if (typeof state?.department !== "string" || state.department.trim().length === 0) {
    missingFields.push("department");
  }

  if (!isMeaningfulLocation(state?.location)) {
    missingFields.push("location");
  }

  return {
    isValid: missingFields.length === 0,
    missingFields,
  };
};

export const sanitizeStateUpdate = (stateUpdate) => {
  if (!stateUpdate || typeof stateUpdate !== "object" || Array.isArray(stateUpdate)) {
    return {};
  }

  const nextState = {};
  const allowedKeys = ["complaint", "department", "location", "priority", "ticketId"];

  for (const key of allowedKeys) {
    if (typeof stateUpdate[key] === "string" && stateUpdate[key].trim()) {
      nextState[key] = stateUpdate[key].trim();
    }
  }

  if (nextState.department) {
    nextState.department = normalizeDepartment(nextState.department);
  }

  return nextState;
};
