import * as React from 'react';

// Compact "adh" brand mark (the h with the arrow), vectorized from images/logo-mark.svg.
// Uses currentColor so it inherits the surrounding text color; the arrow is negative space.
export function LogoMark(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox='0 0 233 357' fill='currentColor' role='img' aria-label='adh' {...props}>
      <path
        transform='translate(0,357) scale(0.1,-0.1)'
        d='M10 1992 c0 -1413 2 -1574 16 -1623 136 -456 750 -484 917 -41 21 55 22 71 24 577 l3 520 -52 -55 c-28 -30 -78 -95 -111 -145 -33 -49 -56 -81 -52 -70 91 259 400 1074 406 1068 7 -8 399 -1060 399 -1072 0 -3 -19 23 -41 59 -50 79 -144 196 -164 204 -13 5 -15 -57 -15 -469 l0 -475 490 0 490 0 0 758 c0 918 -6 968 -131 1188 -277 485 -1025 557 -1416 135 l-53 -56 0 533 0 532 -355 0 -355 0 0 -1568z'
      />
    </svg>
  );
}
