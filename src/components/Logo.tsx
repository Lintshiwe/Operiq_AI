import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";

const GREEN = "#39FF14";

interface LogoProps {
  variant?: "full" | "badge" | "ai-avatar";
  loading?: boolean;
  className?: string;
}

/* ────────────────────────────────────────────── */
/*  Full "Operiq AI" logo with animated dot       */
/* ────────────────────────────────────────────── */
export function Logo({ variant = "full", loading = false, className }: LogoProps) {
  /* -- badge: green rounded "O" (compact) -- */
  if (variant === "badge") {
    return (
      <span
        className={cn(
          "relative inline-flex size-7 items-center justify-center rounded-lg bg-[#10a37f] text-white",
          className,
        )}
      >
        <svg viewBox="0 0 32 32" className="size-[18px]" fill="none">
          <text x="16" y="23" textAnchor="middle" fontFamily="Inter,sans-serif" fontWeight="700" fontSize="22" fill="white">O</text>
        </svg>
      </span>
    );
  }

  /* -- ai-avatar: green "AI" paths (for assistant messages) -- */
  if (variant === "ai-avatar") {
    return (
      <svg
        className={cn("shrink-0", className)}
        viewBox="580 190 220 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* so the path coords match the viewBox */}
        </defs>
        {/* The A */}
        <path
          d="M 0,-100 C 15,-100 25,-90 30,-75 L 65,10 C 70,25 60,35 45,35 C 35,35 25,25 20,10 L 15,-5 L -15,-5 L -20,10 C -25,25 -35,35 -45,35 C -60,35 -70,25 -65,10 L -30,-75 C -25,-90 -15,-100 0,-100 Z M 0,-45 L -10,-15 L 10,-15 Z"
          fill={GREEN}
          fillRule="evenodd"
        />
        {/* The I */}
        <path
          d="M 90,-100 L 90,35 A 15,15 0 0,0 120,35 L 120,-100 A 15,15 0 0,0 90,-100 Z"
          fill={GREEN}
        />
        {/* Loading pulse */}
        {loading && (
          <circle cx="-20" cy="-30" r="4" fill={GREEN} className="animate-pulse" />
        )}
      </svg>
    );
  }

  /* -- full: "Operiq AI" with orbiting/bouncing dot -- */
  // O center in viewBox coords
  const OCX = 210;
  const OCY = 190;
  // Orbit position (50px right of O center)
  const ORB_X = 260;
  const ORB_Y = 190;
  // Final dot position (on the 'i')
  const FINAL_X = 595;
  const FINAL_Y = 165;
  // Dot radius in viewBox space
  const R = 7;

  const dotRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    const el = dotRef.current;
    if (!el) return;
    if (loading) {
      // When loading starts: snap to orbit position with no transition
      el.setAttribute("cx", String(ORB_X));
      el.setAttribute("cy", String(ORB_Y));
    } else {
      // When loading ends: animate to final position with bounce
      el.style.transition =
        "cx 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), cy 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)";
      el.setAttribute("cx", String(FINAL_X));
      el.setAttribute("cy", String(FINAL_Y));
    }
    // Cleanup: remove transition after settling
    const t = setTimeout(() => {
      if (el) el.style.transition = "";
    }, 900);
    return () => clearTimeout(t);
  }, [loading]);

  return (
    <svg
      className={cn("shrink-0", className)}
      viewBox="60 60 750 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: "visible" }}
    >
      <defs>
        <style>{`
          @keyframes logoOrbit {
            from { transform: rotate(0deg); }
            to   { transform: rotate(360deg); }
          }
        `}</style>
      </defs>

      {/* Main text group inside the viewBox */}
      <g transform="translate(100, 300)">
        {/* "O" */}
        <text
          x="0" y="0"
          fontFamily="'Inter','Segoe UI',sans-serif"
          fontWeight="700" fontSize="220"
          fill="currentColor"
          letterSpacing="-1"
        >
          O
        </text>

        {/* "periq" — fades in after load */}
        <text
          x="145" y="0"
          fontFamily="'Inter','Segoe UI',sans-serif"
          fontWeight="700" fontSize="160"
          fill="currentColor"
          letterSpacing="-1"
          className={loading ? "opacity-0" : "opacity-100"}
          style={{ transition: "opacity 0.6s ease 0.3s" }}
        >
          periq
        </text>

        {/* Green "AI" suffix — fades in after load */}
        <g
          transform="translate(560, 0)"
          className={loading ? "opacity-0" : "opacity-100"}
          style={{ transition: "opacity 0.6s ease 0.5s" }}
        >
          <path
            d="M 0,-100 C 15,-100 25,-90 30,-75 L 65,10 C 70,25 60,35 45,35 C 35,35 25,25 20,10 L 15,-5 L -15,-5 L -20,10 C -25,25 -35,35 -45,35 C -60,35 -70,25 -65,10 L -30,-75 C -25,-90 -15,-100 0,-100 Z M 0,-45 L -10,-15 L 10,-15 Z"
            fill={GREEN}
            fillRule="evenodd"
          />
          <path
            d="M 90,-100 L 90,35 A 15,15 0 0,0 120,35 L 120,-100 A 15,15 0 0,0 90,-100 Z"
            fill={GREEN}
          />
        </g>
      </g>

      {/* Animated green dot */}
      <circle
        ref={dotRef}
        cx={loading ? ORB_X : FINAL_X}
        cy={loading ? ORB_Y : FINAL_Y}
        r={R}
        fill={GREEN}
        style={{
          transition: loading
            ? "none"
            : "cx 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), cy 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        {loading && (
          <animateTransform
            attributeName="transform"
            type="rotate"
            from={`0 ${ORB_X} ${ORB_Y}`}
            to={`360 ${ORB_X} ${ORB_Y}`}
            dur="1500ms"
            repeatCount="indefinite"
          />
        )}
      </circle>
    </svg>
  );
}
