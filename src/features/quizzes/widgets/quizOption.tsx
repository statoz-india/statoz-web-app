import { CheckIcon, CloseIcon } from "@/lib/icons";

import type { OptionState } from "../adapters";
import styles from "../css/quizDetail.module.css";

/** An option's letter box, label and verdict mark; the row around it sets `data-state`. */
export function OptionFace({
  letter,
  label,
  state,
}: {
  letter: string;
  label: string;
  state: OptionState | undefined;
}) {
  return (
    <>
      <span
        className={`${styles.letter} grid size-7 shrink-0 place-items-center font-display text-sm font-black`}
      >
        {letter}
      </span>
      <span
        className={`${styles.label} min-w-0 flex-1 font-display text-option font-black tracking-label uppercase`}
      >
        {label}
      </span>
      {state === "correct" ? (
        <CheckIcon size={18} className="shrink-0 text-success" />
      ) : state === "wrong" ? (
        <CloseIcon size={18} className="shrink-0 text-danger" />
      ) : null}
    </>
  );
}
