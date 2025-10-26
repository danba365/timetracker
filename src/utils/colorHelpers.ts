export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

export const rgbToHex = (r: number, g: number, b: number): string => {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
};

export const getLightBackground = (hex: string): string => {
  const rgb = hexToRgb(hex);
  if (!rgb) return '#F5F5F5';
  
  // Create a light version by mixing with white
  const lighten = (value: number) => Math.round(value + (255 - value) * 0.9);
  
  return rgbToHex(lighten(rgb.r), lighten(rgb.g), lighten(rgb.b));
};

export const getContrastColor = (hex: string): 'light' | 'dark' => {
  const rgb = hexToRgb(hex);
  if (!rgb) return 'dark';
  
  // Calculate relative luminance
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  
  return luminance > 0.5 ? 'dark' : 'light';
};

export const defaultColors = [
  '#FF6B6B', // Red
  '#FFB84D', // Orange
  '#FFD93D', // Yellow
  '#6BCF7F', // Green
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#5F7CE1', // Indigo
  '#A55EEA', // Purple
  '#EC53B0', // Pink
  '#95A5A6', // Gray
];

