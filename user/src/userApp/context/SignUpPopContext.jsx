import { createContext, useContext, useState } from "react";

const PopupContext = createContext();

export const PopupProvider = ({ children }) => {
  const [signupOpen, setSignupOpen] = useState(true);
  console.log(signupOpen);

  const openSignupPopup = () => setSignupOpen(true);
  const closeSignupPopup = () => setSignupOpen(false);

  return (
    <PopupContext.Provider
      value={{ signupOpen, openSignupPopup, closeSignupPopup }}>
      {children}
    </PopupContext.Provider>
  );
};

export const usePopup = () => useContext(PopupContext);
