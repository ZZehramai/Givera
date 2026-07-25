import { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

function Profile() {

    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const logout = () => {

    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");

    navigate("/login");
};

    useEffect(() => {
        const getProfile = async () => {
            try {
                const response = await api.get(
                    "/auth/profile/"
                );

                setUser(response.data);

            } catch(error) {
                console.log(error);
            }
        };

        getProfile();

    }, []);


    if (!user) {
        return <h2>Loading...</h2>;
    }

return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-20 font-sans">
        {/* Header with the blue dash */}
        <div className="max-w-4xl mx-auto flex items-center gap-3 mb-8">
            
            <h1 className="text-xl font-semibold text-gray-700">{user.username} Profile</h1>
        </div>

        {/* Main Card */}
        <div className="max-w-4xl mx-auto bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100">
            <div className="flex flex-col md:flex-row gap-12">
                
                {/* Left Side: Image and Upload Boxes */}
                <div className="w-full md:w-1/2 flex flex-col gap-4">
                    {/* Character/Avatar Box */}
                    <div className="bg-[#F5F6FF] rounded-2xl aspect-square relative flex items-end justify-center overflow-hidden">
                        <div className="absolute top-4 left-4 bg-white p-2 rounded-lg shadow-sm">
                            <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20"><path d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" /></svg>
                        </div>
                        {/* Placeholder for the illustration */}
                        <div className="w-40 h-56 bg-slate-800 rounded-t-full relative">
                           <div className="absolute top-4 left-4 w-12 h-12 bg-rose-300 rounded-full"></div>
                        </div>
                    </div>

        
                </div>

                {/* Right Side: Data Fields */}
                <div className="w-full md:w-1/2 flex flex-col justify-between py-2">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-800">Name:</label>
                            <p className="text-gray-500">{user.username}</p>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-800">Email:</label>
                            <p className="text-gray-500">{user.email}</p>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-800">Phone Number:</label>
                            <p className="text-gray-500">{user.phone || "+959123456789"}</p>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-800">Address:</label>
                            <p className="text-gray-500 leading-relaxed">
                                {user.address || "Yangon,Myanmar"}
                            </p>
                            
                        </div>
                    </div>

                    {/* Buttons Section */}
                    <div className="mt-12 flex flex-col gap-3">
                        <button className="w-full md:w-max px-8 py-3 border border-indigo-200 rounded-xl text-indigo-600 text-xs font-bold tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-50 transition-colors uppercase">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                            Edit Profile
                        </button>

                        <button 
                            onClick={logout}
                            className="w-full md:w-max px-8 py-2 text-red-400 text-xs font-medium hover:text-red-600 transition-colors text-left"
                        >
                            Logout Account
                        </button>
                    </div>
                </div>

            </div>
        </div>
    </div>
);



}

export default Profile;