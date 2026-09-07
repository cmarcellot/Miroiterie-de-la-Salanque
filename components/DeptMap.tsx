import type { SVGProps } from "react";

/**
 * Contour du département des Pyrénées-Orientales (66).
 * Source : @svg-maps/france.departments (MIT), recadré sur le département.
 * `showMarker` place un point sur Canet-en-Roussillon (siège de l'entreprise).
 */
export default function DeptMap({
  showMarker = false,
  ...props
}: SVGProps<SVGSVGElement> & { showMarker?: boolean }) {
  return (
    <svg viewBox="286 496 63 38" fill="currentColor" aria-hidden {...props}>
      <path d="m 305.08408,511.95159 1.26,0.7 2.96,-3.22 1.39,0.41 2.3,-1.48 -0.46,-4.13 -0.95,-1.27 0.73,-0.99 6.78,-0.55 9.84,0.85 2.11,-3.43 3.13,-1.24 7.46,4.46 0,0 -0.4,9.76 0.74,6.87 3.72,1.55 -0.75,0.59 2.13,3.96 -3.67,0.52 -1.89,-2.67 -3.06,0.43 -0.83,-0.94 -1.22,1.45 -3.25,-0.14 -2.54,2.63 -1.86,-0.68 -2.44,1.09 -0.95,1.03 0.83,2.57 -3.95,-0.99 -1.93,1.43 -2,-0.41 -2.04,-2.98 -7.31,-2.5 -2.3,1.25 -1.91,-0.44 -2.91,3.43 -3.02,0.58 -1.76,-1.25 -1.49,-4.41 -2.22,0.21 -2.4,-2.13 -3.92,-0.45 0.39,-3.41 2,-1.04 0,0 3.43,-0.35 1.31,-1.97 1.38,0.59 1.66,-0.69 1.01,-2.49 6.87,-0.11 z" />
      {showMarker && (
        <g>
          <circle
            cx="341"
            cy="511.5"
            r="5.5"
            fill="none"
            stroke="#ffffff"
            strokeOpacity="0.55"
            strokeWidth="1.1"
          />
          <circle cx="341" cy="511.5" r="2.6" fill="#ffffff" />
        </g>
      )}
    </svg>
  );
}
