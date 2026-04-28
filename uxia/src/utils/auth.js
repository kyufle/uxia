//archivo js para centralizar la logica d autenticacion login y logout etc

export const getGroups = () => {
  try {
    return JSON.parse(localStorage.getItem("groups") || "[]");
  } catch {
    return [];
  }
};

export const getUsername = () => {
  return localStorage.getItem("username");
};
export const isAdmin = () => {
  const groups = JSON.parse(localStorage.getItem("groups") || "[]");
  return groups.includes("uxiaAdmin");
};

export const logout = () => {
  localStorage.removeItem("username");
  localStorage.removeItem("groups");
};