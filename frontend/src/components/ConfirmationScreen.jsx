export default function ConfirmationScreen({
  sendAlert,
  setSendAlert,
  saveIncident,
  setSaveIncident,
  setScreen,
}) {
  return (
    <div className="app-container">
      <div className="card">
        <h1>Review Actions</h1>

        <p className="subtitle">
          SafePath prepared optional next actions.
          Please review and confirm before continuing.
        </p>

        <div className="confirm-box">
          <h3>Trusted Contact Alert</h3>

          <p>
            SafePath can prepare a temporary message for a trusted
            contact with your general situation and location.
          </p>

          <div className="section">
            <strong>Prepared Alert Preview</strong>

            <p style={{ marginTop: "12px" }}>
              “I may be in an unsafe situation near my current area.
              Please stay available while I move toward a safer location.”
            </p>
          </div>

          <div className="checkbox-row">
            <input
              type="checkbox"
              id="sendAlert"
              checked={sendAlert}
              onChange={(e) => setSendAlert(e.target.checked)}
            />

            <label htmlFor="sendAlert">
              Prepare trusted-contact alert
            </label>
          </div>
        </div>

        <div className="confirm-box">
          <h3>Generate Safety Summary</h3>

          <p>
            SafePath can generate a temporary summary of this
            assessment for your personal records.
          </p>

          <div className="section">
            <strong>Summary Includes</strong>

            <ul>
              <li>Risk level assessment</li>
              <li>Safety recommendations</li>
              <li>Emergency resources shown</li>
              <li>Assessment timestamp</li>
            </ul>
          </div>

          <div className="checkbox-row">
            <input
              type="checkbox"
              id="saveIncident"
              checked={saveIncident}
              onChange={(e) => setSaveIncident(e.target.checked)}
            />

            <label htmlFor="saveIncident">
              Generate temporary safety summary
            </label>
          </div>
        </div>

        <div className="warning">
          SafePath AI does not permanently store personal
          information or exact locations during MVP operation.
        </div>

        <button
          className="primary-btn"
          onClick={() => setScreen("final")}
        >
          Confirm Actions
        </button>
      </div>
    </div>
  );
}