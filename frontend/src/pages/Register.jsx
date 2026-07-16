import { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

export function Register() {

    const navigate = useNavigate();

    const [form, setForm] = useState({
        email: "",
        username: "",
        first_name: "",
        last_name: "",
        password: "",
        password2: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const register = async () => {

        setLoading(true);
        setError("");

        try {

            const response = await api.post("/auth/register/", form);

            alert("Registration successful!");

            console.log(response.data);

            navigate("/login");

        } catch (err) {

            console.log(err.response?.data);

            if (err.response?.data) {
                const firstError = Object.values(err.response.data)[0];
                setError(Array.isArray(firstError) ? firstError[0] : firstError);
            } else {
                setError("Something went wrong.");
            }

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-100 via-white to-purple-200 flex items-center justify-center px-4">

            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8">

                <div className="text-center mb-8">

                    <h1 className="text-4xl font-bold text-gray-800">
                        Create Account
                    </h1>

                    <p className="text-gray-500 mt-2">
                        Register to get started
                    </p>

                </div>

                <div className="space-y-4">

                    <input
                        name="email"
                        type="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                    />

                    <input
                        name="username"
                        type="text"
                        placeholder="Username"
                        value={form.username}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                    />

                    <input
                        name="first_name"
                        type="text"
                        placeholder="First Name"
                        value={form.first_name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                    />

                    <input
                        name="last_name"
                        type="text"
                        placeholder="Last Name"
                        value={form.last_name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                    />

                    <input
                        name="password"
                        type="password"
                        placeholder="Password"
                        value={form.password}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                    />

                    <input
                        name="password2"
                        type="password"
                        placeholder="Confirm Password"
                        value={form.password2}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                    />

                    {error && (
                        <div className="text-red-500 text-sm">
                            {error}
                        </div>
                    )}

                    <button
                        onClick={register}
                        disabled={loading}
                        className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-semibold py-3 rounded-xl transition"
                    >
                        {loading ? "Creating Account..." : "Create Account"}
                    </button>

                    <p className="text-center text-gray-600">

                        Already have an account?

                        <span
                            onClick={() => navigate("/login")}
                            className="ml-1 text-purple-600 font-semibold cursor-pointer hover:underline"
                        >
                            Login
                        </span>

                    </p>

                </div>

            </div>

        </div>
    );
}