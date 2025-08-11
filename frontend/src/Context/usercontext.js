import React from 'react'
import { Children } from 'react';
import { useContext } from 'react'
import { getUserProfile } from '../../../backend/controllers/auth.controller';
import { useEffect } from 'react';

const UserContext = React.createContext();

const UserProvider = ({ children }) => {
    const [user, setUser] = React.useState(null);

    const value = { user, setUser };
    const handleCurrentUser = async () => {
        const currentUser = await getUserProfile();
        setUser(currentUser);
    };

    useEffect(() => {
        handleCurrentUser();
    }, []);

    return (
        <UserContext.Provider value={value}>{children}</UserContext.Provider>
    )
}

export default UserProvider;