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
    aria-hidden="true"
    {...rest}
  />
);

export default Skeleton;
