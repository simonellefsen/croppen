"use client";

import type { Sex } from "@/lib/anatomy/types";
import { Bilateral, Part } from "./primitives";

/* ───────────────────────── Circulatory ───────────────────────── */

export function Circulatory({ pulse }: { pulse: boolean }) {
  return (
    <g className="sys-circulatory" filter="url(#lift)">
      {/* Veins sit behind the arteries throughout. */}
      <g
        fill="none"
        stroke="var(--vein)"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Part id="vena-cava">
          <path d="M200 250C198 268 197 288 198 306C199 330 200 360 202 392C203 418 204 436 206 450" strokeWidth="7" />
          <path d="M200 250C192 236 184 226 176 220" strokeWidth="5" />
        </Part>
        <Bilateral>
          <path d="M196 176C192 196 188 210 184 220" strokeWidth="4.5" />
          <path d="M176 220C164 226 148 238 138 254" strokeWidth="4.5" />
          <path d="M138 254C130 288 126 330 124 372C122 404 118 440 114 470" strokeWidth="4" />
          <path d="M114 470C112 486 112 500 114 512" strokeWidth="3" />
        </Bilateral>
        <Part id="saphenous">
          <Bilateral>
            <path d="M198 452C194 486 190 530 188 574C186 622 184 668 184 706" strokeWidth="4.5" />
            <path d="M184 706C182 746 180 800 180 850C180 878 180 900 182 918" strokeWidth="4" />
            <path d="M182 918C184 934 186 944 188 950" strokeWidth="3" />
          </Bilateral>
        </Part>
      </g>

      {/* Arteries */}
      <g
        fill="none"
        stroke="var(--artery)"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Part id="aorta">
          <path
            d="M216 268C220 254 226 246 232 244C240 244 244 252 242 262C240 272 232 280 226 286C222 300 220 320 219 344C218 376 217 404 216 428C215 440 214 448 212 454"
            strokeWidth="7.5"
          />
          <path d="M212 454C208 462 202 470 196 476" strokeWidth="6" />
          <path d="M212 454C216 462 222 470 228 476" strokeWidth="6" />
          {/* Branches to the gut and kidneys */}
          <Bilateral>
            <path d="M218 358C208 362 196 366 186 370" strokeWidth="3" />
            <path d="M219 392C210 396 200 400 192 404" strokeWidth="2.6" />
          </Bilateral>
        </Part>

        <Part id="carotid">
          <Bilateral>
            <path d="M200 216C198 200 196 182 194 166C193 152 194 140 198 130" strokeWidth="5" />
            <path d="M194 166C188 156 182 148 178 142" strokeWidth="3.2" />
            <path d="M198 130C200 118 204 106 208 96" strokeWidth="3" />
          </Bilateral>
        </Part>

        <Part id="pulmonary">
          <path d="M220 268C224 258 230 250 238 246" strokeWidth="5.5" />
          <path d="M204 268C200 258 194 250 186 246" strokeWidth="5.5" />
          <g strokeWidth="2.4">
            <path d="M186 246C178 252 170 262 164 274" />
            <path d="M238 246C246 252 254 262 260 274" />
          </g>
        </Part>

        <Part id="brachial-artery">
          <Bilateral>
            <path d="M204 224C190 226 172 234 158 248" strokeWidth="4.6" />
            <path d="M158 248C148 280 142 322 138 366C136 380 134 390 132 398" strokeWidth="4.2" />
            <path d="M132 398C128 424 122 452 118 474" strokeWidth="3.2" />
            <path d="M132 398C132 424 130 452 128 476" strokeWidth="2.8" />
            <path d="M118 474C114 490 112 504 112 516" strokeWidth="2.2" />
          </Bilateral>
        </Part>

        <Part id="femoral-artery">
          <Bilateral>
            <path d="M196 476C190 512 184 556 180 600C177 636 175 664 174 684" strokeWidth="5.4" />
            <path d="M174 684C172 716 170 756 168 800C166 840 166 876 168 904" strokeWidth="4.4" />
            <path d="M168 904C170 926 174 942 178 952" strokeWidth="3" />
          </Bilateral>
        </Part>
      </g>

      {/* Capillary beds where the two trees meet. */}
      <Part id="capillaries">
        <g fill="none" strokeWidth="1.1" opacity="0.85">
          <Bilateral>
            <g stroke="#8e4d8a">
              <path d="M112 516C108 526 106 536 108 544" />
              <path d="M116 516C114 528 114 538 116 546" />
              <path d="M120 514C122 528 124 538 124 546" />
              <path d="M178 952C176 958 174 962 172 964" />
              <path d="M182 950C182 956 182 960 182 964" />
            </g>
          </Bilateral>
          <g stroke="#8e4d8a">
            <path d="M198 96C194 86 190 78 186 72" />
            <path d="M222 96C226 86 230 78 234 72" />
            <path d="M204 92C202 80 200 70 198 62" />
            <path d="M216 92C218 80 220 70 222 62" />
          </g>
        </g>
      </Part>

      {/* The heart itself, on top of its vessels. */}
      <Part id="heart" className={pulse ? "beating" : undefined}>
        <path
          d="M210 274C216 264 232 262 240 272C248 282 246 298 238 312C232 322 224 330 217 336C210 330 202 322 197 312C190 298 189 282 197 272C203 264 206 268 210 274Z"
          fill="url(#heartFill)"
          stroke="#5e100c"
          strokeWidth="1.2"
        />
      </Part>

      {pulse && (
        <g
          className="flow"
          fill="none"
          stroke="#ff9a86"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="14 190"
          opacity="0.95"
        >
          <path d="M216 268C220 254 226 246 232 244C240 244 244 252 242 262C240 272 232 280 226 286C222 300 220 320 219 344C218 376 217 404 216 428C215 440 214 448 212 454" />
          <Bilateral>
            <path d="M196 476C190 512 184 556 180 600C177 636 175 664 174 684C172 716 170 756 168 800C166 840 166 876 168 904" />
            <path d="M204 224C190 226 172 234 158 248C148 280 142 322 138 366C136 380 134 390 132 398C128 424 122 452 118 474" />
            <path d="M200 216C198 200 196 182 194 166C193 152 194 140 198 130C200 118 204 106 208 96" />
          </Bilateral>
        </g>
      )}
    </g>
  );
}

/* ───────────────────────── Nervous ───────────────────────── */

export function Nervous() {
  return (
    <g className="sys-nervous" filter="url(#lift)">
      <Part id="cerebrum">
        <path
          d="M210 40C232 40 248 56 250 78C251 94 248 106 243 116C240 122 234 126 227 127L193 127C186 126 180 122 177 116C172 106 169 94 170 78C172 56 188 40 210 40Z"
          fill="#efe3ab"
          stroke="#b9a765"
          strokeWidth="1.2"
        />
        <g fill="none" stroke="#b9a765" strokeWidth="1.4" opacity="0.85" strokeLinecap="round">
          <path d="M180 60C192 52 228 52 240 60" />
          <path d="M175 74C190 66 230 66 245 74" />
          <path d="M174 88C190 82 230 82 246 88" />
          <path d="M178 102C192 97 228 97 242 102" />
        </g>
      </Part>

      <Part id="cerebellum">
        <path
          d="M186 118C196 114 224 114 234 118C238 126 236 134 228 137L192 137C184 134 182 126 186 118Z"
          fill="#d8c98a"
          stroke="#a89457"
          strokeWidth="1"
        />
      </Part>

      <Part id="brainstem">
        <path d="M204 126L216 126C217 140 217 150 216 158L204 158C203 150 203 140 204 126Z" fill="#e2d49a" />
      </Part>

      <Part id="spinal-cord">
        <path
          d="M204 156C202 200 201 260 202 320C203 372 205 410 208 440L214 438C211 408 209 370 208 318C207 258 208 200 210 156Z"
          fill="#e8dba4"
        />
        {/* Segmental nerve roots */}
        <g stroke="var(--nerve)" strokeWidth="1.6" strokeLinecap="round" opacity="0.75">
          {Array.from({ length: 20 }, (_, i) => {
            const y = 176 + i * 13;
            return (
              <g key={i}>
                <path d={`M203 ${y}L${192 - i * 0.5} ${y + 7}`} />
                <path d={`M215 ${y}L${228 + i * 0.5} ${y + 7}`} />
              </g>
            );
          })}
        </g>
      </Part>

      <g fill="none" stroke="var(--nerve)" strokeLinecap="round" strokeLinejoin="round">
        <Part id="brachial-plexus">
          <Bilateral>
            <path d="M202 196C192 202 180 212 168 224" strokeWidth="3.4" />
            <path d="M202 208C192 214 182 222 172 232" strokeWidth="2.8" />
            <path d="M168 224C158 232 150 240 144 250" strokeWidth="3.6" />
          </Bilateral>
        </Part>

        <Part id="vagus">
          <Bilateral>
            <path d="M206 150C202 172 200 196 200 220C200 248 202 276 206 300" strokeWidth="2.4" opacity="0.9" />
            <path d="M206 300C202 320 200 344 202 366" strokeWidth="2" opacity="0.8" />
          </Bilateral>
        </Part>

        <Bilateral>
          {/* Median, ulnar and radial nerves down the arm */}
          <path d="M144 250C138 288 134 330 132 372C131 386 130 394 129 402" strokeWidth="3" />
          <path d="M129 402C126 430 122 458 119 480" strokeWidth="2.4" />
          <path d="M129 402C130 430 129 458 127 480" strokeWidth="2" />
          <path d="M119 480C116 496 114 510 114 522" strokeWidth="1.6" />
          <path d="M127 480C126 496 126 510 127 522" strokeWidth="1.6" />
        </Bilateral>
      </g>

      <Part id="sciatic-nerve">
        <Bilateral>
          <g fill="none" stroke="var(--nerve)" strokeLinecap="round">
            <path d="M198 452C194 470 188 494 184 520" strokeWidth="5" />
            <path d="M184 520C180 556 176 600 174 644C173 664 172 678 171 690" strokeWidth="4.4" />
            <path d="M171 690C168 726 166 772 165 816C164 852 165 884 167 906" strokeWidth="3.4" />
            <path d="M171 690C176 726 179 772 180 816" strokeWidth="2.4" />
            <path d="M167 906C169 928 173 942 177 952" strokeWidth="2.2" />
          </g>
        </Bilateral>
      </Part>

      {/* Fine peripheral branching. */}
      <g fill="none" stroke="var(--nerve)" strokeWidth="1" opacity="0.6" strokeLinecap="round">
        <Bilateral>
          <path d="M114 522C111 532 109 542 110 550" />
          <path d="M118 522C117 534 117 544 118 552" />
          <path d="M124 522C125 534 126 544 126 550" />
          <path d="M177 952C176 958 174 962 173 964" />
          <path d="M180 950C180 956 180 960 180 964" />
          <path d="M156 300C146 306 136 314 128 324" />
          <path d="M158 340C148 346 140 354 134 362" />
          <path d="M186 560C176 572 168 586 162 602" />
          <path d="M182 620C174 632 168 646 164 660" />
        </Bilateral>
      </g>
    </g>
  );
}

/* ───────────────────────── Lymphatic ───────────────────────── */

export function Lymphatic() {
  return (
    <g className="sys-lymphatic" filter="url(#lift)">
      {/* Vessel network */}
      <g
        fill="none"
        stroke="var(--lymph)"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.75"
      >
        <Bilateral>
          <path d="M194 160C190 180 186 200 182 218" />
          <path d="M182 218C170 230 158 244 150 260" />
          <path d="M150 260C144 296 140 336 138 376C136 406 132 440 128 470" />
          <path d="M198 470C194 506 190 550 188 594C186 640 184 684 184 720" />
          <path d="M184 720C182 764 180 812 180 858C180 890 181 916 183 936" />
          <path d="M202 420C198 440 196 456 196 470" />
        </Bilateral>
      </g>

      <Part id="thoracic-duct">
        <path
          d="M206 440C204 412 202 380 201 348C200 322 199 300 199 282C199 266 200 254 202 244"
          fill="none"
          stroke="#8fe3c2"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M202 244C196 236 188 230 180 226"
          fill="none"
          stroke="#8fe3c2"
          strokeWidth="3.4"
          strokeLinecap="round"
        />
        <ellipse cx="204" cy="446" rx="7" ry="9" fill="#8fe3c2" opacity="0.9" />
      </Part>

      <Part id="lymph-nodes-cervical">
        <Bilateral>
          {[
            [193, 166],
            [189, 182],
            [186, 198],
            [199, 190],
          ].map(([x, y], i) => (
            <ellipse key={i} cx={x} cy={y} rx="5" ry="4" fill="var(--lymph)" />
          ))}
        </Bilateral>
      </Part>

      <Part id="lymph-nodes-axillary">
        <Bilateral>
          {[
            [156, 250],
            [148, 258],
            [158, 264],
            [147, 270],
            [162, 276],
          ].map(([x, y], i) => (
            <ellipse key={i} cx={x} cy={y} rx="5.4" ry="4.4" fill="var(--lymph)" />
          ))}
        </Bilateral>
      </Part>

      <Part id="lymph-nodes-inguinal">
        <Bilateral>
          {[
            [188, 466],
            [180, 476],
            [192, 480],
            [178, 490],
          ].map(([x, y], i) => (
            <ellipse key={i} cx={x} cy={y} rx="5.4" ry="4.4" fill="var(--lymph)" />
          ))}
        </Bilateral>
      </Part>

      <Part id="thymus">
        <path
          d="M200 246C196 240 194 232 196 226C202 222 218 222 224 226C226 232 224 240 220 246C216 252 204 252 200 246Z"
          fill="#b8e6c8"
          stroke="#5fa886"
          strokeWidth="1"
        />
      </Part>

      <Part id="spleen">
        <path
          d="M262 340C270 338 278 344 280 354C282 366 276 376 266 378C258 378 254 370 254 360C254 350 256 342 262 340Z"
          fill="#7d3550"
          stroke="#4fbf95"
          strokeWidth="1.6"
        />
      </Part>

      {/* Bone marrow, where the white cells originate. */}
      <Part id="bone-marrow">
        <Bilateral>
          <path
            d="M164 560C162 584 162 614 164 636L172 635C170 612 170 582 172 559Z"
            fill="#b4506a"
            stroke="#4fbf95"
            strokeWidth="1.2"
          />
        </Bilateral>
      </Part>
    </g>
  );
}

/* ───────────────────────── Endocrine ───────────────────────── */

export function Endocrine({ sex }: { sex: Sex }) {
  return (
    <g className="sys-endocrine" filter="url(#glow)">
      <Part id="hypothalamus">
        <ellipse cx="204" cy="104" rx="9" ry="6" fill="#f0a8de" />
      </Part>

      <Part id="pituitary">
        <circle cx="210" cy="118" r="6" fill="var(--endo)" />
        <path d="M210 112L208 106" stroke="var(--endo)" strokeWidth="2" strokeLinecap="round" />
      </Part>

      <Part id="thyroid">
        <path
          d="M196 190C192 196 192 206 197 210C202 212 206 208 208 202L212 202C214 208 218 212 223 210C228 206 228 196 224 190C216 186 204 186 196 190Z"
          fill="var(--endo)"
        />
      </Part>

      <Part id="thymus">
        <path
          d="M200 246C196 240 194 232 196 226C202 222 218 222 224 226C226 232 224 240 220 246C216 252 204 252 200 246Z"
          fill="#e08ac4"
          opacity="0.9"
        />
      </Part>

      <Part id="adrenals">
        <Bilateral>
          <path
            d="M172 364C178 360 188 362 192 368C194 373 190 377 184 377C177 377 172 372 172 364Z"
            fill="var(--endo)"
          />
        </Bilateral>
      </Part>

      <Part id="pancreas-islets">
        <path
          d="M206 386C218 380 238 378 252 382C258 384 258 392 252 393C238 396 220 396 208 393C204 391 203 388 206 386Z"
          fill="#d3a86e"
          opacity="0.55"
        />
        {[
          [216, 388],
          [228, 386],
          [240, 387],
          [248, 389],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="3.4" fill="var(--endo)" />
        ))}
      </Part>

      {sex === "female" ? (
        <Part id="ovaries">
          <Bilateral>
            <ellipse cx="168" cy="436" rx="8" ry="6" fill="var(--endo)" />
          </Bilateral>
        </Part>
      ) : (
        <Part id="testes">
          <Bilateral>
            <ellipse cx="200" cy="492" rx="10" ry="13" fill="var(--endo)" />
          </Bilateral>
        </Part>
      )}

      {/* Hormones travel in the blood, so the glands are linked by the vessels. */}
      <g
        fill="none"
        stroke="var(--endo)"
        strokeWidth="1.2"
        strokeDasharray="3 5"
        opacity="0.45"
      >
        <path d="M210 124C208 152 204 180 202 190" />
        <path d="M206 212C204 226 202 238 204 244" />
        <path d="M208 252C206 300 204 350 206 384" />
        <path d="M204 394C202 420 200 440 200 460" />
      </g>
    </g>
  );
}
