import { useEffect } from "react";

export default function VoiceAgent() {
  useEffect(() => {
    const existing = document.getElementById("elevenlabs-widget");

    if (!existing) {
      const script = document.createElement("script");

      script.id = "elevenlabs-widget";
      script.src =
        "https://unpkg.com/@elevenlabs/convai-widget-embed";

      script.async = true;

      document.body.appendChild(script);
    }
  }, []);

  return (
    <elevenlabs-convai
      agent-id="agent_7901ksvwgy3ceg4tn11gxwhgd777"
    />
  );
}
