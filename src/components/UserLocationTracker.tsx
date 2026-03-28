"use client";

import { useEffect, useRef } from "react";
import { useMap } from "react-map-gl/maplibre";

const CYAN = "#06b6d4";
const CONE_LENGTH = 90;
const CONE_ANGLE = 50;

function buildConeSVG(heading: number): string {
  const cx = CONE_LENGTH;
  const cy = CONE_LENGTH;
  const r = CONE_LENGTH;
  const startAngle = ((heading - CONE_ANGLE / 2 - 90) * Math.PI) / 180;
  const endAngle = ((heading + CONE_ANGLE / 2 - 90) * Math.PI) / 180;

  const x1 = cx + r * Math.cos(startAngle);
  const y1 = cy + r * Math.sin(startAngle);
  const x2 = cx + r * Math.cos(endAngle);
  const y2 = cy + r * Math.sin(endAngle);

  return `
    <svg width="${CONE_LENGTH * 2}" height="${CONE_LENGTH * 2}"
         viewBox="0 0 ${CONE_LENGTH * 2} ${CONE_LENGTH * 2}"
         style="position:absolute;left:-${CONE_LENGTH}px;top:-${CONE_LENGTH}px;pointer-events:none;">
      <defs>
        <radialGradient id="cg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="${CYAN}" stop-opacity="0.3"/>
          <stop offset="70%" stop-color="${CYAN}" stop-opacity="0.06"/>
          <stop offset="100%" stop-color="${CYAN}" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <path d="M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z"
            fill="url(#cg)" />
    </svg>
  `;
}

export default function UserLocationTracker() {
  const { current: mapInstance } = useMap();
  const markerElRef = useRef<HTMLDivElement | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const headingRef = useRef<number>(0);
  const posRef = useRef<{ lat: number; lng: number } | null>(null);
  const firstFixRef = useRef(true);

  useEffect(() => {
    if (!mapInstance || !navigator.geolocation) return;

    const map = mapInstance.getMap();

    const el = document.createElement("div");
    el.className = "user-location-icon";
    markerElRef.current = el;

    let marker: maplibregl.Marker | null = null;

    import("maplibre-gl").then((mgl) => {
      marker = new mgl.Marker({ element: el }).setLngLat([0, 0]).addTo(map);
      markerRef.current = marker;
      // Render initial state if position already arrived
      if (posRef.current) update();
    });

    function update() {
      if (!posRef.current || !markerElRef.current) return;
      markerElRef.current.innerHTML = `
        ${buildConeSVG(headingRef.current)}
        <div class="gps-dot-container">
          <div class="gps-pulse-ring"></div>
          <div class="gps-dot"></div>
        </div>
      `;
      markerRef.current?.setLngLat([posRef.current.lng, posRef.current.lat]);
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        posRef.current = { lat: pos.coords.latitude, lng: pos.coords.longitude };

        if (pos.coords.heading != null && !isNaN(pos.coords.heading)) {
          headingRef.current = pos.coords.heading;
        }

        if (firstFixRef.current) {
          firstFixRef.current = false;
          map.flyTo({ center: [pos.coords.longitude, pos.coords.latitude], zoom: 15 });
        }

        update();
      },
      (err) => console.warn("Geolocation error:", err.message),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );

    function handleOrientation(e: DeviceOrientationEvent) {
      let heading: number | null = null;
      if ("webkitCompassHeading" in e) {
        heading = (e as DeviceOrientationEvent & { webkitCompassHeading: number })
          .webkitCompassHeading;
      } else if (e.alpha != null) {
        heading = (360 - e.alpha) % 360;
      }
      if (heading != null) {
        headingRef.current = heading;
        update();
      }
    }

    window.addEventListener("deviceorientationabsolute", handleOrientation as EventListener);
    window.addEventListener("deviceorientation", handleOrientation as EventListener);

    return () => {
      navigator.geolocation.clearWatch(watchId);
      window.removeEventListener("deviceorientationabsolute", handleOrientation as EventListener);
      window.removeEventListener("deviceorientation", handleOrientation as EventListener);
      marker?.remove();
      markerRef.current = null;
    };
  }, [mapInstance]);

  return null;
}
