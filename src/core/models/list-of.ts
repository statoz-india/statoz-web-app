import { z } from "zod";

/**
 * A list that keeps the items it can read. An item that does not match is
 * left out and reported, so one record with, say, a status the app does not
 * know yet does not blank a whole screen.
 *
 * When every item fails, the list fails too: that is the schema being wrong,
 * not one bad record, and it must surface as an error rather than as an empty
 * screen.
 */
export function listOf<T extends z.ZodType>(item: T) {
  return z.array(z.unknown()).transform((items, ctx) => {
    const kept: z.output<T>[] = [];
    const failures: z.ZodError[] = [];
    for (const raw of items) {
      const result = item.safeParse(raw);
      if (result.success) kept.push(result.data);
      else failures.push(result.error);
    }

    if (failures.length > 0 && kept.length === 0) {
      ctx.addIssue({
        code: "custom",
        message: `None of the ${items.length} items matched. First failure:\n${z.prettifyError(failures[0])}`,
      });
      return z.NEVER;
    }
    for (const error of failures) {
      console.warn(
        `Left out a list item the app cannot read:\n${z.prettifyError(error)}`,
      );
    }
    return kept;
  });
}
