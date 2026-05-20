export default function ErrorScreen({
  error,
  setScreen,
}) {
  return (
    <div className="app-container">
      <div className="card">
        <h1>Something Went Wrong</h1>

        <p className="subtitle">
          SafePath AI was unable to process your request.
        </p>

        <div className="section">
          <p className="error">
            {error}
          </p>

          <p>
            Please check your connection and try again.
          </p>
        </div>

        <div className="warning">
          If you are in immediate danger,
          contact local emergency services immediately.
        </div>

        <button
          className="primary-btn"
          onClick={() => setScreen("input")}
        >
          Try Again
        </button>
      </div>
    </div>
  );
}