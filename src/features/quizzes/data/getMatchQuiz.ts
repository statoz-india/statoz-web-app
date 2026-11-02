import { dataOrThrow, getMatchQuizzes } from "@/core";
import { useResource } from "@/hooks/useResource";

/**
 * A match's quizzes, by its readable id such as "EPL-M23". A match with no
 * quiz is `[]`.
 */
export function useMatchQuizzes(matchId: string) {
  return useResource({
    key: `quiz/match/${matchId}`,
    load: () =>
      getMatchQuizzes(matchId).then((result) => dataOrThrow(result, [])),
  });
}
