import { createContext, useContext, useState, type ReactNode } from "react";

/*
  NOTE:
  - unlike other types kept inside `schema.ts`, `Settings` type is kept inside the provider for easy maintenance
  - when updating settings, make sure to update the default settings as well.  
*/
interface Settings {
  // appearance
  darkMode: boolean;

  // notifications
  showBidAlert: boolean,
  showItemUpdates: boolean,
  showRatingNotification: boolean,
};

interface SettingContextType {
  settings: Settings,
  changeSetting: (setting: keyof Settings, value: boolean) => void;
}

const SettingContext = createContext<SettingContextType | undefined>(undefined);

export const SettingProvider = ({children}: {children: ReactNode}) => {

  // Default Settings
  const [settings, setSettings] = useState<Settings>({
    // appearance
    darkMode: false,

    // notifications
    showBidAlert: true,
    showItemUpdates: true,
    showRatingNotification: true,
  });

  const changeSetting = (setting: keyof Settings, value: boolean) => {
    setSettings((prev) => {
      const newSettings = prev;
      newSettings[setting] = value;
      return newSettings;
    });
  };


  const value = { settings, changeSetting };
  return (
    <SettingContext.Provider value={value}>
      {children}
    </SettingContext.Provider>
  )
};


export const useSettings = () => {
  const context = useContext(SettingContext);
  if(!context)
    throw new Error("useSettings must be used within a SettingProvider");
  return context;
} 