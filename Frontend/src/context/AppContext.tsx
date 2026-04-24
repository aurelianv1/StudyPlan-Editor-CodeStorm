"use client";
import { createContext, useContext, useState, ReactNode } from "react";

interface AppState {
    isPlanUploaded: boolean;
    setPlanUploaded: (status: boolean) => void;
    planMetadata: any; // Aici vei salva ulterior detalii de la backend
    setPlanMetadata: (data: any) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
    const [isPlanUploaded, setPlanUploaded] = useState(false);
    const [planMetadata, setPlanMetadata] = useState(null);

    return (
        <AppContext.Provider value={{ isPlanUploaded, setPlanUploaded, planMetadata, setPlanMetadata }}>
            {children}
        </AppContext.Provider>
    );
}

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) throw new Error("useAppContext trebuie folosit în AppProvider");
    return context;
};