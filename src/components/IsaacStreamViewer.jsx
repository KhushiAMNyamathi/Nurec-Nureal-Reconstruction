import { useEffect, useRef, useState } from "react";
import {
  AppStreamer,
  StreamType,
} from "@nvidia/omniverse-webrtc-streaming-library";

const ISAAC_HOST = "10.20.2.145";
const SIGNALING_PORT = 49100;
const MEDIA_PORT = 47998;

export default function IsaacStreamViewer() {
  const requestedRef = useRef(false);
  const [status, setStatus] = useState("Connecting...");

  useEffect(() => {
    if (requestedRef.current) {
      return;
    }

    requestedRef.current = true;

    const streamConfig = {
      videoElementId: "isaac-remote-video",
      audioElementId: "isaac-remote-audio",

      authenticate: true,
      maxReconnects: 20,

      signalingServer: ISAAC_HOST,
      signalingPort: SIGNALING_PORT,

      mediaServer: ISAAC_HOST,
      mediaPort: MEDIA_PORT,

      nativeTouchEvents: true,

      width: 1920,
      height: 1080,
      fps: 60,

      onUpdate: (message) => {
        console.log("Isaac UPDATE:", message);
      },

      onStart: (message) => {
        console.log("Isaac START:", message);

        if (
          message.action === "start" &&
          message.status === "success"
        ) {
          setStatus("Connected");
        }

        if (message.status === "error") {
          console.error("Isaac START ERROR:", message);
          setStatus("Stream Error");
        }
      },

      onCustomEvent: (message) => {
        console.log("Isaac CUSTOM EVENT:", message);
      },

      onStop: (message) => {
        console.log("Isaac STOP:", message);
        setStatus("Stopped");
      },

      onTerminate: (message) => {
        console.log("Isaac TERMINATE:", message);
        setStatus("Terminated");
      },
    };

    console.log("Connecting to Isaac:", {
      host: ISAAC_HOST,
      signalingPort: SIGNALING_PORT,
      mediaPort: MEDIA_PORT,
    });

    AppStreamer.connect({
      streamConfig,
      streamSource: StreamType.DIRECT,
    })
      .then((result) => {
        console.log("Isaac connection result:", result);
      })
      .catch((error) => {
        console.error("Isaac connection failed:", error);
        setStatus("Connection Failed");
      });

    return () => {
      // Do not terminate the global AppStreamer here.
      // React StrictMode can mount/unmount this component during development.
    };
  }, []);

  return (
    <div
      tabIndex={0}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        background: "#000",
        overflow: "hidden",
        outline: "none",
      }}
    >
      <video
        id="isaac-remote-video"
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          objectFit: "contain",
          background: "#000",
        }}
        tabIndex={-1}
        playsInline
        muted
        autoPlay
      />

      <audio
        id="isaac-remote-audio"
        muted
      />

      {status !== "Connected" && (
        <div
          style={{
            position: "absolute",
            left: 8,
            bottom: 8,
            padding: "5px 8px",
            background: "rgba(0,0,0,0.75)",
            color: "#fff",
            fontSize: 10,
            pointerEvents: "none",
          }}
        >
          {status}
        </div>
      )}
    </div>
  );
}