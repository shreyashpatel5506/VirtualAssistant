// src/Context/usercontext.js
import React, { useEffect, useState, createContext } from 'react';
import { authStore } from "../storevalues/auth.store.js";

export const UserContext = createContext();

const UserProvider = ({ children }) => {
    const [users, setUsers] = useState(null);
    const [selectedAssistant, setSelectedAssistant] = useState(null);
    const { getCurrentUser, getResponse } = authStore();

    const handleCurrentUser = async () => {
        try {
            const response = await getCurrentUser(); // axiosInstance response
            // If store returns response.data, not axios response, adjust accordingly
            const currentUser = response?.user || response?.data?.user;
            if (currentUser) {
                setUsers(currentUser);
                localStorage.setItem("user", JSON.stringify(currentUser));
                console.log("Current user set:", currentUser);
            }
        } catch (error) {
            console.error("Failed to fetch current user:", error);
        }
    };

    const getGeminiResponse = async (userMessage) => {
        try {
            const result = await getResponse();
        } catch (error) {

        }
    }

    useEffect(() => {
        handleCurrentUser();

    }, []);

    return (
        <UserContext.Provider
            value={{
                users,
                setUsers,
                selectedAssistant,
                setSelectedAssistant,
                getGeminiResponse
            }}
        >
            {children}
        </UserContext.Provider>
    );
};

export default UserProvider;
