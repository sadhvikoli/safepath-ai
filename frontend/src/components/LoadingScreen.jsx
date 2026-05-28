export default function LoadingScreen() {
  return (
    <div className="app-container">
      <div className="card">
        <h1>SafePath AI</h1>

        <div className="section">
          <h2>Assessing Situation...</h2>

          <p className="subtitle">
            SafePath AI is analyzing your situation,
            evaluating risk levels, and preparing
            immediate safety recommendations.
          </p>

          <div className="spinner"></div>

          <p
            style={{
              marginTop: "18px",
              color: "#6b7280",
            }}
          >
            Please stay calm while we prepare your safety plan.
          </p>
        </div>
      </div>
    </div>
  );
}