"use client";

type Props = {
  text: string;
  active?: boolean;
  className?: string;
};

export default function StreamingText({
  text,
  active = false,
  className,
}: Props) {
  return (
    <span className={className}>
      {text}
      {active && <span className="tl-caret" aria-hidden />}
    </span>
  );
}
