import { useState, useEffect } from "react";
import { homepageService } from "../services/firebase/homepageService";

export const useHomepage = () => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadHomepageConfig = async () => {
    try {
      setLoading(true);
      setError(null);
      const configData = await homepageService.getHomepageConfig();
      setConfig(configData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateHomepageConfig = async (updatedConfig) => {
    try {
      setLoading(true);
      setError(null);
      await homepageService.updateHomepageConfig(updatedConfig);
      setConfig(updatedConfig);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateSection = async (section, data) => {
    try {
      const updatedConfig = {
        ...config,
        [section]: {
          ...config[section],
          ...data
        }
      };
      await updateHomepageConfig(updatedConfig);
    } catch (err) {
      throw err;
    }
  };

  const toggleSection = async (section, enabled) => {
    await updateSection(section, { enabled });
  };

  useEffect(() => {
    loadHomepageConfig();
  }, []);

  return {
    config,
    loading,
    error,
    updateHomepageConfig,
    updateSection,
    toggleSection,
    refreshConfig: loadHomepageConfig
  };
};