import { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

export function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const login = async () => {

        setLoading(true);
        setError("");

        try {

            const response = await api.post("/auth/login/", {
                email,
                password,
            });

            localStorage.setItem("access", response.data.access);
            localStorage.setItem("refresh", response.data.refresh);
            localStorage.setItem(
                "user",
                JSON.stringify(response.data.user)
            );

            navigate("/profile");

        } catch (err) {

            console.log(err.response?.data);

            if (err.response?.data?.non_field_errors) {
                setError(err.response.data.non_field_errors[0]);
            } else if (typeof err.response?.data === "string") {
                setError(err.response.data);
            } else {
                setError("Invalid email or password.");
            }

        } finally {
            setLoading(false);
        }
    };

    const googleLogin = () => {
        window.location.href =
            "http://127.0.0.1:8000/api/accounts/google/login/";
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-purple-100 flex items-center justify-center px-4">

            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8">

                <div className="text-center mb-8">

                    <h1 className="text-4xl font-bold text-gray-800">
                        Welcome Back!
                    </h1>

                    <p className="text-gray-500 mt-2">
                        Sign in to continue
                    </p>

                </div>

                <div className="space-y-5">

                    <div>

                        <label className="block text-gray-700 mb-2 font-medium">
                            Email
                        </label>

                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-purple-500"
                        />

                    </div>

                    <div>

                        <label className="block text-gray-700 mb-2 font-medium">
                            Password
                        </label>

                        <input
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-purple-500"
                        />

                    </div>

                    {error && (
                        <div className="text-red-500 text-sm">
                            {error}
                        </div>
                    )}

                    <button
                        onClick={login}
                        disabled={loading}
                        className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-semibold py-3 rounded-xl transition"
                    >
                        {loading ? "Signing In..." : "Login"}
                    </button>

                    <div className="flex items-center">

                        <div className="flex-grow border-t"></div>

                        <span className="mx-4 text-gray-400">
                            OR
                        </span>

                        <div className="flex-grow border-t"></div>

                    </div>

                    <button
                        onClick={googleLogin}
                        className="w-full border hover:bg-gray-100 py-3 rounded-xl flex items-center justify-center gap-3 transition"
                    >

                        <img
                            src="https://www.svgrepo.com/show/475656/google-color.svg"
                            alt="Google"
                            className="w-5 h-5"
                        />

                        <span className="font-medium">
                            Continue with Google
                        </span>

                    </button>

                    <p className="text-center text-gray-600">

                        Don't have an account?

                        <span
                            onClick={() => navigate("/register")}
                            className="ml-1 text-purple-600 font-semibold cursor-pointer hover:underline"
                        >
                            Register
                        </span>

                    </p>

                </div>

            </div>

        </div>
    );
}