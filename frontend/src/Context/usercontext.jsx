// src/Context/usercontext.js
import React, { useEffect, useState, createContext } from 'react';

// Create the context
export const UserContext = createContext();

const UserProvider = ({ children }) => {
    const [users, setUsers] = useState(null); // Your logged-in user object
    const [selectedAssistant, setSelectedAssistant] = useState(null); // Stores selected assistant image

    // Simulate getting current user (replace with API call)
    const handleCurrentUser = async () => {
        // Example: fetch from backend
        // const currentUser = await getUserProfile();
        const currentUser = null;
        setUsers(currentUser);
    };

    useEffect(() => {
        handleCurrentUser();
    }, []);

    return (
        <UserContext.Provider value={{
            users,
            setUsers,
            selectedAssistant,
            setSelectedAssistant
        }}>
            {children}
        </UserContext.Provider>
    );
};

export default UserProvider;
