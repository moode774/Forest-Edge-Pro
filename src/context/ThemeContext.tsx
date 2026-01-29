import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
    isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    // FORCE LIGHT MODE: Ignore localStorage and always default to 'light'
    const [theme, setThemeState] = useState<Theme>('light');

    const setTheme = (newTheme: Theme) => {
        // No-op for now as user requested removal of dark mode support
        // setThemeState(newTheme);
    };

    const toggleTheme = () => {
        // Disabled
    };

    useEffect(() => {
        // Ensure dark class is NEVER applied
        document.documentElement.classList.remove('dark');
        localStorage.removeItem('app_theme');
    }, []);

    const isDark = false;

    return (
        <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, isDark }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
