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
}

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
        <div>
            <h1>
                Profile
            </h1>

            <p>
                Username: {user.username}
            </p>

            <p>
                Email: {user.email}
            </p>

            <p>
                Role: {user.role}
            </p>
          <button onClick={logout}>Logout</button>
        </div>

    );
}

export default Profile;