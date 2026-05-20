export default function FinalScreen({
  assessment,
  trustedContact,
  sendAlert,
  saveIncident,
  setScreen,
}) {
  const alertMessage = `
I may be in an unsafe situation.

SafePath AI assessed my situation as:
${assessment.risk_level}

Reason:
${assessment.reason}

Please stay available and check in with me.

Generated at:
${new Date().toLocaleString()}
`;

  function copyAlertMessage() {
    navigator.clipboard.writeText(alertMessage);
    alert("Trusted contact alert copied.");
  }

  function downloadSummary() {
    const content = `
SafePath AI Safety Summary

Risk Level: ${assessment.risk_level}
Confidence: ${Math.round(assessment.confidence * 100)}%
Reason: ${assessment.reason}

Safety Plan:
${assessment.safety_plan.plan
  .map((step, i) => `${i + 1}. ${step}`)
  .join("\n")}

Emergency Contacts:
${assessment.emergency_contacts
  .map((contact) => `${contact.title}: ${contact.phone_no}`)
  .join("\n")}

Generated At:
${new Date().toLocaleString()}

Disclaimer:
${assessment.disclaimer}
`;

    const blob = new Blob([content], {
      type: "text/plain",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "safepath-safety-summary.txt";
    link.click();

    URL.revokeObjectURL(url);
  }

  return (
    <div className="app-container">
      <div className="card">
        <h1>Safety Actions Confirmed</h1>

        <p className="subtitle">
          Your selected actions have been reviewed.
        </p>

        <div className="section">
          <h3>Trusted Contact Alert</h3>

          <p>
            {sendAlert
              ? "A trusted-contact alert has been prepared."
              : "No trusted-contact alert was prepared."}
          </p>

          {sendAlert && (
            <>
              <div className="confirm-box">
                <strong>Prepared Alert Message</strong>

                <p style={{ marginTop: "12px", whiteSpace: "pre-line" }}>
                  {alertMessage}
                </p>

                {trustedContact && (
                  <p>
                    <strong>Trusted Contact:</strong>{" "}
                    {trustedContact}
                  </p>
                )}
              </div>

              <button onClick={copyAlertMessage}>
                Copy Alert Message
              </button>
            </>
          )}
        </div>

        <div className="section">
          <h3>Safety Summary</h3>

          <p>
            {saveIncident
              ? "A temporary safety summary is ready to download."
              : "No safety summary was generated."}
          </p>

          {saveIncident && (
            <button onClick={downloadSummary}>
              Download Safety Summary
            </button>
          )}
        </div>

        <div className="warning">
          SafePath does not permanently store personal
          information or exact locations during MVP operation.
        </div>

        <button
          className="primary-btn"
          onClick={() => setScreen("input")}
        >
          Start New Assessment
        </button>
      </div>
    </div>
  );
}