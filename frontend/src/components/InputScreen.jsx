export default function InputScreen({
  message,
  setMessage,
  location,
  setLocation,
  useLocation,
  setUseLocation,
  trustedContact,
  setTrustedContact,
  handleAssessmentSubmit,
}) {
  return (
    <div className="app-container">
      <div className="card">
        <h1>SafePath AI</h1>

        <p className="subtitle">
          A safety decision-support agent that helps assess risk,
          find nearby resources, and prepare emergency action plans.
        </p>

        <div className="section">
          <label htmlFor="message">What’s happening?</label>

          <textarea
            id="message"
            placeholder="Describe your situation..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={6}
          />
        </div>

        <div className="section">
          <label htmlFor="trustedContact">
            Trusted Contact (optional)
          </label>

          <input
            id="trustedContact"
            type="text"
            placeholder="Name, phone, or email"
            value={trustedContact}
            onChange={(e) => setTrustedContact(e.target.value)}
          />
        </div>

        <div className="section">
          <p>
            Location access helps SafePath find nearby verified safety
            resources.
          </p>

          <div className="button-row">
            <button type="button" onClick={() => setUseLocation(true)}>
              Enable Location
            </button>

            <button type="button" onClick={() => setUseLocation(false)}>
              Enter Location Manually
            </button>

            <button
              type="button"
              onClick={() => {
                setUseLocation(false);
                setLocation("");
              }}
            >
              Skip for Now
            </button>
          </div>

          {!useLocation && (
            <div style={{ marginTop: "18px" }}>
              <label htmlFor="location">Manual Location</label>

              <input
                id="location"
                type="text"
                placeholder="Enter city or country"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          )}
        </div>

        <div className="warning">
          SafePath AI does not replace emergency services. If you are in
          immediate danger, contact local emergency responders.
        </div>

        <button
          className="primary-btn"
          onClick={handleAssessmentSubmit}
          disabled={!message.trim()}
        >
          Assess My Situation
        </button>
      </div>
    </div>
  );
}