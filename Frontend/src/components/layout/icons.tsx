// Inline icons shared by several pages. They inherit the text colour.

type IconProps = { className?: string; strokeWidth?: number };

function Icon({
  className = "w-4 h-4",
  strokeWidth = 2,
  path,
}: IconProps & { path: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
}

export const CheckIcon = (props: IconProps) => (
  <Icon strokeWidth={2.5} {...props} path="M5 13l4 4L19 7" />
);

export const CloseIcon = (props: IconProps) => (
  <Icon {...props} path="M6 18L18 6M6 6l12 12" />
);

export const UploadIcon = (props: IconProps) => (
  <Icon
    {...props}
    path="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M12 12V4m0 0L8 8m4-4l4 4"
  />
);

export const ArrowRightIcon = (props: IconProps) => (
  <Icon {...props} path="M17 8l4 4m0 0l-4 4m4-4H3" />
);

export const ChevronDownIcon = (props: IconProps) => (
  <Icon strokeWidth={1.5} {...props} path="M19 9l-7 7-7-7" />
);
