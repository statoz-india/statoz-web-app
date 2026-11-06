"use client";

import { useId, type CSSProperties, type InputHTMLAttributes } from "react";

export type InputFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "className" | "id" | "aria-describedby" | "aria-invalid"
> & {
  label: string;
  /** Keeps the label for assistive technology but takes it off the surface. */
  hideLabel?: boolean;
  /** Standing guidance, shown while the field is valid. */
  hint?: string;
  /** Replaces the hint and turns the field red. */
  error?: string;
  /** CSS color for the focused edge. */
  accent?: string;
  className?: string;
};

const clip: CSSProperties = { clipPath: "var(--ds-clip-field)" };

/**
 * A chamfered text field. The edge is a painted layer rather than a border,
 * since the clip path would crop one away, and it takes the accent on focus in
 * place of the global focus outline, which the same clip would square off.
 */
export function InputField({
  label,
  hideLabel = false,
  hint,
  error,
  accent = "var(--ds-color-accent-cyan)",
  className,
  ...input
}: InputFieldProps) {
  const id = useId();
  const messageId = `${id}-message`;
  const message = error ?? hint;
  const tint = error ? "var(--ds-color-danger)" : accent;

  const style = {
    "--field-accent": tint,
    "--field-rest": error
      ? `color-mix(in srgb, ${tint} 70%, transparent)`
      : "var(--ds-color-border-muted)",
  } as CSSProperties;

  return (
    <div
      className={["flex flex-col gap-2", className ?? ""]
        .filter(Boolean)
        .join(" ")}
    >
      <label
        htmlFor={id}
        className={[
          "text-md font-medium text-subtle",
          hideLabel ? "sr-only" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {label}
      </label>

      <div className="group relative" style={style}>
        <span
          aria-hidden
          className="absolute inset-0 bg-(--field-rest) transition-colors duration-150 group-focus-within:bg-(--field-accent)"
          style={clip}
        />
        <span
          aria-hidden
          className="absolute inset-px transition-[inset] duration-150 group-focus-within:inset-0.5"
          style={{ ...clip, background: "var(--ds-color-background-muted)" }}
        />
        <input
          data-ds-input-field
          id={id}
          aria-describedby={message ? messageId : undefined}
          aria-invalid={error ? true : undefined}
          className="relative h-13 w-full bg-transparent px-4 text-base text-foreground outline-none placeholder:text-disabled focus-visible:outline-none"
          {...input}
        />
      </div>

      {message ? (
        <p
          id={messageId}
          role={error ? "alert" : undefined}
          className={["text-xs", error ? "text-danger" : "text-muted"].join(
            " ",
          )}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
