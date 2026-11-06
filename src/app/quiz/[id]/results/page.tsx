import { Suspense } from "react";

import { QuizResultsScreen } from "@/features/quizzes/screens/QuizResultsScreen";

export default function QuizResultsPage() {
  return (
    <Suspense fallback={null}>
      <QuizResultsScreen />
    </Suspense>
  );
}
