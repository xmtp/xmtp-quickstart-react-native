// @ts-nocheck
import { Buffer } from "buffer";

window.global = window.global ?? window;
window.Buffer = window.Buffer ?? Buffer;
window.process = window.process ?? { env: {} }; // Minimal process polyfill

// Polyfill utf16le on window
//
// This is a workaround for a bug in react-native-webview that causes
// utf16le to be undefined on window. This is a temporary workaround until
// the bug is fixed upstream.
const mask = [0, 1, 3, 7, 15, 31, 63, 127, 255, 511, 1023];
window.utf16le = window.utf16le ?? {
  encode(chars) {
    const bytes = [];
    let char;
    let h;
    let l;
    for (let i = 0; i < chars.length; i += 1) {
      char = chars[i];
      if ((char >= 0 && char <= 0xd7ff) || (char >= 0xe000 && char <= 0xffff)) {
        bytes.push(char & mask[8]);
        bytes.push((char >> 8) & mask[8]);
      } else if (char >= 0x10000 && char <= 0x10ffff) {
        l = char - 0x10000;
        h = 0xd800 + (l >> 10);
        l = 0xdc00 + (l & mask[10]);
        bytes.push(h & mask[8]);
        bytes.push((h >> 8) & mask[8]);
        bytes.push(l & mask[8]);
        bytes.push((l >> 8) & mask[8]);
      } else {
        throw new RangeError(
          `utf16le.encode: UTF16LE value out of range: char[${i}]: ${char}`
        );
      }
    }
    return Buffer.from(bytes);
  },
  decode(buf, bom) {
    /* assumes caller has insured that buf is a Buffer of bytes */
    if (buf.length % 2 > 0) {
      throw new RangeError(
        `utf16le.decode: data length must be even multiple of 2: length: ${buf.length}`
      );
    }
    const chars = [];
    const len = buf.length;
    let i = bom ? 2 : 0;
    let j = 0;
    let c;
    let inc;
    let i1;
    let i3;
    let high;
    let low;
    while (i < len) {
      const TRUE = true;
      while (TRUE) {
        i1 = i + 1;
        if (i1 < len) {
          high = (buf[i1] << 8) + buf[i];
          if (high < 0xd800 || high > 0xdfff) {
            c = high;
            inc = 2;
            break;
          }
          i3 = i + 3;
          if (i3 < len) {
            low = (buf[i3] << 8) + buf[i + 2];
            if (high <= 0xdbff && low >= 0xdc00 && low <= 0xdfff) {
              c = 0x10000 + ((high - 0xd800) << 10) + (low - 0xdc00);
              inc = 4;
              break;
            }
          }
        }
        /* if we fall through to here, it is an ill-formed sequence */
        throw new RangeError(
          `utf16le.decode: ill-formed UTF16LE byte sequence found: byte[${i}]`
        );
      }
      chars[j++] = c;
      i += inc;
    }
    return chars;
  },
};

export {};
