import { createContext, useContext, useState } from "react";
import { User } from "../types";

// 1. Define what data the context will provide
type EventContextType = {
  loggedUser: User  | undefined;
  setLoggedUser: React.Dispatch<React.SetStateAction<User | undefined>>;
};


// 2. Create the context
const EventContext = createContext<EventContextType | undefined>(undefined);


// 3. Create a custom hook for easier usage
const useEventContext = () => {
    const context = useContext(EventContext);
    if(!context) { throw new Error('useEventContext must be used inside EventProvider'); }
    return context;
};


// 4. Create the provider component
const EventProvider = ({children}: {children: React.ReactNode}) => {
    const [loggedUser, setLoggedUser] = useState<User>();


    return (
        <EventContext.Provider value={{loggedUser, setLoggedUser}}>
            {children}
        </EventContext.Provider>
    );
};

export {EventProvider, useEventContext};