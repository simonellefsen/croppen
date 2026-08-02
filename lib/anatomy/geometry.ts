import type { Sex } from "./types";

/**
 * All artwork lives in a 420 × 1000 viewBox with the midline at x = 210.
 *
 * This is an ANTERIOR (front) view, so the subject's right side is drawn on
 * the LEFT of the image. Bilateral parts are authored once for the subject's
 * right and mirrored with `MIRROR`.
 */
export const VIEW = { w: 420, h: 1000, mid: 210 } as const;

/** Transform that reflects a group across the midline. */
export const MIRROR = `translate(${VIEW.w}, 0) scale(-1, 1)`;

export type BodyGeometry = {
  /** Unioned silhouette parts. Also used as the clip path for inner layers. */
  silhouette: { head: string; neck: string; torso: string };
  /** Bilateral silhouette parts (drawn twice). */
  silhouetteBilateral: { arm: string; leg: string };
  /** Vertical landmarks shared by every layer. */
  landmarks: {
    shoulderY: number;
    armpitY: number;
    waistY: number;
    hipY: number;
    crotchY: number;
  };
  /** Half-widths at key heights, so inner layers can scale with the body. */
  halfWidth: { shoulder: number; chest: number; waist: number; hip: number };
};

const female: BodyGeometry = {
  silhouette: {
    head: "M210 30C236 30 252 46 254 74C256 96 252 112 246 124C240 141 226 157 210 157C194 157 180 141 174 124C168 112 164 96 166 74C168 46 184 30 210 30Z",
    neck: "M188 142C188 168 190 182 196 196L224 196C230 182 232 168 232 142Z",
    torso:
      "M186 188C160 194 132 202 120 222C128 244 136 256 140 272C146 306 152 340 154 370C146 400 130 428 130 452C132 476 142 492 156 502L264 502C278 492 288 476 290 452C290 428 274 400 266 370C268 340 274 306 280 272C284 256 292 244 300 222C288 202 260 194 234 188Z",
  },
  silhouetteBilateral: {
    arm: "M126 214C108 226 100 254 100 286C100 320 104 356 108 386C104 410 100 442 98 470C96 486 96 496 100 506C104 520 108 540 112 548C118 553 126 551 130 542C134 530 138 516 140 506C144 496 146 486 144 472C142 442 140 410 138 386C140 356 142 320 142 288C142 260 148 240 154 224Z",
    leg: "M134 452C126 496 124 540 128 580C132 622 138 656 142 682C140 712 142 744 148 774C152 812 154 862 154 902C154 926 150 944 152 954C158 964 182 966 196 960C202 956 202 942 198 926C194 914 190 906 188 900C188 862 190 812 192 774C194 744 196 712 194 682C196 656 198 622 200 580C202 540 204 500 206 474Z",
  },
  landmarks: { shoulderY: 218, armpitY: 266, waistY: 370, hipY: 452, crotchY: 480 },
  halfWidth: { shoulder: 90, chest: 72, waist: 56, hip: 80 },
};

const male: BodyGeometry = {
  silhouette: {
    head: "M210 28C238 28 255 45 257 74C259 97 255 113 249 125C243 142 227 158 210 158C193 158 177 142 171 125C165 113 161 97 163 74C165 45 182 28 210 28Z",
    neck: "M186 140C186 167 188 182 194 196L226 196C232 182 234 167 234 140Z",
    torso:
      "M184 188C156 194 122 202 108 224C118 246 126 258 130 274C136 304 142 336 146 368C142 396 138 424 140 452C142 476 150 492 162 502L258 502C270 492 278 476 280 452C282 424 278 396 274 368C278 336 284 304 290 274C294 258 302 246 312 224C298 202 264 194 236 188Z",
  },
  silhouetteBilateral: {
    arm: "M116 216C96 230 88 256 88 288C88 322 92 358 96 388C92 412 88 444 86 472C84 488 84 498 88 508C92 522 96 542 100 550C106 555 116 553 120 544C124 532 128 518 130 508C134 498 136 488 134 474C132 444 130 412 128 388C130 358 134 322 134 290C134 262 140 242 148 226Z",
    leg: "M142 452C132 496 130 540 132 580C136 622 142 656 146 682C144 712 146 744 152 774C156 812 158 862 158 902C158 926 154 944 156 954C162 964 186 966 200 960C206 956 206 942 202 926C198 914 194 906 192 900C192 862 194 812 196 774C198 744 200 712 198 682C200 656 202 622 204 580C206 540 208 500 208 474Z",
  },
  landmarks: { shoulderY: 220, armpitY: 268, waistY: 368, hipY: 452, crotchY: 480 },
  halfWidth: { shoulder: 102, chest: 80, waist: 64, hip: 70 },
};

export const GEOMETRY: Record<Sex, BodyGeometry> = { female, male };

/** Mirrors an x coordinate across the midline. */
export function mx(x: number): number {
  return VIEW.w - x;
}
