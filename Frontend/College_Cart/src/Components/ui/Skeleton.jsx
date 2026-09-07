/**
 * Drop-in replacement for @mui/material's Skeleton.
 *
 * Skeleton and Box were the app's only use of MUI, yet importing them pulled the
 * MUI runtime plus Emotion's style engine into the build as a ~76 kB chunk. The
 * shimmer here is pure CSS (.cc-skeleton in index.css), so it costs nothing
 * beyond the markup and animates entirely on the compositor.
 *
 * The `variant` / `width` / `height` prop shape matches the MUI API it replaces
 * so existing call sites read unchanged. A minimal `sx` shim is included for the
 * handful of places that set a background or radius that way.
 */
const VARIANT_CLASS = {
  text: 'cc-skeleton--text',
  circular: 'cc-skeleton--circle',
  rectangular: '',
};

const toCssSize = (value) => (typeof value === 'number' ? `${value}px` : value);

const Skeleton = ({
  variant = 'text',
  width,
  height,
  className = '',
  style,
  radius,
  // Accepted and translated rather than spread onto the element, which would
  // otherwise reach the DOM as an unknown `sx` attribute.
  sx,
  ...rest
}) => (
  <span
    className={`cc-skeleton ${VARIANT_CLASS[variant] ?? ''} ${className}`.trim()}
    style={{
      width: toCssSize(width),
      height: toCssSize(height),
      borderRadius: toCssSize(radius ?? sx?.borderRadius),
      backgroundColor: sx?.bgcolor ?? sx?.backgroundColor,
      ...style,
    }}
    // Decorative placeholder: kept out of the accessibility tree so screen
    // readers announce the surrounding region's busy state instead.
    aria-hidden="true"
    {...rest}
  />
);

export default Skeleton;
