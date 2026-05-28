import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

export default function MapView({ resources }) {
  const resourcesWithCoords = resources.filter(
    (resource) => resource.latitude && resource.longitude
  );

  if (resourcesWithCoords.length === 0) {
    return (
      <div className="section">
        <h3>Resource Map</h3>
        <p>
          No map is shown because no location was provided or nearby resources
          do not include coordinates.
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
      <div className="map-header">
        <div>
          <h3>Nearby Safety Map</h3>
          <p>
            Verified safety resources near your provided location.
          </p>
        </div>
      </div>

      <div className="map-wrapper">
        <MapContainer
          center={center}
          zoom={13}
          className="leaflet-map"
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
                {resource.city}, {resource.state}
                <br />
                {resource.phone}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}