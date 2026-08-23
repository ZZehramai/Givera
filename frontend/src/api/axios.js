import axios from "axios";

const apiBaseUrl = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");

const api = axios.create({
    baseURL: apiBaseUrl,
});


// Request interceptor
api.interceptors.request.use((config) => {

    const token = localStorage.getItem("access");

    const publicRoutes = [
        "/auth/login/",
        "/auth/register/",
        "/auth/google/",
        "/auth/token/refresh/",
    ];

    const isPublic = publicRoutes.includes(config.url);

    if (token && !isPublic) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});


// Response interceptor
api.interceptors.response.use(

    (response) => response,

    async (error) => {

        const originalRequest = error.config;

        if (
            error.response?.status === 401 &&
            !originalRequest._retry
        ) {

            originalRequest._retry = true;

            const refresh = localStorage.getItem("refresh");

            if (!refresh) {
                window.location.href = "/login";
                return Promise.reject(error);
            }

            try {

                const response = await axios.post(
                    `${apiBaseUrl}/auth/token/refresh/`,
                    {
                        refresh,
                    }
                );

                const newAccess = response.data.access;

                localStorage.setItem(
                    "access",
                    newAccess
                );

                originalRequest.headers.Authorization =
                    `Bearer ${newAccess}`;

                return api(originalRequest);

            } catch (refreshError) {

                localStorage.removeItem("access");
                localStorage.removeItem("refresh");
                localStorage.removeItem("user");

                window.location.href = "/login";

                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export const getComments = async (campaignId) => {
  // Check casing: Use API (or api) matching whatever variable you defined above
  const response = await API.get(`/campaigns/${campaignId}/comments/`);
  return response.data;
};

export const postComment = async (campaignId, content) => {
  const response = await API.post(`/campaigns/${campaignId}/comments/`, { content });
  return response.data;
};
export default api;