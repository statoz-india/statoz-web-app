import { Suspense } from "react";

import { QuizDetailScreen } from "@/features/quizzes/screens/QuizDetailScreen";

export default function QuizPage() {
  return (
    <Suspense fallback={null}>
      <QuizDetailScreen />
    </Suspense>
  );
}
