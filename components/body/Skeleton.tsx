"use client";

import type { Sex } from "@/lib/anatomy/types";
import { Bilateral, Part } from "./primitives";

/**
 * Twelve rib pairs, generated from a width profile rather than hand-drawn.
 *
 * Only the subject's right side is produced; `Bilateral` mirrors it. Every
 * coordinate therefore stays at or left of the midline so the two halves meet
 * cleanly at the breastbone instead of crossing over each other.
 */
function ribs() {
  const bone: string[] = [];
  const cartilage: string[] = [];

  for (let n = 0; n < 12; n++) {
    const yPost = 216 + n * 10.2;
    const hw = 30 + 30 * Math.sin(((n + 0.9) / 13.5) * Math.PI);
    const xLat = 210 - hw;
    const yLat = yPost + 16 + n * 2;
    const yAnt = yPost + 30 + n * 3;
    // True ribs reach the breastbone; 8–10 stop short and join the costal
    // arch; 11 and 12 float, ending out in the flank.
    const xAnt = n < 7 ? 202 : n < 10 ? 200 - (n - 6) * 5 : xLat + 16;

    bone.push(
      `M203 ${yPost}` +
        `C${203 - hw * 0.5} ${yPost + 2} ${xLat} ${yLat - 15} ${xLat} ${yLat}` +
        `C${xLat} ${yLat + 14} ${(xLat + xAnt) / 2 - 6} ${yAnt} ${xAnt} ${yAnt}`,
    );

    if (n < 7) {
      cartilage.push(
        `M${xAnt} ${yAnt}C${xAnt - 4} ${yAnt - 4} 202 ${yAnt - 9} 205 ${yAnt - 11}`,
      );
    } else if (n < 10) {
      cartilage.push(
        `M${xAnt} ${yAnt}C${xAnt + 4} ${yAnt - 8} 196 ${yAnt - 24} 205 330`,
      );
    }
  }

  return { bone, cartilage };
}

const RIBS = ribs();

export function Skeleton({ sex }: { sex: Sex }) {
  // The female pelvis is wider with a rounder inlet — the skeleton's clearest
  // structural difference between the sexes.
  const p = sex === "female" ? 1.1 : 1;
  const shoulder = sex === "female" ? 0 : -10;

  return (
    <g className="layer-skeleton" fill="url(#boneRound)">
      {/* ── Skull ── */}
      <Part id="skull">
        <path d="M210 34C236 34 251 51 253 76C254 93 251 106 246 116C243 124 236 131 227 133L193 133C184 131 177 124 174 116C169 106 166 93 167 76C169 51 184 34 210 34Z" />
        <g fill="#1b1a15">
          <path d="M180 88C180 80 187 76 194 76C201 76 206 81 206 89C206 97 200 102 193 102C185 102 180 96 180 88Z" />
          <path d="M240 88C240 80 233 76 226 76C219 76 214 81 214 89C214 97 220 102 227 102C235 102 240 96 240 88Z" />
          <path d="M210 104C214 110 217 116 216 121C214 124 206 124 204 121C203 116 206 110 210 104Z" />
        </g>
        <g fill="none" stroke="#9d906f" strokeWidth="1.2" opacity="0.8">
          <path d="M172 72C186 62 234 62 248 72" />
          <path d="M210 36L210 62" />
        </g>
        {/* Cheekbones */}
        <Bilateral>
          <path d="M176 100C182 104 188 108 194 110L192 118C184 116 177 111 173 106Z" />
        </Bilateral>
        {/* Upper jaw and teeth */}
        <path d="M190 122C198 118 222 118 230 122L232 134C222 138 198 138 188 134Z" />
        <g fill="#f7f2e2">
          {[-16, -11, -6, -1, 4, 9, 14].map((dx) => (
            <rect key={dx} x={207 + dx} y="130" width="4" height="6" rx="1" />
          ))}
        </g>
      </Part>

      <Part id="mandible">
        <path d="M186 128C184 142 190 154 200 158L220 158C230 154 236 142 234 128L228 128C229 140 224 149 216 151L204 151C196 149 191 140 192 128Z" />
        <g fill="#f7f2e2">
          {[-14, -9, -4, 1, 6, 11].map((dx) => (
            <rect key={dx} x={207 + dx} y="140" width="4" height="6" rx="1" />
          ))}
        </g>
      </Part>

      {/* ── Spine ── */}
      <Part id="spine">
        {Array.from({ length: 24 }, (_, i) => {
          const y = 162 + i * 11.2;
          const w = 8 + i * 0.38;
          return (
            <g key={i}>
              <rect x={210 - w} y={y} width={w * 2} height="8.4" rx="2.6" />
              <rect
                x={210 - w - 3}
                y={y + 1.6}
                width="3"
                height="5"
                rx="1.4"
                opacity="0.75"
              />
              <rect
                x={210 + w}
                y={y + 1.6}
                width="3"
                height="5"
                rx="1.4"
                opacity="0.75"
              />
            </g>
          );
        })}
      </Part>

      {/* ── Thorax ── */}
      <g transform={`translate(${shoulder * 0.5} 0)`}>
        <Part id="ribs">
          <Bilateral>
            <g
              fill="none"
              stroke="url(#boneRound)"
              strokeWidth="5.4"
              strokeLinecap="round"
            >
              {RIBS.bone.map((d, i) => (
                <path key={i} d={d} />
              ))}
            </g>
            <g
              fill="none"
              stroke="#cfd3c0"
              strokeWidth="4"
              strokeLinecap="round"
              opacity="0.65"
            >
              {RIBS.cartilage.map((d, i) => (
                <path key={i} d={d} />
              ))}
            </g>
          </Bilateral>
        </Part>

        <Part id="sternum">
          <path d="M200 210C205 207 215 207 220 210L221 226C221 232 219 236 216 238L216 306C216 314 213 322 210 328C207 322 204 314 204 306L204 238C201 236 199 232 199 226Z" />
          <path
            d="M200 240L220 240"
            stroke="#9d906f"
            strokeWidth="1.1"
            opacity="0.7"
          />
        </Part>

        <Part id="clavicle">
          <Bilateral>
            <path
              d={`M199 212C186 205 ${168 + shoulder} 203 ${150 + shoulder} 210C${144 + shoulder} 213 ${143 + shoulder} 219 ${148 + shoulder} 222C${166 + shoulder} 217 184 216 198 220Z`}
            />
          </Bilateral>
        </Part>

        {/* Shoulder blade, seen edge-on from the front. */}
        <Part id="scapula">
          <Bilateral>
            <path
              d={`M${152 + shoulder} 218C${142 + shoulder} 222 ${137 + shoulder} 232 ${139 + shoulder} 244C${141 + shoulder} 256 ${148 + shoulder} 264 ${157 + shoulder} 266C${163 + shoulder} 262 ${165 + shoulder} 250 ${163 + shoulder} 238C${161 + shoulder} 228 ${157 + shoulder} 220 ${152 + shoulder} 218Z`}
              opacity="0.85"
            />
          </Bilateral>
        </Part>
      </g>

      {/* ── Arm ── */}
      <Part id="humerus">
        <Bilateral>
          <circle cx={148 + shoulder} cy={230 + 0} r="13" />
          <path
            d={`M${138 + shoulder} 240C${130 + shoulder} 260 ${126 + shoulder} 300 128 340C130 362 132 378 134 388L152 386C150 372 148 350 148 316C148 282 150 258 154 242Z`}
          />
          <path
            d={`M126 384C124 394 128 400 136 401L152 399C158 396 158 388 154 382Z`}
          />
        </Bilateral>
      </Part>

      <Part id="radius-ulna">
        <Bilateral>
          <path d="M128 400C122 424 116 452 112 476C110 486 114 492 120 491C126 489 130 480 132 468C136 444 140 420 142 402Z" />
          <path d="M146 400C144 424 142 452 140 476C139 486 134 491 128 490L126 480C128 456 132 428 136 402Z" />
        </Bilateral>
      </Part>

      <Part id="hand-bones">
        <Bilateral>
          {/* Carpals */}
          {[
            [118, 496],
            [126, 494],
            [134, 495],
            [120, 504],
            [128, 503],
            [136, 504],
          ].map(([x, y], i) => (
            <ellipse key={i} cx={x} cy={y} rx="4" ry="3.4" />
          ))}
          {/* Metacarpals and phalanges */}
          {[
            [113, 512, 106, 534],
            [120, 512, 116, 540],
            [127, 512, 125, 542],
            [134, 512, 133, 538],
          ].map(([x1, y1, x2, y2], i) => (
            <g key={i}>
              <path
                d={`M${x1} ${y1}L${x2} ${y2}`}
                stroke="url(#boneRound)"
                strokeWidth="4.4"
                strokeLinecap="round"
              />
              <circle cx={x2} cy={y2} r="2.6" />
              <path
                d={`M${x2} ${y2}L${x2 - 2} ${y2 + 8}`}
                stroke="url(#boneRound)"
                strokeWidth="3.4"
                strokeLinecap="round"
              />
            </g>
          ))}
          {/* Thumb */}
          <path
            d="M112 508L102 522"
            stroke="url(#boneRound)"
            strokeWidth="4.6"
            strokeLinecap="round"
          />
          <path
            d="M102 522L98 534"
            stroke="url(#boneRound)"
            strokeWidth="3.6"
            strokeLinecap="round"
          />
        </Bilateral>
      </Part>

      {/* ── Pelvis ── */}
      <Part id="pelvis">
        <Bilateral>
          {/* Iliac wing, from the crest down to the hip socket. */}
          <path
            d={`M198 400C${176 - 6 * p} 392 ${152 - 10 * p} 399 ${141 - 12 * p} 414C${131 - 12 * p} 429 ${130 - 10 * p} 450 ${137 - 8 * p} 464C${142 - 5 * p} 474 150 480 158 483C166 481 172 472 172 462C170 444 174 420 198 410Z`}
          />
          {/* The pubic and ischial rami form a ring; the gap they enclose is
              the obturator foramen, so no hole needs to be cut. */}
          <g
            fill="none"
            stroke="url(#boneRound)"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d={`M${152 - 5 * p} 466C168 478 190 486 205 490`} strokeWidth="9" />
            <path
              d={`M${149 - 5 * p} 474C${143 - 4 * p} 488 ${146 - 3 * p} 502 158 509C174 513 193 507 205 501`}
              strokeWidth="10"
            />
          </g>
          {/* Hip socket */}
          <circle cx={152 - 6 * p} cy="470" r="10.5" fill="#100e0a" opacity="0.85" />
          {/* Iliac crest highlight */}
          <path
            d={`M198 400C${176 - 6 * p} 392 ${152 - 10 * p} 399 ${141 - 12 * p} 414`}
            fill="none"
            stroke="#f6efd8"
            strokeWidth="2.6"
            strokeLinecap="round"
            opacity="0.8"
          />
        </Bilateral>
        {/* The pelvic inlet — wider and rounder in the female pelvis. */}
        <ellipse
          cx="210"
          cy="454"
          rx={sex === "female" ? 33 : 25}
          ry={sex === "female" ? 25 : 27}
          fill="#0c0b08"
        />
      </Part>

      {/* Drawn after the pelvis so the sacrum reads as sitting in front of it. */}
      <Part id="spine">
        <path d="M190 426C200 422 220 422 230 426C233 444 230 462 222 474C217 481 203 481 198 474C190 462 187 444 190 426Z" />
        <g fill="none" stroke="#9d906f" strokeWidth="0.9" opacity="0.7">
          <path d="M193 440L227 440" />
          <path d="M196 452L224 452" />
          <path d="M199 464L221 464" />
        </g>
        <path d="M205 476C208 475 212 475 215 476C215 484 213 490 210 492C207 490 205 484 205 476Z" />
      </Part>

      {/* ── Leg ── */}
      <Part id="femur">
        <Bilateral>
          <circle cx={153 - 6 * p} cy="470" r="10.5" />
          <path
            d={`M${160 - 6 * p} 478C${152 - 4 * p} 484 ${148 - 2 * p} 494 150 504C152 512 158 516 164 514Z`}
          />
          <path d="M158 500C150 536 148 588 152 640C154 654 158 662 164 666L184 664C180 640 176 588 176 540C176 514 172 498 166 492Z" />
          <path d="M150 656C146 668 148 680 158 684L186 682C194 678 194 666 190 656Z" />
        </Bilateral>
      </Part>

      <Part id="patella">
        <Bilateral>
          <ellipse cx="172" cy="682" rx="12" ry="10" fill="#e8e0c6" />
        </Bilateral>
      </Part>

      <Part id="tibia-fibula">
        <Bilateral>
          <path d="M158 690C152 700 152 714 156 724C160 730 176 732 186 728C192 722 192 704 186 692Z" />
          <path d="M162 724C158 764 156 830 158 884C160 896 168 902 178 900C182 862 184 800 184 730Z" />
          <path d="M150 700C144 706 142 716 146 724C148 728 152 728 154 724Z" />
          <path d="M148 726C144 766 142 830 144 880C146 892 152 896 158 894C156 848 156 780 158 730Z" />
        </Bilateral>
      </Part>

      <Part id="foot-bones">
        <Bilateral>
          {/* Talus and calcaneus */}
          <path d="M152 898C144 902 140 912 142 922C144 932 152 938 162 936C172 934 178 926 176 916C174 906 164 898 152 898Z" />
          <path d="M148 926C142 934 142 946 148 952C156 958 172 958 180 952C184 946 182 936 176 930Z" />
          {/* Metatarsals and toes */}
          {[
            [166, 932, 186, 946],
            [170, 936, 190, 950],
            [172, 940, 192, 954],
            [174, 944, 192, 958],
          ].map(([x1, y1, x2, y2], i) => (
            <g key={i}>
              <path
                d={`M${x1} ${y1}L${x2} ${y2}`}
                stroke="url(#boneRound)"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <circle cx={x2} cy={y2} r="2.4" />
            </g>
          ))}
        </Bilateral>
      </Part>

      {/* A window cut into the thigh bone, showing what fills its shaft. */}
      <Part id="bone-marrow">
        <Bilateral>
          <path
            d="M158 556C156 588 156 618 158 646L180 645C178 616 178 586 180 555Z"
            fill="#2a2118"
          />
          <path
            d="M163 562C161 590 161 616 163 640L175 639C173 614 173 588 175 561Z"
            fill="#b4506a"
          />
          <path
            d="M166 566C165 592 165 614 166 636"
            fill="none"
            stroke="#e6909f"
            strokeWidth="1.4"
            opacity="0.65"
          />
          <path
            d="M158 556C156 588 156 618 158 646L180 645C178 616 178 586 180 555Z"
            fill="none"
            stroke="#f0e8ce"
            strokeWidth="1.6"
            opacity="0.85"
          />
        </Bilateral>
      </Part>
    </g>
  );
}
