import api from "../api/axios";

export const login = async (email, password) => {
    const response = await api.post("/auth/login/", {
        email,
        password,
    });

    localStorage.setItem(
        "access",
        response.data.access
    );

    localStorage.setItem(
        "refresh",
        response.data.refresh
    );

    localStorage.setItem(
        "user",
        JSON.stringify(response.data.user)
    );

    return response.data;
};

export const logout = () => {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  localStorage.removeItem("user");
};