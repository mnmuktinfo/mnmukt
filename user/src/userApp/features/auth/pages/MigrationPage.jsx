import React, { useState } from "react";
import { migrateAll } from "../../../../config/migrateProducts";

export default function MigrationPage() {
  const [status, setStatus] = useState("");
  const [running, setRunning] = useState(false);

  const handleMigrate = async () => {
    setRunning(true);
    setStatus("⏳ Running migration...");
    try {
      await migrateAll();
      setStatus("✅ Migration complete! Check Firebase Console.");
    } catch (err) {
      setStatus("❌ Failed: " + err.message);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>🔧 Admin — Firebase Migration</h2>
      <button onClick={handleMigrate} disabled={running}>
        {running ? "Migrating..." : "Run Migration"}
      </button>
      {status && <p>{status}</p>}
    </div>
  );
}
