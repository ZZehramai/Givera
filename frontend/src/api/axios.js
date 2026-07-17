import axios from "axios";

const api = axios.create({
    baseURL: "http://127.0.0.1:8000/api",
});


// Request interceptor
api.interceptors.request.use((config) => {

    const token = localStorage.getItem("access");

    const publicRoutes = [
        "/auth/login/",
        "/auth/register/",
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
                    "http://127.0.0.1:8000/api/auth/token/refresh/",
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

                localStorage.clear();

                window.location.href = "/login";

                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;