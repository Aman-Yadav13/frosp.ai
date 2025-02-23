import { FaNodeJs, FaPython } from "react-icons/fa";

export const getLanguageIcon = (language: string) => {
  switch (language) {
    case "nodejs":
      return FaNodeJs;
    case "python":
      return FaPython;
  }
};

export const getLanguageStyles = (language: string) => {
  switch (language) {
    case "nodejs":
      return "text-green-500 bg-transparent h-5 w-5";
    case "python":
      return "text-yellow-500 bg-transparent h-5 w-5";
  }
};

// Converts HSL values to a hex string.
function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0,
    g = 0,
    b = 0;

  if (h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (h < 300) {
    r = x;
    g = 0;
    b = c;
  } else {
    r = c;
    g = 0;
    b = x;
  }

  const toHex = (n: number) => {
    const hex = Math.round((n + m) * 255).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export const getRandomColor = (): string => {
  const colorRanges: { [key: string]: [number, number] } = {
    green: [90, 140],
    emerald: [140, 160],
    cyan: [180, 210],
    purple: [260, 290],
    pink: [300, 330],
    blue: [210, 240],
  };

  const colorTypes = Object.keys(colorRanges);
  const randomType = colorTypes[Math.floor(Math.random() * colorTypes.length)];
  const [minHue, maxHue] = colorRanges[randomType];

  const hue = Math.floor(Math.random() * (maxHue - minHue + 1)) + minHue;

  const saturation = Math.floor(Math.random() * (91 - 70)) + 70;
  const lightness = Math.floor(Math.random() * (61 - 50)) + 50;

  return hslToHex(hue, saturation, lightness);
};
