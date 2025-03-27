import { useMap } from 'react-leaflet';
import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet-routing-machine';

// Thêm props: onRouteReady
const Routing = ({ from, to, onRouteReady }) => {
  const map = useMap();
  const routingRef = useRef(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (map && map._container) {
      setIsReady(true);
    }
  }, [map]);

  useEffect(() => {
    if (!isReady || !from || !to) return;

    const formatter = new L.Routing.Formatter();

    formatter.formatInstruction = function (instruction) {
      let text = instruction.text;
      text = text
        .replace(/^Head east/, 'Đi về phía đông')
        .replace(/^Head west/, 'Đi về phía tây')
        .replace(/^Head north/, 'Đi về phía bắc')
        .replace(/^Head south/, 'Đi về phía nam')
        .replace(/^Turn right onto/, 'Rẽ phải đến')
        .replace(/^Turn left onto/, 'Rẽ trái đến')
        .replace(/^Turn right/, 'Rẽ phải')
        .replace(/^Turn left/, 'Rẽ trái')
        .replace(/^Continue/, 'Tiếp tục')
        .replace(/^Make a U-turn/, 'Quay đầu')
        .replace(/You have arrived at your destination/, 'Bạn đã đến nơi')
        .replace(/Take the exit/, 'Rẽ ra')
        .replace(/Take the/, 'Đi vào')
        .replace(/At the roundabout/, 'Tại vòng xuyến')
        .replace(/Exit the roundabout/, 'Rời khỏi vòng xuyến')
        .replace(/At the end of the road/, 'Ở cuối đường')
        .replace(/towards/, 'hướng về')
        .replace(/and continue on/, 'và đi tiếp')
        .replace(/onto/, 'đến')
        .replace(/on the right/, 'bên phải')
        .replace(/on the left/, 'bên trái');
      text = text.replace(/ on /g, ' ');
      return text + ' : ';
    };

    const control = L.Routing.control({
      waypoints: [L.latLng(from.lat, from.lng), L.latLng(to.lat, to.lng)],
      lineOptions: {
        styles: [{ color: 'blue', weight: 5 }],
      },
      addWaypoints: false,
      draggableWaypoints: false,
      routeWhileDragging: false,
      formatter: formatter,
      createMarker: function (i, wp) {
        return L.marker(wp.latLng, {
          icon: L.icon({
            iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
          }),
        });
      },
    });

    control.on('routesfound', function () {
      if (onRouteReady) onRouteReady(); // ✅ báo đã xong route
    });

    control.addTo(map);
    routingRef.current = control;

    return () => {
      if (routingRef.current) {
        try {
          routingRef.current.remove();
          routingRef.current = null;
        } catch (err) {
          console.warn('Safe cleanup error:', err);
        }
      }
    };
  }, [isReady, from, to]);

  return null;
};

export default Routing;
