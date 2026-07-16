import { useEffect, useState } from "react";
import api from "../api/axios";

function Profile() {

    const [user, setUser] = useState(null);

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

        </div>
    );
}

export default Profile;