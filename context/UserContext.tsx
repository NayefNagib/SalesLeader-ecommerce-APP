import React, { createContext, useContext, useState } from 'react';

type UserContextType = {
  profileImageUrl: string | null;
  setProfileImageUrl: (url: string | null) => void;
};

const UserContext = createContext<UserContextType>({
  profileImageUrl: null,
  setProfileImageUrl: () => {},
});

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);

  return (
    <UserContext.Provider value={{ profileImageUrl, setProfileImageUrl }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
