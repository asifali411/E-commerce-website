import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

/*
  NOTE:
  - unlike other types kept inside `schema.ts`, `Settings` type is kept inside the provider for easy maintenance
  - when updating settings, make sure to update the default settings as well.
*/
interface Settings {
  // appearance
  darkMode: boolean;

  // notifications
  showBidAlert: boolean;
  showItemUpdates: boolean;
  showRatingNotification: boolean;
}

interface SettingContextType {
  settings: Settings;
  changeSetting: (setting: keyof Settings, value: boolean) => void;
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
  toggleTheme: () => void;
}

const SettingContext = createContext<SettingContextType | undefined>(undefined);

const defaultSettings: Settings = {
  darkMode: false,
  showBidAlert: true,
  showItemUpdates: true,
  showRatingNotification: true,
};

const getInitialTheme = (): "light" | "dark" => {
  if (typeof window === "undefined") return "light";

  const savedTheme = window.localStorage.getItem("theme");
  if (savedTheme === "dark" || savedTheme === "light") return savedTheme;

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const getInitialSettings = (): Settings => {
  if (typeof window === "undefined") return defaultSettings;

  const savedSettings = window.localStorage.getItem("settings");
  if (!savedSettings) return defaultSettings;

  try {
    const parsed = JSON.parse(savedSettings) as Partial<Settings>;
    return {
      darkMode: parsed.darkMode ?? defaultSettings.darkMode,
      showBidAlert: parsed.showBidAlert ?? defaultSettings.showBidAlert,
      showItemUpdates: parsed.showItemUpdates ?? defaultSettings.showItemUpdates,
      showRatingNotification: parsed.showRatingNotification ?? defaultSettings.showRatingNotification,
    };
  } catch {
    return defaultSettings;
  }
};

export const SettingProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<Settings>(getInitialSettings);
  const [theme, setThemeState] = useState<"light" | "dark">(() => {
    const initial = getInitialTheme();
    return initial;
  });

  useEffect(() => {
    window.localStorage.setItem("settings", JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    window.localStorage.setItem("theme", theme);

    if (settings.darkMode !== (theme === "dark")) {
      setSettings((prev) => ({ ...prev, darkMode: theme === "dark" }));
    }
  }, [theme, settings.darkMode]);

  const changeSetting = (setting: keyof Settings, value: boolean) => {
    setSettings((prev) => ({ ...prev, [setting]: value }));

    if (setting === "darkMode") {
      setThemeState(value ? "dark" : "light");
    }
  };

  const setTheme = (newTheme: "light" | "dark") => {
    setThemeState(newTheme);
    setSettings((prev) => ({ ...prev, darkMode: newTheme === "dark" }));
  };

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  const value: SettingContextType = {
    settings,
    changeSetting,
    theme,
    setTheme,
    toggleTheme,
  };

  return (
    <SettingContext.Provider value={value}>
      {children}
    </SettingContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingContext);
  if (!context) throw new Error("useSettings must be used within a SettingProvider");
  return { settings: context.settings, changeSetting: context.changeSetting };
};

export const useDarkMode = () => {
  const context = useContext(SettingContext);
  if (!context) throw new Error("useDarkMode must be used within a SettingProvider");

  return {
    theme: context.theme,
    toggleTheme: context.toggleTheme,
    setTheme: context.setTheme,
  };
};
