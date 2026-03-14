import { useState, useEffect } from "react";

const usePWADownload = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault(); // Prevent automatic prompt
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const triggerInstall = async () => {
    if (!deferredPrompt) return false;

    deferredPrompt.prompt(); // Show browser install prompt
    const choice = await deferredPrompt.userChoice;
    setDeferredPrompt(null); // reset
    return choice.outcome === "accepted";
  };

  return { triggerInstall, deferredPrompt };
};

export default usePWADownload;