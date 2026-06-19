interface CartIconProps {
  readonly width?: number
  readonly height?: number
  readonly className?: string
  readonly mode?: 'full' | 'empty'
  readonly fill?: string
  readonly 'aria-hidden'?: boolean | 'true' | 'false'
}

const ICON_PATHS: Record<NonNullable<CartIconProps['mode']>, string> = {
  full: 'M8.47059 0H3.76471V3.76471H0V16H12.2353V3.76471H8.47059V0ZM7.52941 3.76471V7.05882H8.47059V3.76471H7.52941ZM4.70588 3.76471V7.05882H3.76471V3.76471H4.70588ZM4.70588 3.76471H7.52941V0.941176H4.70588V3.76471Z',
  empty:
    'M8.47059 0H3.76471V3.76471H0V16H12.2353V3.76471H8.47059V0ZM7.52941 4.70588V7.05882H8.47059V4.70588H11.2941V15.0588H0.941176V4.70588H3.76471V7.05882H4.70588V4.70588H7.52941ZM7.52941 3.76471V0.941176H4.70588V3.76471H7.52941Z',
}

function CartIcon({
  width = 13,
  height = 16,
  className = '',
  mode = 'empty',
  fill = 'black',
  'aria-hidden': ariaHidden,
}: CartIconProps) {
  return (
    <svg
      width={width}
      height={height}
      className={className}
      viewBox="0 0 13 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden={ariaHidden}
    >
      <path fillRule="evenodd" clipRule="evenodd" d={ICON_PATHS[mode]} fill={fill} />
    </svg>
  )
}

export default CartIcon
