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

export const normalizeDepartment = (department) => {
  if (!department || typeof department !== "string") {
    return "General";
  }

  const normalizedDepartment = department.trim();
  const matchedDepartment = ALLOWED_DEPARTMENTS.find(
    (allowedDepartment) =>
      allowedDepartment.toLowerCase() === normalizedDepartment.toLowerCase()
  );

  return matchedDepartment ?? "General";
};

export const validateComplaintFields = (state) => {
  const requiredFields = ["complaint", "department", "location"];
  const missingFields = requiredFields.filter((field) => {
    const value = state?.[field];
    return typeof value !== "string" || value.trim().length === 0;
  });

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
  const allowedKeys = ["complaint", "department", "location", "priority"];

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
