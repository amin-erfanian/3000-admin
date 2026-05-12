export const blendColors = (baseColor, overlayColor) => {
  const base = parseColor(baseColor);
  const overlay = parseColor(overlayColor);

  const alpha = overlay.a + base.a * (1 - overlay.a);

  const r = Math.round(
    (overlay.r * overlay.a + base.r * base.a * (1 - overlay.a)) / alpha,
  );
  const g = Math.round(
    (overlay.g * overlay.a + base.g * base.a * (1 - overlay.a)) / alpha,
  );
  const b = Math.round(
    (overlay.b * overlay.a + base.b * base.a * (1 - overlay.a)) / alpha,
  );

  return rgbToHex(r, g, b);
};

// Parse a color string (hex or rgb/rgba) into {r, g, b, a}
export const parseColor = (color) => {
  color = color.trim();

  // HEX
  if (color.startsWith('#')) {
    let c = color.slice(1);
    if (c.length === 3)
      c = c
        .split('')
        .map((ch) => ch + ch)
        .join('');
    if (c.length === 6) c += 'FF'; // assume full opacity
    const num = parseInt(c, 16);
    return {
      r: (num >> 24) & 255,
      g: (num >> 16) & 255,
      b: (num >> 8) & 255,
      a: (num & 255) / 255,
    };
  }

  // RGB / RGBA
  const rgbaMatch = color.match(
    /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/i,
  );
  if (rgbaMatch) {
    return {
      r: parseInt(rgbaMatch[1], 10),
      g: parseInt(rgbaMatch[2], 10),
      b: parseInt(rgbaMatch[3], 10),
      a: rgbaMatch[4] !== undefined ? parseFloat(rgbaMatch[4]) : 1,
    };
  }

  throw new Error(`Unsupported color format: ${color}`);
};

// Convert RGB to hex string
export const rgbToHex = (r, g, b) => {
  return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');
};
