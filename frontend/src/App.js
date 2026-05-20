import React, { useState } from "react";

import InputScreen from "./components/InputScreen";
import LoadingScreen from "./components/LoadingScreen";
import ResultsScreen from "./components/ResultsScreen";
import ConfirmationScreen from "./components/ConfirmationScreen";
import FinalScreen from "./components/FinalScreen";
import ErrorScreen from "./components/ErrorScreen";

export default function SafePathApp() {
  const [screen, setScreen] = useState("input");

  const [message, setMessage] = useState("");
  const [location, setLocation] = useState("");
  const [useLocation, setUseLocation] = useState(false);

  const [assessment, setAssessment] = useState(null);

  const [sendAlert, setSendAlert] = useState(false);
  const [saveIncident, setSaveIncident] = useState(false);

  const [error, setError] = useState("");
  const [trustedContact, setTrustedContact] = useState("");
  async function handleAssessmentSubmit() {
    try {
      setError("");
      setScreen("loading");

      const response = await fetch("http://127.0.0.1:8000/assess", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          location,
        }),
      });

      if (!response.ok) {
        throw new Error("Backend request failed");
      }

      const data = await response.json();

      setAssessment(data);
      setScreen("results");
    } catch (err) {
      setError("Failed to assess the situation.");
      setScreen("error");
    }
  }

  if (screen === "input") {
    return (
      <InputScreen
  message={message}
  setMessage={setMessage}
  location={location}
  setLocation={setLocation}
  useLocation={useLocation}
  setUseLocation={setUseLocation}
  trustedContact={trustedContact}
  setTrustedContact={setTrustedContact}
  handleAssessmentSubmit={handleAssessmentSubmit}
/>
    );
  }

  if (screen === "loading") {
    return <LoadingScreen />;
  }

  if (screen === "results") {
    return (
      <ResultsScreen
        assessment={assessment}
        setScreen={setScreen}
      />
    );
  }

  if (screen === "confirmation") {
    return (
      <ConfirmationScreen
        assessment={assessment}
        sendAlert={sendAlert}
        setSendAlert={setSendAlert}
        saveIncident={saveIncident}
        setSaveIncident={setSaveIncident}
        setScreen={setScreen}
      />
    );
  }

  if (screen === "final") {
    return (
      <FinalScreen
  assessment={assessment}
  trustedContact={trustedContact}
  sendAlert={sendAlert}
  saveIncident={saveIncident}
  setScreen={setScreen}
/>
    );
  }

  if (screen === "error") {
    return (
      <ErrorScreen
        error={error}
        setScreen={setScreen}
      />
    );
  }

  return null;
}