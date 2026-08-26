/**
 * utils/safeCompare.ts
 * -----------------------------------------------------------------------------
 * A normal `===` comparison on strings can leak timing information (it
 * returns faster the earlier the strings differ), which an attacker can use
 * to guess a password one character at a time. crypto.timingSafeEqual takes
 * the same amount of time regardless of where the strings differ.
 * -----------------------------------------------------------------------------
 */

import crypto from "crypto";

export function safeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);

  // timingSafeEqual throws if buffers have different lengths, so pad/guard first.
  // This length check itself is fine to short-circuit on — length alone isn't
  // sensitive the way character-by-character content is.
  if (bufA.length !== bufB.length) {
    return false;
  }

  return crypto.timingSafeEqual(bufA, bufB);
}
