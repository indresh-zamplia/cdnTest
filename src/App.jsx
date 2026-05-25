import { useEffect, useState } from "react";

function App() {
  const [userId, setUserId] = useState("");
  const [sdkReady, setSdkReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);

  // Generate persistent user ID
  const generateUserId = () => {
    const existingId = localStorage.getItem("calibr8_user_id");

    if (existingId) {
      return existingId;
    }

    const newId = `user_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 10)}`;

    localStorage.setItem("calibr8_user_id", newId);
    return newId;
  };

  useEffect(() => {
    const generatedId = generateUserId();
    setUserId(generatedId);

    if (!window.calibr8yourdata) {
      console.error("❌ SDK not loaded");
      return;
    }

    try {
      const version = window.calibr8yourdata.getVersion();
      console.log("✅ SDK Loaded:", version);

      window.calibr8yourdata.init({
        projectKey: "e01c7f89-4ce8-4a71-9cc1-fe0dc9b1b3dc",
        userId: generatedId,
        autoStart: true,
      });

      setSdkReady(true);
    } catch (error) {
      console.error("SDK Init Error:", error);
    }
  }, []);

  const reInitializeSdk = () => {
    if (!window.calibr8yourdata) {
      console.error("❌ SDK not loaded");
      return;
    }

    try {
      window.calibr8yourdata.init({
        projectKey: "e01c7f89-4ce8-4a71-9cc1-fe0dc9b1b3dc",
        userId,
        autoStart: true,
      });

      console.log("✅ SDK Reinitialized with:", userId);
    } catch (error) {
      console.error("Re-init failed:", error);
    }
  };

  const handleSubmit = async () => {
    if (!window.calibr8yourdata) {
      console.error("❌ SDK not loaded");
      return;
    }

    setLoading(true);
    setResponse(null);

    try {
      await window.calibr8yourdata.collect();

      const res = await window.calibr8yourdata.submit();

      console.log("✅ CDN RESPONSE:", res);
      setResponse(res);
    } catch (err) {
      console.error("❌ CDN ERROR:", err);
      setResponse({ error: err.message || "Submission failed" });
    } finally {
      setLoading(false);
    }
  };

  const regenerateUserId = () => {
    const newId = `user_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 10)}`;

    localStorage.setItem("calibr8_user_id", newId);
    setUserId(newId);
  };

  return (
    <div
      style={{
        padding: "30px",
        maxWidth: "600px",
        margin: "0 auto",
        fontFamily: "Arial",
      }}
    >
      <h2>Calibr8 SDK Test</h2>

      <div style={{ marginBottom: "15px" }}>
        <label>User ID:</label>
        <input
          type="text"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            marginTop: "8px",
            marginBottom: "10px",
          }}
        />

        <button onClick={regenerateUserId}>
          Generate New User ID
        </button>

        <button
          onClick={reInitializeSdk}
          style={{ marginLeft: "10px" }}
        >
          Reinitialize SDK
        </button>
      </div>

      <div style={{ marginBottom: "20px" }}>
        SDK Status:{" "}
        <strong>{sdkReady ? "✅ Ready" : "❌ Not Loaded"}</strong>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!sdkReady || loading}
        style={{
          padding: "12px 20px",
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Submitting..." : "Collect & Submit"}
      </button>

      {response && (
        <pre
          style={{
            marginTop: "20px",
            background: "#d60000",
            padding: "15px",
            borderRadius: "8px",
            overflow: "auto",
          }}
        >
          {JSON.stringify(response, null, 2)}
        </pre>
      )}
    </div>
  );
}

export default App;