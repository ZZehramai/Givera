import api from "../api/axios";

const saveSession = (data) => {
  localStorage.setItem("access", data.access);
  localStorage.setItem("refresh", data.refresh);
  localStorage.setItem("user", JSON.stringify(data.user));
};

export const login = async (email, password) => {
  const response = await api.post("/auth/login/", {
    email,
    password,
  });

  saveSession(response.data);
  return response.data;
};

export const loginWithGoogle = async (credential) => {
  const response = await api.post("/auth/google/", {
    id_token: credential,
  });

  saveSession(response.data);
  return response.data;
};

export const logout = () => {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  localStorage.removeItem("user");
};