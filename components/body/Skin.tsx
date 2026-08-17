"use client";

import { GEOMETRY } from "@/lib/anatomy/geometry";
import type { Sex } from "@/lib/anatomy/types";
import { Plate } from "./Plate";
import { Bilateral, Part } from "./primitives";

/**
 * The intact body surface. Everything here is tinted from the `--skin-*`
 * custom properties, which the appearance picker swaps out — nothing in any
 * deeper layer changes with appearance.
 */
export function Skin({ sex }: { sex: Sex }) {
  const g = GEOMETRY[sex];
  const head = sex === "female" ? headFemale : headMale;

  return (
    <g className="layer-skin has-plate">
      <Part id="skin">
        <path d={g.silhouette.torso} fill="url(#skinRound)" />
        <path d={g.silhouette.neck} fill="url(#skinRound)" />
        <Bilateral>
          <path d={g.silhouetteBilateral.arm} fill="url(#skinRound)" />
          <path d={g.silhouetteBilateral.leg} fill="url(#skinRound)" />
        </Bilateral>
        <path d={g.silhouette.head} fill="url(#skinRound)" />

        {/* Soft surface modelling — collarbones, ribs, midline, knees. */}
        <g
          fill="none"
          stroke="var(--skin-deep)"
          strokeLinecap="round"
          opacity="0.28"
        >
          {sex === "female" ? (
            <>
              <path d="M172 214C186 222 200 224 210 224C220 224 234 222 248 214" strokeWidth="2.2" />
              <path d="M210 232L210 366" strokeWidth="1.6" opacity="0.5" />
              <path d="M176 300C188 306 196 308 210 308C224 308 232 306 244 300" strokeWidth="1.4" opacity="0.6" />
              <path d="M164 452C176 470 188 478 210 478C232 478 244 470 256 452" strokeWidth="1.6" />
            </>
          ) : (
            <>
              <path d="M166 214C184 224 200 226 210 226C220 226 236 224 254 214" strokeWidth="2.4" />
              <path d="M210 236L210 372" strokeWidth="1.8" opacity="0.55" />
              <path d="M164 268C180 282 194 288 210 288C226 288 240 282 256 268" strokeWidth="2" opacity="0.7" />
              <path d="M176 338L244 338" strokeWidth="1.4" opacity="0.5" />
              <path d="M178 362L242 362" strokeWidth="1.4" opacity="0.5" />
              <path d="M170 452C182 470 190 478 210 478C230 478 238 470 250 452" strokeWidth="1.8" />
            </>
          )}
          <Bilateral>
            <path d="M148 686C158 694 172 696 184 690" strokeWidth="1.6" opacity="0.7" />
            <path d="M112 390C120 396 128 396 134 392" strokeWidth="1.4" opacity="0.7" />
          </Bilateral>
        </g>

        {/* Breast contour. */}
        {sex === "female" && (
          <Bilateral>
            <path
              d="M154 252C146 274 150 296 168 302C186 308 200 296 202 278C204 262 196 250 182 246"
              fill="none"
              stroke="var(--skin-deep)"
              strokeWidth="1.8"
              opacity="0.35"
              strokeLinecap="round"
            />
          </Bilateral>
        )}

        {/* Nipples and navel. */}
        <Bilateral>
          <ellipse
            cx={sex === "female" ? 176 : 172}
            cy={sex === "female" ? 288 : 276}
            rx="6"
            ry="5"
            fill="var(--skin-deep)"
            opacity="0.55"
          />
        </Bilateral>
      </Part>
      {/* Lighting pass sits on top of the tinted silhouette so appearance
          still drives melanin, while the 3D form reads through multiply. */}
      <Plate sex={sex} name="skin-light" blend="multiply" />

      <Part id="navel">
        <ellipse
          cx="210"
          cy={sex === "female" ? 396 : 392}
          rx="5"
          ry="7"
          fill="var(--skin-deep)"
          opacity="0.7"
        />
      </Part>

      {/* Fingernails and toenails. */}
      <Part id="nail">
        <Bilateral>
          {(sex === "female"
            ? [
                [116, 540],
                [122, 546],
                [128, 544],
              ]
            : [
                [104, 542],
                [110, 548],
                [116, 546],
              ]
          ).map(([x, y], i) => (
            <ellipse
              key={i}
              cx={x}
              cy={y}
              rx="3"
              ry="4"
              fill="var(--skin-light)"
              opacity="0.9"
            />
          ))}
          <ellipse
            cx={sex === "female" ? 190 : 194}
            cy="958"
            rx="4"
            ry="3"
            fill="var(--skin-light)"
            opacity="0.85"
          />
        </Bilateral>
      </Part>

      {head}

      {/* A magnified detail of the skin's own layers, in the manner of the
          inset boxes in the source plates. */}
      <Part id="melanin" className="skin-inset">
        {/* Leader tying the magnified detail back to the surface it came from. */}
        <path
          d="M294 600L322 604"
          stroke="var(--rule)"
          strokeWidth="1.2"
          fill="none"
        />
        <circle cx="294" cy="600" r="2.4" fill="var(--rule-strong)" />
        <g transform="translate(352 604)">
          <circle r="30" fill="var(--panel)" stroke="var(--rule)" strokeWidth="1.5" />
          <clipPath id="skinInsetClip">
            <circle r="27" />
          </clipPath>
          <g clipPath="url(#skinInsetClip)">
            <rect x="-30" y="-30" width="60" height="18" fill="var(--skin-light)" />
            <rect x="-30" y="-12" width="60" height="9" fill="var(--skin-base)" />
            <rect x="-30" y="-3" width="60" height="20" fill="var(--skin-shade)" />
            <rect x="-30" y="17" width="60" height="16" fill="#f4d9a8" opacity="0.85" />
            {[-22, -12, -2, 8, 18].map((x) => (
              <circle key={x} cx={x} cy="-7" r="2.4" fill="var(--hair)" opacity="0.9" />
            ))}
            <path d="M-30 20C-16 14 -2 24 12 18 20 15 26 20 30 18" stroke="#c0392b" strokeWidth="1.4" fill="none" opacity="0.7" />
          </g>
          <circle r="30" fill="none" stroke="var(--rule)" strokeWidth="1.5" />
        </g>
      </Part>
    </g>
  );
}

const eyes = (
  <>
    <Part id="eye-surface">
      {[-17, 17].map((dx) => (
        <g key={dx} transform={`translate(${210 + dx} 96)`}>
          <path d="M-11 0C-7 -6 7 -6 11 0C7 6 -7 6 -11 0Z" fill="#f6f1ea" />
          <circle r="4.6" fill="var(--iris)" />
          <circle r="2.1" fill="#14100e" />
          <circle cx="-1.6" cy="-1.6" r="1.1" fill="#fff" opacity="0.85" />
          <path d="M-11 0C-7 -6 7 -6 11 0" fill="none" stroke="var(--hair)" strokeWidth="1.6" strokeLinecap="round" />
        </g>
      ))}
    </Part>
    <g fill="var(--hair)" opacity="0.85">
      <path d="M182 84C188 79 199 79 204 83L203 86C197 83 188 83 183 87Z" />
      <path d="M238 84C232 79 221 79 216 83L217 86C223 83 232 83 237 87Z" />
    </g>
  </>
);

const face = (
  <>
    {eyes}
    <Part id="nose">
      <path
        d="M210 100C208 110 205 116 203 121C201 126 205 129 210 129C215 129 219 126 217 121C215 116 212 110 210 100"
        fill="var(--skin-shade)"
        opacity="0.35"
      />
      <ellipse cx="204" cy="124" rx="2.4" ry="1.6" fill="var(--skin-deep)" opacity="0.8" />
      <ellipse cx="216" cy="124" rx="2.4" ry="1.6" fill="var(--skin-deep)" opacity="0.8" />
    </Part>
    <g>
      <path
        d="M197 138C202 134 218 134 223 138C218 143 202 143 197 138Z"
        fill="var(--lip)"
      />
      <path d="M197 138C202 136 218 136 223 138" fill="none" stroke="var(--skin-deep)" strokeWidth="0.9" opacity="0.6" />
    </g>
  </>
);

const headFemale = (
  <>
    <Part id="ear">
      <Bilateral>
        <ellipse cx="167" cy="104" rx="7" ry="12" fill="var(--skin-shade)" />
        <ellipse cx="168" cy="104" rx="3.5" ry="7" fill="var(--skin-deep)" opacity="0.45" />
      </Bilateral>
    </Part>
    <Part id="hair">
      <path
        d="M210 26C240 26 258 48 258 80C258 96 256 108 254 118C258 96 256 74 250 62C246 68 238 70 228 66C216 61 200 61 188 68C178 72 170 70 166 62C160 74 158 96 162 118C160 108 158 96 158 80C158 48 180 26 210 26Z"
        fill="var(--hair)"
      />
      <path
        d="M164 66C160 92 158 128 162 168C164 186 158 196 150 198C144 199 140 194 142 186C150 154 152 106 152 78Z"
        fill="var(--hair)"
      />
      <path
        d="M256 66C260 92 262 128 258 168C256 186 262 196 270 198C276 199 280 194 278 186C270 154 268 106 268 78Z"
        fill="var(--hair)"
      />
    </Part>
    {face}
  </>
);

const headMale = (
  <>
    <Part id="ear">
      <Bilateral>
        <ellipse cx="164" cy="104" rx="7.5" ry="13" fill="var(--skin-shade)" />
        <ellipse cx="165" cy="104" rx="3.5" ry="7.5" fill="var(--skin-deep)" opacity="0.45" />
      </Bilateral>
    </Part>
    <Part id="hair">
      <path
        d="M210 24C240 24 258 46 258 78C258 88 257 96 256 104C254 88 250 74 244 66C238 72 228 74 218 70C206 65 190 66 178 72C170 76 165 74 162 66C158 76 156 90 154 104C153 96 152 88 152 78C152 46 180 24 210 24Z"
        fill="var(--hair)"
      />
    </Part>
    {face}
    <path
      d="M188 128C192 144 198 152 210 152C222 152 228 144 232 128C232 146 224 158 210 158C196 158 188 146 188 128Z"
      fill="var(--hair)"
      opacity="0.28"
    />
  </>
);
