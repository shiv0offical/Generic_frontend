import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet-routing-machine';
import { useMap } from 'react-leaflet';
import car from '../../assets/logo.png';

const RoutingMatching = ({ coordinates, speed, isPlaying }) => {
  const map = useMap();

  const movingMarkerRef = useRef(null);
  const intervalRef = useRef(null);
  const routeCoordsRef = useRef([]);
  const currentPositionRef = useRef(0);

  const [routeReady, setRouteReady] = useState(false);

  useEffect(() => {
    if (!coordinates || coordinates.length < 2 || !map) return;

    if (routeReady) return;

    const routingControl = L.Routing.control({
      waypoints: coordinates.map((c) => L.latLng(c[0], c[1])),
      routeWhileDragging: false,
      addWaypoints: false,
      createMarker: () => null,
    }).addTo(map);

    const handleRoutesFound = (e) => {
      const route = e.routes[0];
      routeCoordsRef.current = route.coordinates;
      setRouteReady(true);
    };

    routingControl.on('routesfound', handleRoutesFound);

    // Hide routing panel
    const controlContainer = document.querySelector('.leaflet-top.leaflet-right');
    if (controlContainer) controlContainer.style.display = 'none';

    return () => {
      routingControl.off('routesfound', handleRoutesFound);

      if (movingMarkerRef.current) {
        map.removeLayer(movingMarkerRef.current);
        movingMarkerRef.current = null;
      }
      clearInterval(intervalRef.current);
    };
  }, [coordinates, map]);

  useEffect(() => {
    if (!routeReady || routeCoordsRef.current.length === 0) return;

    const customIcon = L.icon({
      iconUrl: car,
      iconSize: [25, 30],
    });

    if (movingMarkerRef.current === null) {
      const marker = L.marker(routeCoordsRef.current[currentPositionRef.current], { icon: customIcon })
        .addTo(map)
        .bindPopup('', { closeButton: false, autoClose: false })
        .openPopup();
      movingMarkerRef.current = marker;
    }

    if (intervalRef.current) clearInterval(intervalRef.current);

    if (isPlaying) {
      // If the marker reached the end, reset it
      if (currentPositionRef.current >= routeCoordsRef.current.length) {
        currentPositionRef.current = 0;
        movingMarkerRef.current.setLatLng(routeCoordsRef.current[0]);
      }

      const delay = Math.max(10, 1000 / speed);
      intervalRef.current = setInterval(() => {
        const coords = routeCoordsRef.current;
        if (currentPositionRef.current >= coords.length) {
          clearInterval(intervalRef.current);
          return;
        }
        const currentLatLng = coords[currentPositionRef.current];
        movingMarkerRef.current.setLatLng(coords[currentPositionRef.current]);

        // Update tooltip with current lat/lng
        movingMarkerRef.current.setPopupContent(`
          <div>
            <strong>Lat:</strong> ${currentLatLng.lat.toFixed(5)}<br/>
            <strong>Lng:</strong> ${currentLatLng.lng.toFixed(5)}
          </div>
        `);

        currentPositionRef.current++;
      }, delay);
    }

    return () => clearInterval(intervalRef.current);
  }, [isPlaying, speed, routeReady]);

  return null;
};

export default RoutingMatching;
