import type { ReactNode } from "react";

interface IconProps {
  className?: string;
  strokeWidth?: number;
}

function StrokeIcon({
  className = "w-4 h-4",
  strokeWidth = 2,
  children,
}: IconProps & { children: ReactNode }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} viewBox="0 0 24 24" aria-hidden>
      {children}
    </svg>
  );
}

function iconPath(d: string, defaultStrokeWidth = 2) {
  function Icon({ strokeWidth = defaultStrokeWidth, ...props }: IconProps) {
    return (
      <StrokeIcon strokeWidth={strokeWidth} {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d={d} />
      </StrokeIcon>
    );
  }
  return Icon;
}

export const CheckIcon = iconPath("M5 13l4 4L19 7", 2.5);
export const CloseIcon = iconPath("M6 18L18 6M6 6l12 12");
export const MenuIcon = iconPath("M4 6h16M4 12h16M4 18h10", 1.5);
export const UploadIcon = iconPath("M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M12 12V4m0 0L8 8m4-4l4 4");
export const ArrowRightIcon = iconPath("M17 8l4 4m0 0l-4 4m4-4H3");
export const ChevronDownIcon = iconPath("M19 9l-7 7-7-7", 1.5);
export const SendIcon = iconPath(
  "M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
);
