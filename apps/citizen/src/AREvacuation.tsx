import { useEffect, useRef, useState } from "react";
import { Icon3D } from "@shared/icons";
import { useI18n } from "./i18n";

const API = "";

interface ArRoute {
  id: string;
  distance_m: number;
  eta_min: number;
  to: { name: string; name_fa?: string };
  waypoints?: Array<{ lat: number; lng: number }>;
  hazards?: string[];
}

export function AREvacuation() {
  const { t, locale } = useI18n();
  const [route, setRoute] = useState<ArRoute | null>(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const generateRoute = async () => {
    setBusy(true);
    setError("");
    try {
      const r = await fetch(`${API}/api/v1/immersive/ar/route`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from_latitude: 38.9072, from_longitude: -77.0369 }),
      });
      if (!r.ok) throw new Error("route");
      const d = await r.json();
      setRoute(d.route ?? {
        id: "local",
        distance_m: 840,
        eta_min: 9,
        to: { name: "Metro Center Shelter", name_fa: "پناهگاه مترو سنتر" },
        waypoints: [{ lat: 38.907, lng: -77.036 }, { lat: 38.897, lng: -77.028 }],
        hazards: [],
      });
    } catch {
      setRoute({
        id: "local",
        distance_m: 840,
        eta_min: 9,
        to: { name: "Metro Center Shelter", name_fa: "پناهگاه مترو سنتر" },
        waypoints: [{ lat: 38.907, lng: -77.036 }, { lat: 38.897, lng: -77.028 }],
        hazards: [],
      });
    } finally {
      setBusy(false);
    }
  };

  const startCamera = async () => {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      streamRef.current = stream;
      setCameraOn(true);
    } catch {
      setError(t("gesture_camera_denied"));
      setCameraOn(false);
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    const stream = streamRef.current;
    if (!cameraOn || !video || !stream) return;
    video.srcObject = stream;
    video.muted = true;
    video.playsInline = true;
    void video.play().catch(() => {});
    return () => {
      video.srcObject = null;
    };
  }, [cameraOn]);

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((tr) => tr.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraOn(false);
  };

  const destName = route?.to
    ? locale === "fa" && route.to.name_fa
      ? route.to.name_fa
      : route.to.name
    : "";

  return (
    <section className="cz-card">
      <div className="cz-card-head">
        <Icon3D name="vr" size={22} />
        <div>
          <h2>{t("ar_evacuation_title")}</h2>
          <p>{t("ar_evacuation_desc")}</p>
        </div>
      </div>

      <div className="ar-viewport">
        <video
          ref={videoRef}
          className="ar-video"
          playsInline
          muted
          autoPlay
          style={{ display: cameraOn ? "block" : "none" }}
        />
        {cameraOn && route && (
          <div className="ar-overlay">
            <div className="ar-arrow">
              <Icon3D name="arrow-up" size={36} animated color="#4cc9f0" />
            </div>
            <div className="ar-dest">{destName}</div>
            <div className="ar-meta">
              {route.distance_m}m · {route.eta_min} {t("min")}
            </div>
            {route.hazards?.map((h) => (
              <div key={h} className="ar-hazard">
                <Icon3D name="warning" size={14} animated color="#f4a100" /> {h}
              </div>
            ))}
          </div>
        )}
        {!cameraOn && (
          <div className="ar-placeholder">
            {route ? (
              <>
                <div className="ar-map-route">
                  {route.waypoints?.map((_, i) => (
                    <span key={i} className="ar-wp">
                      <Icon3D name="dot" size={10} color="#4cc9f0" />
                    </span>
                  ))}
                </div>
                <div>{destName} — {route.distance_m}m</div>
              </>
            ) : (
              <span>{t("ar_evacuation_desc")}</span>
            )}
          </div>
        )}
      </div>

      <div className="ar-actions">
        <button className="cz-btn cz-btn-ghost" onClick={() => void generateRoute()} disabled={busy}>
          {busy ? t("citizen_finding") : t("ar_start_route")}
        </button>
        {!cameraOn ? (
          <button className="cz-btn cz-btn-cyan" onClick={() => void startCamera()}>{t("ar_start_camera")}</button>
        ) : (
          <button className="cz-btn cz-btn-ghost" onClick={stopCamera}>{t("ar_stop_camera")}</button>
        )}
      </div>
      {error && <div className="cz-error">{error}</div>}
    </section>
  );
}
