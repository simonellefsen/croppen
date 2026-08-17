"use client";

import type { Sex } from "@/lib/anatomy/types";
import { Plate } from "./Plate";
import { Bilateral, Part } from "./primitives";

/**
 * The small intestine as a bundle of overlapping loops rather than a neat
 * serpentine, which reads much closer to how it actually packs the abdomen.
 */
function coils(): string[] {
  const loops: string[] = [];
  const rows = [
    { y: 406, w: 30 },
    { y: 420, w: 34 },
    { y: 434, w: 33 },
    { y: 448, w: 28 },
    { y: 460, w: 21 },
  ];
  rows.forEach(({ y, w }, i) => {
    const cx = 210 + (i % 2 === 0 ? -4 : 5);
    loops.push(
      `M${cx - w} ${y}C${cx - w} ${y - 9} ${cx - w * 0.3} ${y - 11} ${cx} ${y - 6}` +
        `C${cx + w * 0.3} ${y - 1} ${cx + w} ${y - 8} ${cx + w} ${y + 1}` +
        `C${cx + w} ${y + 10} ${cx + w * 0.35} ${y + 12} ${cx + 2} ${y + 7}` +
        `C${cx - w * 0.35} ${y + 2} ${cx - w} ${y + 10} ${cx - w} ${y}Z`,
    );
  });
  return loops;
}

const COILS = coils();

/**
 * The viscera in situ, with a ghost of the skeleton behind for orientation —
 * the way an anatomical plate shows organs against the ribcage.
 */
export function Organs({ sex }: { sex: Sex }) {
  return (
    <g className="layer-organs has-plate">
      <Plate sex={sex} name="organs" />
      {/* ── Head ── */}
      <Part id="brain">
        <path
          d="M210 40C232 40 248 56 250 78C251 94 248 106 243 116C240 122 234 126 227 127L193 127C186 126 180 122 177 116C172 106 169 94 170 78C172 56 188 40 210 40Z"
          fill="url(#brainFill)"
        />
        {/* Gyri and sulci — wandering rather than concentric, so the surface
            reads as folded cortex instead of a striped dome. */}
        <g fill="none" stroke="#9e6d60" strokeWidth="1.6" opacity="0.8" strokeLinecap="round">
          <path d="M184 58C192 66 186 74 194 80C202 86 196 96 202 104" />
          <path d="M236 58C228 66 234 74 226 80C218 86 224 96 218 104" />
          <path d="M176 74C186 78 182 88 190 94C198 100 192 110 198 118" />
          <path d="M244 74C234 78 238 88 230 94C222 100 228 110 222 118" />
          <path d="M196 48C204 54 216 54 224 48" />
          <path d="M180 96C188 104 182 112 188 120" />
          <path d="M240 96C232 104 238 112 232 120" />
          <path d="M210 42L210 126" strokeWidth="1.8" />
        </g>
      </Part>

      <Part id="cerebellum">
        <path
          d="M186 118C196 114 224 114 234 118C238 126 236 134 228 137L192 137C184 134 182 126 186 118Z"
          fill="#c08c7c"
        />
        <g fill="none" stroke="#8d5f52" strokeWidth="0.9" opacity="0.8">
          <path d="M190 120L190 134" />
          <path d="M198 118L198 136" />
          <path d="M210 118L210 136" />
          <path d="M222 118L222 136" />
          <path d="M230 120L230 134" />
        </g>
      </Part>

      {/* ── Neck and chest ── */}
      <Part id="esophagus">
        <path
          d="M203 150C201 180 200 230 202 268C203 288 205 302 208 312L214 310C211 298 209 284 208 266C206 230 207 180 209 150Z"
          fill="#c99a8e"
          opacity="0.85"
        />
      </Part>

      <Part id="trachea">
        <path
          d="M202 152L218 152C219 178 219 204 218 226L202 226C201 204 201 178 202 152Z"
          fill="#d9c8b8"
        />
        <g stroke="#a8907c" strokeWidth="1.6" opacity="0.8">
          {Array.from({ length: 9 }, (_, i) => (
            <path key={i} d={`M203 ${160 + i * 7.6}L217 ${160 + i * 7.6}`} />
          ))}
        </g>
        {/* Bronchi */}
        <path d="M203 226C196 234 186 244 178 254L186 260C194 250 202 240 208 232Z" fill="#d9c8b8" />
        <path d="M217 226C224 234 234 244 242 254L234 260C226 250 218 240 212 232Z" fill="#d9c8b8" />
      </Part>

      <Part id="lungs">
        <g fill="url(#lungFill)" opacity="0.88">
          {/* Right lung (subject's right — three lobes) */}
          <path d="M200 226C186 224 168 232 158 248C149 264 148 288 152 308C155 322 160 330 168 332C182 332 194 326 200 316C204 300 204 258 200 226Z" />
          {/* Left lung (two lobes, notched for the heart) */}
          <path d="M220 226C234 224 252 232 262 248C271 264 272 288 268 308C265 322 260 330 252 332C240 332 230 326 226 316C222 306 224 296 230 288C224 282 220 274 220 264C220 250 220 236 220 226Z" />
        </g>
        <g fill="none" stroke="#8d4446" strokeWidth="1.4" opacity="0.7">
          <path d="M158 262C170 268 186 274 198 276" />
          <path d="M154 292C168 296 186 300 198 302" />
          <path d="M262 262C250 268 236 274 226 278" />
        </g>
      </Part>

      <Part id="heart" className="organ-heart">
        <path
          d="M210 274C216 264 232 262 240 272C248 282 246 298 238 312C232 322 224 330 217 336C210 330 202 322 197 312C190 298 189 282 197 272C203 264 206 268 210 274Z"
          fill="url(#heartFill)"
        />
        <path
          d="M210 276C210 296 213 316 217 334"
          fill="none"
          stroke="#7d1310"
          strokeWidth="1.6"
          opacity="0.7"
        />
        {/* Great vessels leaving the heart. */}
        <path
          d="M214 272C216 262 218 254 220 248"
          fill="none"
          stroke="#c03a2c"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path
          d="M203 272C201 262 199 254 197 248"
          fill="none"
          stroke="#3f6bc0"
          strokeWidth="5"
          strokeLinecap="round"
        />
      </Part>

      {/* ── Abdomen ── */}
      <Part id="liver">
        <path
          d="M154 336C168 330 196 330 214 336C218 346 218 360 214 372C208 384 194 390 178 390C164 390 154 384 150 372C147 358 148 344 154 336Z"
          fill="url(#liverFill)"
        />
        <path
          d="M198 334C200 350 200 366 196 380"
          fill="none"
          stroke="#4a1c12"
          strokeWidth="1.8"
          opacity="0.75"
        />
      </Part>

      <Part id="gallbladder">
        <ellipse cx="188" cy="384" rx="9" ry="7" fill="#6f8f3a" />
      </Part>

      <Part id="stomach">
        <path
          d="M222 344C232 338 250 340 258 352C266 364 264 382 254 392C244 400 230 400 222 394C216 388 216 378 220 372C224 366 224 356 222 344Z"
          fill="#c98470"
        />
        <g fill="none" stroke="#9c5a48" strokeWidth="1.2" opacity="0.7">
          <path d="M230 352C236 362 240 376 238 390" />
          <path d="M244 350C248 362 250 376 248 390" />
        </g>
      </Part>

      <Part id="spleen">
        <path
          d="M262 340C270 338 278 344 280 354C282 366 276 376 266 378C258 378 254 370 254 360C254 350 256 342 262 340Z"
          fill="#7d3550"
        />
      </Part>

      <Part id="pancreas">
        <path
          d="M206 386C218 380 238 378 252 382C258 384 258 392 252 393C238 396 220 396 208 393C204 391 203 388 206 386Z"
          fill="#d3a86e"
        />
      </Part>

      <Part id="kidneys">
        <Bilateral>
          <path
            d="M180 370C188 368 194 376 195 388C196 400 191 410 183 411C176 411 172 404 172 392C172 380 175 371 180 370Z"
            fill="#8e4a3e"
          />
          <path
            d="M180 370C184 378 184 402 182 410"
            fill="none"
            stroke="#5f2c23"
            strokeWidth="1.2"
            opacity="0.7"
          />
          {/* Ureter down to the bladder */}
          <path
            d="M186 410C190 428 194 446 200 458"
            fill="none"
            stroke="#c9a898"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        </Bilateral>
      </Part>

      <Part id="large-intestine">
        <path
          d="M164 470C160 448 158 424 160 404C162 396 168 392 176 392L244 392C252 392 258 396 260 404C262 424 260 448 256 470"
          fill="none"
          stroke="url(#gutFill)"
          strokeWidth="15"
          strokeLinecap="round"
        />
        <path
          d="M256 470C252 480 240 486 226 486"
          fill="none"
          stroke="url(#gutFill)"
          strokeWidth="14"
          strokeLinecap="round"
        />
        <g fill="none" stroke="#8f6238" strokeWidth="1.1" opacity="0.55">
          {[404, 418, 434, 450].map((y) => (
            <g key={y}>
              <path d={`M157 ${y}L172 ${y}`} />
              <path d={`M248 ${y}L263 ${y}`} />
            </g>
          ))}
          {[180, 196, 212, 228, 244].map((x) => (
            <path key={x} d={`M${x} 385L${x} 400`} />
          ))}
        </g>
      </Part>

      <Part id="small-intestine">
        {COILS.map((d, i) => (
          <path
            key={i}
            d={d}
            fill="none"
            stroke="#d99a6c"
            strokeWidth="10"
            strokeLinejoin="round"
          />
        ))}
        {COILS.map((d, i) => (
          <path
            key={`h${i}`}
            d={d}
            fill="none"
            stroke="#f4cda6"
            strokeWidth="2.6"
            strokeLinejoin="round"
            opacity="0.5"
          />
        ))}
      </Part>

      {/* ── Pelvis ── */}
      {sex === "female" ? (
        <>
          <Part id="uterus">
            <path
              d="M196 436C202 430 218 430 224 436C228 444 226 456 220 462C214 468 206 468 200 462C194 456 192 444 196 436Z"
              fill="#b56a72"
            />
            <path
              d="M196 438C186 432 176 430 170 434"
              fill="none"
              stroke="#b56a72"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <path
              d="M224 438C234 432 244 430 250 434"
              fill="none"
              stroke="#b56a72"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </Part>
          <Part id="ovaries">
            <Bilateral>
              <ellipse cx="168" cy="436" rx="8" ry="6" fill="#c98da0" />
            </Bilateral>
          </Part>
        </>
      ) : (
        <>
          <Part id="prostate">
            <ellipse cx="210" cy="470" rx="12" ry="9" fill="#a8757e" />
          </Part>
          <Part id="testes">
            <Bilateral>
              <ellipse cx="200" cy="492" rx="10" ry="13" fill="#c99a8e" />
              <path
                d="M200 480C202 474 206 470 210 468"
                fill="none"
                stroke="#c9a898"
                strokeWidth="2.4"
                strokeLinecap="round"
              />
            </Bilateral>
          </Part>
        </>
      )}

      <Part id="bladder">
        <path
          d="M196 456C204 452 216 452 224 456C230 462 230 472 224 478C216 483 204 483 196 478C190 472 190 462 196 456Z"
          fill="#e0c98a"
        />
        <path
          d="M210 480L210 492"
          stroke="#c9a898"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </Part>

      <Part id="diaphragm">
        <path
          d="M150 332C168 312 194 304 210 304C226 304 252 312 270 332"
          fill="none"
          stroke="#a8564a"
          strokeWidth="5"
          strokeLinecap="round"
          opacity="0.8"
        />
      </Part>
    </g>
  );
}
