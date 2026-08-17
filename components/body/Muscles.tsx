"use client";

import { GEOMETRY } from "@/lib/anatomy/geometry";
import type { Sex } from "@/lib/anatomy/types";
import { Plate } from "./Plate";
import { Bilateral, Part } from "./primitives";

/**
 * Superficial musculature, anterior view.
 *
 * Shapes are drawn generously and then trimmed by the body clip path, so a
 * single set of muscles sits correctly inside both the wider male shoulders
 * and the wider female hips.
 */
export function Muscles({ sex }: { sex: Sex }) {
  const g = GEOMETRY[sex];

  return (
    <g className="layer-muscles has-plate">
      <Plate sex={sex} name="muscles" />
      {/* Deep connective tissue, so the gaps between muscles read as fascia
          rather than as holes in the body. Hidden when a 3D plate is painted. */}
      <g className="fascia-fill" fill="#4e2118" opacity="0.96">
        <path d={g.silhouette.torso} />
        <path d={g.silhouette.neck} />
        <path d={g.silhouette.head} />
        <Bilateral>
          <path d={g.silhouetteBilateral.arm} />
          <path d={g.silhouetteBilateral.leg} />
        </Bilateral>
      </g>

      {/* Deep structures that sit behind the superficial sheet. */}
      <Part id="diaphragm" className="muscle-deep">
        <path
          d="M150 332C168 310 194 302 210 302C226 302 252 310 270 332C252 350 230 358 210 358C190 358 168 350 150 332Z"
          fill="#8a463a"
          opacity="0.55"
        />
        <path
          d="M150 332C168 314 194 306 210 306C226 306 252 314 270 332"
          fill="none"
          stroke="#c98476"
          strokeWidth="1.6"
          opacity="0.6"
        />
      </Part>

      {/* ── Head and neck ── */}
      <Part id="facial-muscles">
        <path
          d="M210 34C232 34 250 52 252 76C254 96 250 112 244 124L210 128L176 124C170 112 166 96 168 76C170 52 188 34 210 34Z"
          fill="#a8402f"
          opacity="0.75"
        />
        <Bilateral>
          <path
            d="M172 96C166 108 168 126 176 138C184 148 192 150 198 146C196 132 188 116 182 100Z"
            fill="url(#muscleRound)"
          />
        </Bilateral>
        <g
          fill="none"
          stroke="#7d2418"
          strokeWidth="1.1"
          opacity="0.75"
          strokeLinecap="round"
        >
          {[42, 52, 62, 72].map((y) => (
            <path key={y} d={`M180 ${y + 12}C192 ${y} 228 ${y} 240 ${y + 12}`} />
          ))}
        </g>
        <ellipse cx="193" cy="96" rx="12" ry="8" fill="#8e2318" opacity="0.9" />
        <ellipse cx="227" cy="96" rx="12" ry="8" fill="#8e2318" opacity="0.9" />
        <ellipse cx="210" cy="138" rx="15" ry="8" fill="#8e2318" opacity="0.9" />
      </Part>

      <Part id="sternocleidomastoid">
        <Bilateral>
          <path
            d="M188 152C182 168 186 186 196 198C202 202 208 200 209 194C204 184 198 170 199 154C196 150 191 149 188 152Z"
            fill="url(#muscleRound)"
          />
        </Bilateral>
      </Part>

      <Part id="trapezius">
        <Bilateral>
          <path
            d="M202 190C184 194 162 202 144 216C136 222 138 232 148 232C166 222 186 214 202 210Z"
            fill="url(#muscleDeep)"
          />
        </Bilateral>
      </Part>

      {/* ── Shoulder and arm ── */}
      <Part id="deltoid">
        <Bilateral>
          <path
            d="M164 200C140 204 118 218 110 242C104 264 108 288 116 302C126 308 138 302 143 290C150 262 156 228 166 206Z"
            fill="url(#muscleRound)"
          />
          <path
            d="M150 224C142 244 138 268 138 290"
            fill="none"
            stroke="#6e1c14"
            strokeWidth="1.4"
            opacity="0.7"
          />
        </Bilateral>
      </Part>

      <Part id="pectoralis-major">
        <Bilateral>
          <path
            d="M206 210C186 212 166 218 154 230C143 241 141 256 148 268C160 292 180 310 206 320Z"
            fill="url(#muscleRound)"
          />
          <g fill="none" stroke="#6e1c14" strokeWidth="1.2" opacity="0.6">
            <path d="M200 222C182 232 166 246 156 262" />
            <path d="M202 244C188 254 176 268 168 282" />
            <path d="M204 268C194 278 186 290 180 302" />
          </g>
        </Bilateral>
      </Part>

      <Part id="serratus">
        <Bilateral>
          {[
            "M150 274C158 280 164 290 168 300L156 302C150 294 146 284 146 276Z",
            "M154 292C162 298 168 308 172 318L160 320C154 312 150 302 150 294Z",
            "M160 310C168 316 174 326 178 336L166 338C160 330 156 320 156 312Z",
          ].map((d, i) => (
            <path key={i} d={d} fill="#a8402f" opacity="0.9" />
          ))}
        </Bilateral>
      </Part>

      <Part id="biceps">
        <Bilateral>
          <path
            d="M124 248C113 264 109 288 111 316C113 344 119 366 127 378C135 381 141 373 141 361C141 331 139 296 137 268C135 255 130 246 124 248Z"
            fill="url(#muscleRound)"
          />
          <path
            d="M129 268C127 300 128 336 132 366"
            fill="none"
            stroke="#e28a76"
            strokeWidth="1.2"
            opacity="0.35"
          />
        </Bilateral>
      </Part>

      <Part id="triceps">
        <Bilateral>
          <path
            d="M110 258C101 278 99 310 101 340C103 362 107 376 111 386C117 386 121 378 121 368C119 338 117 300 119 272Z"
            fill="url(#muscleDeep)"
          />
        </Bilateral>
      </Part>

      <Part id="forearm-flexors">
        <Bilateral>
          <path
            d="M110 384C101 406 96 436 96 462C96 479 100 491 106 500C117 502 127 496 133 486C139 469 141 442 139 418C137 400 131 389 123 384Z"
            fill="url(#muscleRound)"
          />
          <g fill="none" stroke="#6e1c14" strokeWidth="1.1" opacity="0.55">
            <path d="M112 396C108 424 106 456 108 486" />
            <path d="M126 396C126 424 128 456 126 484" />
          </g>
          {/* Long tendons crossing the wrist to the fingers. */}
          <g fill="none" stroke="url(#tendon)" strokeWidth="2.6" strokeLinecap="round">
            <path d="M108 498C110 516 112 534 114 546" />
            <path d="M118 498C120 516 122 534 124 546" />
            <path d="M128 496C130 512 132 528 132 540" />
          </g>
        </Bilateral>
      </Part>

      {/* ── Trunk ── */}
      <Part id="rectus-abdominis">
        <Bilateral>
          <path
            d="M184 320C181 358 181 410 185 450C189 463 197 470 207 470L207 320Z"
            fill="url(#muscleRound)"
          />
          <g fill="none" stroke="#5e1810" strokeWidth="2" opacity="0.85">
            <path d="M183 356L207 356" />
            <path d="M182 392L207 392" />
            <path d="M184 424L207 424" />
          </g>
        </Bilateral>
        <path d="M209 318L211 318L211 470L209 470Z" fill="url(#tendon)" opacity="0.8" />
      </Part>

      <Part id="external-oblique">
        <Bilateral>
          <path
            d="M172 288C159 298 151 320 149 346C147 371 151 400 159 424C167 439 178 447 189 451L187 402C180 381 176 350 178 318Z"
            fill="url(#muscleDeep)"
          />
          <g fill="none" stroke="#8e2318" strokeWidth="1.1" opacity="0.6">
            <path d="M160 306C158 336 160 372 168 404" />
            <path d="M172 302C170 334 172 370 180 404" />
          </g>
        </Bilateral>
      </Part>

      {/* ── Hip and leg ── */}
      <Part id="gluteus">
        <Bilateral>
          <path
            d="M150 420C136 431 129 449 129 468C129 486 136 498 147 505C158 503 166 492 170 477C172 458 167 436 158 423Z"
            fill="url(#muscleDeep)"
          />
        </Bilateral>
      </Part>

      <Part id="quadriceps">
        <Bilateral>
          {/* Vastus lateralis */}
          <path
            d="M138 484C127 519 125 566 129 606C133 641 141 665 149 678C157 676 161 663 159 647C155 610 153 560 153 519C151 499 146 486 138 484Z"
            fill="url(#muscleRound)"
          />
          {/* Rectus femoris */}
          <path
            d="M160 478C153 519 153 570 157 613C161 645 167 665 175 678C183 676 187 661 185 645C181 606 179 556 177 515C175 493 170 478 160 478Z"
            fill="url(#muscleRound)"
          />
          {/* Vastus medialis */}
          <path
            d="M184 566C177 597 177 631 183 660C189 677 197 685 203 683C207 672 207 651 203 629C199 604 194 581 188 566Z"
            fill="url(#muscleRound)"
          />
          <g fill="none" stroke="#6e1c14" strokeWidth="1.4" opacity="0.65">
            <path d="M156 500C152 552 152 618 160 668" />
            <path d="M180 498C178 552 180 618 186 664" />
          </g>
          {/* Quadriceps tendon over the kneecap. */}
          <path
            d="M156 672C166 668 186 668 196 674C196 690 190 700 176 702C162 702 156 692 156 672Z"
            fill="url(#tendon)"
            opacity="0.9"
          />
        </Bilateral>
      </Part>

      <Part id="adductors">
        <Bilateral>
          <path
            d="M198 476C189 500 185 530 187 560C189 583 195 599 201 608L207 606L207 476Z"
            fill="url(#muscleDeep)"
          />
        </Bilateral>
      </Part>

      <Part id="sartorius">
        <Bilateral>
          <path
            d="M152 462C160 502 170 548 180 590C188 624 192 654 195 676"
            fill="none"
            stroke="#c2483a"
            strokeWidth="9"
            strokeLinecap="round"
          />
          <path
            d="M152 462C160 502 170 548 180 590C188 624 192 654 195 676"
            fill="none"
            stroke="#e07a67"
            strokeWidth="2.4"
            strokeLinecap="round"
            opacity="0.5"
          />
        </Bilateral>
      </Part>

      <Part id="gastrocnemius">
        <Bilateral>
          <path
            d="M144 698C135 724 133 762 138 796C142 822 149 838 158 844C164 840 166 826 164 806C160 772 156 736 154 710Z"
            fill="url(#muscleRound)"
          />
          <path
            d="M182 698C190 724 194 762 190 796C187 822 181 838 172 844C166 840 164 826 166 806C170 772 174 736 176 710Z"
            fill="url(#muscleRound)"
          />
          {/* Achilles tendon */}
          <path
            d="M160 848C158 872 157 894 158 910L172 910C173 894 172 872 170 848Z"
            fill="url(#tendon)"
          />
        </Bilateral>
      </Part>

      <Part id="tibialis-anterior">
        <Bilateral>
          <path
            d="M158 698C152 728 151 770 153 810C155 841 159 868 163 886C170 890 176 883 176 870C174 831 172 780 172 740C170 716 165 700 158 698Z"
            fill="#c2483a"
          />
          <path
            d="M163 730C161 776 162 834 166 878"
            fill="none"
            stroke="#e8a08c"
            strokeWidth="1.4"
            opacity="0.4"
          />
          {/* Subcutaneous border of the shin bone. */}
          <path
            d="M180 706C184 760 186 830 184 886"
            fill="none"
            stroke="#e6dcc0"
            strokeWidth="2.4"
            opacity="0.55"
            strokeLinecap="round"
          />
        </Bilateral>
      </Part>

      {/* Foot extensor tendons. */}
      <g fill="none" stroke="url(#tendon)" strokeWidth="2.2" strokeLinecap="round">
        <Bilateral>
          <path d="M166 900C170 918 178 934 188 944" />
          <path d="M174 902C178 918 186 932 194 940" />
        </Bilateral>
      </g>
    </g>
  );
}
