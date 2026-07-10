import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import "./QuizPage.css";

function QuizPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes default timer

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const res = await api.get("/quizzes");
        const found = res.data.find((q) => q._id === id);
        if (!found) {
          toast.error("Quiz not found.");
          navigate("/dashboard");
          return;
        }
        setQuiz(found);
        // Pre-fill answers with empty strings
        setAnswers(new Array(found.questions.length).fill(""));
      } catch (err) {
        toast.error("Failed to load quiz details.");
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [id]);

  // Countdown timer effect
  useEffect(() => {
    if (loading || !quiz) return;
    if (timeLeft <= 0) {
      toast.error("Time's up! Automatic submission triggered.");
      submitQuiz(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, loading, quiz]);

  const selectOption = (questionIdx, optionText) => {
    setAnswers((prev) => {
      const nextAnswers = [...prev];
      nextAnswers[questionIdx] = optionText;
      return nextAnswers;
    });
  };

  const submitQuiz = async (forceAuto = false) => {
    // Validate that all questions are answered, unless automatically submitted
    if (!forceAuto && answers.some((ans) => ans === "")) {
      toast.error("Please answer all questions before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      // In forceAuto submit, map empty answers to blank/fallback strings so backend length check matches
      const finalAnswers = answers.map((ans) => ans || "Skipped/Unanswered");
      const res = await api.post(`/quizzes/${id}/attempt`, { answers: finalAnswers });
      toast.success(res.data.message || "Submitted successfully!");
      if (res.data.attemptId) {
        navigate(`/quizzes/attempt/${res.data.attemptId}`);
      } else {
        // Fallback: If for some reason attemptId is missing, return to dashboard
        navigate("/dashboard");
      }
    } catch (err) {
      toast.error(err.message || "Submission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-cyan-400">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent"></div>
      </div>
    );
  }

  if (!quiz) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeString = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;

  return (
    <div className="quiz-take-page flex flex-col gap-6">
      <div className="quiz-page-header glass-panel flex justify-between items-center w-full">
        <div className="flex flex-col gap-1">
          <h2 className="quiz-title">{quiz.title}</h2>
          <p className="quiz-desc text-muted">{quiz.description || "Answer all questions to complete the quiz."}</p>
        </div>

        <div className={`timer-badge flex flex-col items-center ${timeLeft < 60 ? "warning" : ""}`}>
          <span className="timer-label">Time Remaining</span>
          <span className="timer-value">{timeString}</span>
        </div>
      </div>

      <div className="questions-list flex flex-col gap-6">
        {quiz.questions.map((question, idx) => (
          <div key={question._id || idx} className="card glass-panel flex flex-col gap-4 question-card">
            <div className="question-header flex gap-3">
              <span className="question-index-tag">Q {idx + 1}</span>
              <h3 className="question-text">{question.questionText}</h3>
            </div>

            <div className="options-grid grid gap-3">
              {question.options.map((option, optIdx) => {
                const isSelected = answers[idx] === option;
                return (
                  <button
                    key={optIdx}
                    type="button"
                    className={`option-btn flex items-center justify-between text-left ${
                      isSelected ? "selected" : ""
                    }`}
                    onClick={() => selectOption(idx, option)}
                  >
                    <span>{option}</span>
                    <span className="indicator-circle"></span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="quiz-submit-action flex justify-end items-center" style={{ marginTop: "1rem" }}>
        <button
          className="btn btn-primary"
          type="button"
          disabled={submitting}
          onClick={() => submitQuiz(false)}
          style={{ padding: "0.8rem 2rem", fontSize: "1.05rem" }}
        >
          {submitting ? "Submitting Answers..." : "Submit Quiz Attempt ➔"}
        </button>
      </div>
    </div>
  );
}

export default QuizPage;
