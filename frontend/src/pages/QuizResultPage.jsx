import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import "./QuizResultPage.css";

function QuizResultPage() {
  const { attemptId } = useParams();
  const navigate = useNavigate();

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/quizzes/attempt/${attemptId}`);
        setResult(res.data);
      } catch (err) {
        toast.error("Failed to load attempt details.");
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [attemptId]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-cyan-400">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent"></div>
      </div>
    );
  }

  if (!result) return null;

  const passed = result.percentage >= 60;

  return (
    <div className="quiz-result-page flex flex-col gap-6">
      <div className="result-header glass-panel flex flex-col items-center text-center gap-4">
        <span className="badge-emoji" style={{ fontSize: "3.5rem" }}>
          {passed ? "🎉" : "💪"}
        </span>

        <div className="flex flex-col gap-1">
          <h2 className={`score-verdict ${passed ? "pass" : "fail"}`}>
            {passed ? "Pass! Well Done." : "Keep Practicing!"}
          </h2>
          <p className="text-muted">
            You scored {result.score} out of {result.totalQuestions} questions correctly.
          </p>
        </div>

        <div className="score-charts flex items-center justify-center gap-12" style={{ margin: "1rem 0" }}>
          <div className="metric-box flex flex-col">
            <span className="metric-val">{result.percentage}%</span>
            <span className="metric-lbl">Total Score</span>
          </div>
          <div className="metric-box flex flex-col">
            <span className="metric-val">
              {result.score}/{result.totalQuestions}
            </span>
            <span className="metric-lbl">Correct Answers</span>
          </div>
        </div>

        <button className="btn btn-primary" onClick={() => navigate("/dashboard")}>
          Return to Dashboard
        </button>
      </div>

      <h3 className="section-title">Attempt Review</h3>

      <div className="results-review-list flex flex-col gap-6">
        {result.results.map((item, idx) => (
          <div
            key={idx}
            className={`card glass-panel flex flex-col gap-4 review-card ${
              item.isCorrect ? "correct-border" : "incorrect-border"
            }`}
          >
            <div className="flex justify-between items-start gap-4">
              <div className="flex gap-3">
                <span className={`question-index-tag ${item.isCorrect ? "correct" : "incorrect"}`}>
                  Q {idx + 1}
                </span>
                <h4 className="question-text">{item.questionText}</h4>
              </div>
              <span className={`badge-verdict ${item.isCorrect ? "correct" : "incorrect"}`}>
                {item.isCorrect ? "✓ Correct" : "✗ Incorrect"}
              </span>
            </div>

            <div className="options-stack flex flex-col gap-2">
              {item.options.map((option, optIdx) => {
                const isStudentChoice = item.studentAnswer === option;
                const isCorrectChoice = item.correctAnswer === option;

                let optionStateClass = "";
                if (isCorrectChoice) {
                  optionStateClass = "correct-choice";
                } else if (isStudentChoice && !item.isCorrect) {
                  optionStateClass = "incorrect-choice";
                }

                return (
                  <div
                    key={optIdx}
                    className={`option-row flex justify-between items-center ${optionStateClass}`}
                  >
                    <span>{option}</span>
                    <div className="flex items-center gap-2">
                      {isCorrectChoice && <span className="row-tag correct-label">Correct Option</span>}
                      {isStudentChoice && (
                        <span className={`row-tag ${item.isCorrect ? "correct-choice-label" : "incorrect-choice-label"}`}>
                          Your Choice
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default QuizResultPage;
