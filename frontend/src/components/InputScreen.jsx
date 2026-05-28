export default function InputScreen({
  message,
  setMessage,
  location,
  setLocation,
  useLocation,
  setUseLocation,
  locationMode,
  setLocationMode,
  trustedContact,
  setTrustedContact,
  handleAssessmentSubmit,
}) {
  async function handleEnableLocation() {
    if (!navigator.geolocation) {
      setUseLocation(false);
      setLocationMode("manual");

      alert("Geolocation is not supported by this browser.");
      return;
    }

    setLocationMode("detecting");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );

          const data = await response.json();

          const city =
            data.address.city ||
            data.address.town ||
            data.address.village ||
            data.address.county ||
            "";

          const state = data.address.state || "";
          const country = data.address.country || "";

          const normalizedCountry =
            country === "United State" ? "United States" : country;

          const readableLocation = [city, state, normalizedCountry]
            .filter(Boolean)
            .join(", ");

          setLocation(readableLocation || `${latitude}, ${longitude}`);
        } catch (error) {
          setLocation(`${latitude}, ${longitude}`);
        }

        setUseLocation(true);
        setLocationMode("enabled");
      },
      () => {
        setUseLocation(false);
        setLocationMode("manual");

        alert("Unable to access location. Please enter your location manually.");
      }
    );
  }
 function handleVoiceInput() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser. Please type your message.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.start();

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setMessage(transcript);
    };

    recognition.onerror = () => {
      alert("Unable to capture voice input. Please try again or type your message.");
    };
  }
  return (
    <div className="app-container">
      <div className="card">
        <h1>SafePath AI</h1>

        <p className="subtitle">
          A safety decision-support agent that helps assess risk, find nearby
          resources, and prepare emergency action plans.
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
        <div className="button-row">
  <button
    type="button"
    onClick={handleVoiceInput}
  >
    Use Voice Input
  </button>
</div>

        <div className="section">
          <label htmlFor="trustedContact">Trusted Contact (optional)</label>

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
            <button type="button" onClick={handleEnableLocation}>
              Enable Location
            </button>

            <button
              type="button"
              onClick={() => {
                setUseLocation(false);
                setLocationMode("manual");
              }}
            >
              Enter Location Manually
            </button>

            <button
              type="button"
              onClick={() => {
                setUseLocation(false);
                setLocation("");
                setLocationMode("skip");
              }}
            >
              Skip for Now
            </button>
          </div>

          {locationMode === "detecting" && (
            <p style={{ marginTop: "16px" }}>Detecting your location...</p>
          )}

          {locationMode === "enabled" && (
            <p style={{ marginTop: "16px" }}>
              Location enabled: <strong>{location}</strong>
            </p>
          )}

          {locationMode === "manual" && (
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

          {locationMode === "skip" && (
            <p style={{ marginTop: "16px" }}>
              Location skipped. SafePath will provide general safety guidance.
            </p>
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