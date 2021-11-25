import is from 'ramda/src/is';

// https://stackoverflow.com/a/5624139
export const hexToRgb = hex => {
  if (!is(String, hex)) return null;
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const fullLengthHex = hex.replace(
    shorthandRegex,
    (m, r, g, b) => r + r + g + g + b + b,
  );

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(
    fullLengthHex,
  );
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      ]
    : null;
};

export const rgbToHex = ([r, g, b]) =>
  `#${[r, g, b]
    .map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? `0${hex}` : hex;
    })
    .join('')}`;

// Relative Luminance is used to calculate contrast ratios
// https://www.w3.org/TR/WCAG20-TECHS/G17.html
export const getRelativeLuminance = components => {
  // Normalise gammas from a 0-255 range to a 0-1 range
  const componentGamma = x => x / 255;

  // Calculate the individual luminance of each colour channel
  // There is a different formula depending on whether the initial
  // gamma values are above or below 0.03928
  const lowGammaLuminance = x => x / 12.92;
  const highGammaLuminance = x => ((x + 0.055) / 1.055) ** 2.4;
  const componentLuminance = x =>
    x < 0.03928 ? lowGammaLuminance(x) : highGammaLuminance(x);

  // Each colour channel is weighted differently
  const applyCoefficients = (x, i) => x * [0.2126, 0.7152, 0.0722][i];

  const [r, g, b] = components
    .map(componentGamma)
    .map(componentLuminance)
    .map(applyCoefficients);

  // Combine the R, G and B channels into a single numeric result
  return r + g + b;
};

export const contrastRatioFromLuminances = (l1, l2) =>
  (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

export const selectColour = ({
  palette,
  minimumContrast,
  contrastColour,
  fallbackColour,
}) => {
  try {
    if (minimumContrast <= 0)
      return {
        rgb: palette[0],
        hex: rgbToHex(palette[0]),
      };

    const contrastColourLuminance = getRelativeLuminance(
      hexToRgb(contrastColour),
    );

    const hasSufficientContrast = colour => {
      return (
        contrastRatioFromLuminances(
          contrastColourLuminance,
          getRelativeLuminance(colour),
        ) >= minimumContrast
      );
    };

    const selectedColour = palette.find(color => hasSufficientContrast(color));

    return {
      rgb: selectedColour,
      hex: rgbToHex(selectedColour),
    };
  } catch (e) {
    return {
      isFallback: true,
      hex: fallbackColour,
      rgb: hexToRgb(fallbackColour),
    };
  }
};
