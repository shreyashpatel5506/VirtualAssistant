// usercontext.js
import React, { useEffect, useState, createContext } from 'react';
import { getUserProfile } from '../../../backend/controllers/auth.controller'; // ⚠ should be API call, not backend import

export const UserContext = createContext();

const UserProvider = ({ children }) => {
    const [users, setUsers] = useState(null);

    const handleCurrentUser = async () => {
        const currentUser = await getUserProfile();
        setUsers(currentUser);
    };

    useEffect(() => {
        handleCurrentUser();
    }, []);

    return (
        <UserContext.Provider value={{ users, setUsers }}>
            {children}
        </UserContext.Provider>
    );
};

export default UserProvider;
