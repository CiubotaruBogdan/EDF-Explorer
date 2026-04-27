import { createContext, useContext, type ReactNode } from "react";

const ThemeContext = createContext<{ theme: string }>({ theme: "light" });
export function ThemeProvider({ children }: { children: ReactNode; defaultTheme?: string }) {
  return <ThemeContext.Provider value={{ theme: "light" }}>{children}</ThemeContext.Provider>;
}
export function useTheme() { return useContext(ThemeContext); }
