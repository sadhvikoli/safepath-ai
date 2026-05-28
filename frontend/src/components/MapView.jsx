import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

export default function MapView({ resources }) {
  const defaultCenter = [43.1566, -77.6088]; // Rochester, NY

  const resourcesWithCoords = resources.filter(
    (resource) => resource.latitude && resource.longitude
  );

  if (resourcesWithCoords.length === 0) {
    return (
      <div className="section">
        <h3>Resource Map</h3>
        <p>
          Map view will appear when verified resources include coordinates.
        </p>
      </div>
    );
  }

  const center = [
    resourcesWithCoords[0].latitude,
    resourcesWithCoords[0].longitude,
  ];

  return (
    <div className="section">
      <h3>Resource Map</h3>

      <MapContainer
        center={center || defaultCenter}
        zoom={13}
        style={{
          height: "320px",
          width: "100%",
          borderRadius: "16px",
          overflow: "hidden",
          marginTop: "16px",
        }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {resourcesWithCoords.map((resource, index) => (
          <Marker
            key={index}
            position={[resource.latitude, resource.longitude]}
          >
            <Popup>
              <strong>{resource.name}</strong>
              <br />
              {resource.type}
              <br />
              {resource.phone}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}