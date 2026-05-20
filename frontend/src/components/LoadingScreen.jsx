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

          <div
            style={{
              width: "100%",
              height: "12px",
              background: "#e5e7eb",
              borderRadius: "999px",
              overflow: "hidden",
              marginTop: "20px",
            }}
          >
            <div
              style={{
                width: "70%",
                height: "100%",
                background: "#4f46e5",
                borderRadius: "999px",
                animation: "pulse 1.5s infinite",
              }}
            />
          </div>

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