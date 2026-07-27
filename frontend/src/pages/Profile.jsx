import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

function Profile () {
  const navigate = useNavigate();
  
  // States
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  
  // Form State (temp storage for edits)
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone_number: "",
    country: "",
  });

  // 1. Fetch Profile Data on Load
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/auth/profile/");
        console.log("Fetched Data:", response.data);
        setUser(response.data);
        // Pre-fill the form with existing data
        setFormData({
          username: response.data.username || "",
          email: response.data.email || "",
          phone_number: response.data.phone_number || "",
          country: response.data.country || "",
        });
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // 2. Handle Input Changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 3. Save Changes to Backend
  const handleSave = async () => {
    setSaveLoading(true);
    console.log("Sending to backend:", formData);
    try {
      // We use PATCH to only update specific fields
      const response = await api.patch("/auth/profile/", formData);
      localStorage.setItem("user", JSON.stringify(response.data));
      window.dispatchEvent(new Event("userUpdated"));
      console.log("Backend response:", response.data);
      setUser(response.data);
      setIsEditing(false);    // Exit edit mode
      alert("Profile updated successfully!");


    } catch (error) {
      console.error("Update failed:", error.response?.data);
      alert("Failed to update profile.");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  if (loading) return <div className="p-20 text-center font-bold">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-20">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-8">{user.username} Profile</h1>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex flex-col md:flex-row">
            
            {/* Left Column: Profile Picture Visual */}
            <div className="w-full md:w-1/3 bg-indigo-50 p-10 flex flex-col items-center justify-center border-r border-gray-100">
              <div className="w-32 h-32 bg-indigo-600 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-lg mb-4">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
              <p className="font-bold text-indigo-900">{user?.username}</p>
              <p className="text-sm text-indigo-400">{user?.email}</p>
            </div>

            {/* Right Column: Information Fields */}
            <div className="w-full md:w-2/3 p-8 md:p-12">
              <div className="grid gap-6">
                
                {/* Username Field */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Full Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                  ) : (
                    <p className="text-gray-700 font-medium">{user.username}</p>
                  )}
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Email Address</label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  ) : (
                    <p className="text-gray-700 font-medium">{user.email}</p>
                  )}
                </div>

                {/* Phone Field */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Phone Number</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleChange}
                      placeholder="e.g. +95 9..."
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  ) : (
                    <p className="text-gray-700 font-medium">{user.phone_number || "No phone provided"}</p>
                  )}
                </div>

                {/* Address Field */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Location</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  ) : (
                    <p className="text-gray-700 font-medium">{user.country || "Yangon, Myanmar"}</p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSave}
                      disabled={saveLoading}
                      className="flex-1 bg-indigo-600 text-white py-3 px-6 rounded-xl font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    >
                      {saveLoading ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="flex-1 bg-gray-100 text-gray-600 py-3 px-6 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex-1 bg-white border-2 border-indigo-600 text-indigo-600 py-3 px-6 rounded-xl font-bold hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
                    >
                      <EditIcon /> Edit Profile
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex-1 text-red-500 font-bold hover:bg-red-50 py-3 px-6 rounded-xl transition-colors"
                    >
                      Logout Account
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Small Inline Icon Component
const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
  </svg>
);

export default Profile;