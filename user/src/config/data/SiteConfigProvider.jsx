import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { getSiteConfig } from "./siteConfigService";

const SiteConfigContext = createContext(null);

export const SiteConfigProvider = ({ children }) => {
  const [state, setState] = useState({
    sections: [],
    loading: true,
    error: null,
  });

  const load = useCallback(async (forceRefresh = false) => {
    try {
      const { data } = await getSiteConfig({ forceRefresh });
      setState({ sections: data.sections, loading: false, error: null });
    } catch (err) {
      console.error("Failed to load site config", err);
      setState((prev) => ({ ...prev, loading: false, error: err }));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <SiteConfigContext.Provider
      value={{
        sections: state.sections,
        loading: state.loading,
        error: state.error,
        refresh: () => load(true),
      }}>
      {children}
    </SiteConfigContext.Provider>
  );
};

export const useSiteConfig = () => {
  const ctx = useContext(SiteConfigContext);
  if (!ctx)
    throw new Error("useSiteConfig must be used within SiteConfigProvider");
  return ctx;
};
