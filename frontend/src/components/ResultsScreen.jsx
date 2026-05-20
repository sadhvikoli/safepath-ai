export default function ResultsScreen({ assessment, setScreen }) {
  return (
    <div className="app-container">
      <div className="card">
        <h1>Assessment Results</h1>

        <div className="risk-badge">
          Risk Level: {assessment.risk_level}
        </div>

        <div className="section">
          <p>
            <strong>Confidence:</strong>{" "}
            {Math.round(assessment.confidence * 100)}%
          </p>

          <p>
            <strong>Reason:</strong> {assessment.reason}
          </p>
        </div>

        <div className="section">
          <h3>Safety Plan</h3>

          <ol>
            {assessment.safety_plan.plan.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
        </div>

        <div className="section">
          <h3>Emergency Contacts</h3>

          {assessment.emergency_contacts.map((contact, index) => (
            <div className="contact-card" key={index}>
              <strong>{contact.title}</strong>
              <p>{contact.phone_no}</p>
              <small>Priority: {contact.importance}</small>
            </div>
          ))}
        </div>

        <p className="warning">{assessment.disclaimer}</p>

        <button
          className="primary-btn"
          onClick={() => setScreen("confirmation")}
        >
          Continue
        </button>
      </div>
    </div>
  );
}