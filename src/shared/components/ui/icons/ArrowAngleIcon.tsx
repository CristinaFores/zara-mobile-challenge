interface ArrowAngleIconProps {
  width?: number
  height?: number
  className?: string
  fill?: string
  direction?: 'left' | 'right' | 'up' | 'down'
}

function ArrowAngleIcon({
  width = 20,
  height = 20,
  className = '',
  fill = 'currentColor',
  direction = 'left',
}: ArrowAngleIconProps) {
  const styleDirection = {
    left: 'rotate(0deg)',
    right: 'rotate(180deg)',
    down: 'rotate(270deg)',
    up: 'rotate(90deg)',
  }

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ transform: styleDirection[direction] }}
      className={className}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.8233 5.64645L12.5304 6.35356L8.88394 10L12.5304 13.6465L11.8233 14.3536L7.46973 10L11.8233 5.64645Z"
        fill={fill}
      />
    </svg>
  )
}

export default ArrowAngleIcon
