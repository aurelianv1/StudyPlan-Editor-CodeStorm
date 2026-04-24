"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface AppState {
    isPlanUploaded: boolean;
    setPlanUploaded: (status: boolean) => void;
    planId: string | null;
    setPlanId: (id: string | null) => void;
    planMetadata: any;
    setPlanMetadata: (data: any) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
    const [isPlanUploaded, setPlanUploaded] = useState(false);
    const [planId, setPlanId] = useState<string | null>(null);
    const [planMetadata, setPlanMetadata] = useState(null);

    return (
        <AppContext.Provider
            value={{
                isPlanUploaded,
                setPlanUploaded,
                planId,
                setPlanId,
                planMetadata,
                setPlanMetadata
            }}
        >
            {children}
        </AppContext.Provider>
    );
}

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) throw new Error("useAppContext trebuie folosit în AppProvider");
    return context;
};