import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import "./CreateQuiz.css";

function CreateQuiz() {
  const { id } = useParams(); // courseId
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(id || "");
  const [loadingCourses, setLoadingCourses] = useState(!id);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState([
    {
      questionText: "",
      options: ["", "", "", ""],
      correctAnswerIndex: 0,
    },
  ]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) {
      const fetchCourses = async () => {
        try {
          const res = await api.get("/courses/my");
          setCourses(res.data);
          if (res.data.length > 0) {
            setSelectedCourseId(res.data[0]._id);
          }
        } catch (err) {
          toast.error("Failed to load courses.");
        } finally {
          setLoadingCourses(false);
        }
      };
      fetchCourses();
    }
  }, [id]);

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        questionText: "",
        options: ["", "", "", ""],
        correctAnswerIndex: 0,
      },
    ]);
  };

  const removeQuestion = (qIdx) => {
    if (questions.length === 1) {
      toast.error("Quizzes must have at least one question.");
      return;
    }
    setQuestions((prev) => prev.filter((_, idx) => idx !== qIdx));
  };

  const updateQuestionText = (qIdx, text) => {
    setQuestions((prev) =>
      prev.map((q, idx) => (idx === qIdx ? { ...q, questionText: text } : q))
    );
  };

  const updateOptionText = (qIdx, optIdx, text) => {
    setQuestions((prev) =>
      prev.map((q, idx) => {
        if (idx !== qIdx) return q;
        const nextOptions = [...q.options];
        nextOptions[optIdx] = text;
        return { ...q, options: nextOptions };
      })
    );
  };

  const setCorrectOption = (qIdx, optIdx) => {
    setQuestions((prev) =>
      prev.map((q, idx) => (idx === qIdx ? { ...q, correctAnswerIndex: optIdx } : q))
    );
  };

  const handleSubmitQuiz = async (e) => {
    e.preventDefault();

    const targetCourseId = id || selectedCourseId;
    if (!targetCourseId) {
      toast.error("You must select or create a course first.");
      return;
    }

    if (!title) {
      toast.error("Quiz title is required.");
      return;
    }

    // Validate questions and option texts
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText.trim()) {
        toast.error(`Question ${i + 1} text cannot be blank.`);
        return;
      }
      if (q.options.some((o) => !o.trim())) {
        toast.error(`Please fill in all options for Question ${i + 1}.`);
        return;
      }
    }

    setSubmitting(true);
    try {
      // Map temporary states to backend contract schema
      const formattedQuestions = questions.map((q) => ({
        questionText: q.questionText,
        options: q.options,
        correctAnswer: q.options[q.correctAnswerIndex],
      }));

      await api.post("/quizzes", {
        title,
        description,
        courseId: targetCourseId,
        questions: formattedQuestions,
      });

      toast.success("Quiz compiled & published successfully!");
      navigate(`/courses/${targetCourseId}`);
    } catch (err) {
      toast.error(err.message || "Failed to publish quiz.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="create-quiz-page flex flex-col gap-6">
      <div className="breadcrumbs">
        {id ? (
          <span className="crumb clickable" onClick={() => navigate(`/courses/${id}`)}>
            ➔ Back to Course Detail
          </span>
        ) : (
          <span className="crumb clickable" onClick={() => navigate("/dashboard")}>
            ➔ Back to Dashboard
          </span>
        )}
      </div>

      <div className="header-row">
        <h2 className="dashboard-title">Create Quiz</h2>
        <p className="text-secondary">Draft exam questions for this course module.</p>
      </div>

      <form onSubmit={handleSubmitQuiz} className="flex flex-col gap-6">
        <div className="card glass-panel flex flex-col gap-4">
          <h3 className="section-title">Quiz Details</h3>
          
          {!id && (
            <div className="form-group">
              <label className="form-label">Associate with Course</label>
              {loadingCourses ? (
                <span className="text-muted">Loading your courses...</span>
              ) : courses.length === 0 ? (
                <span style={{ color: "var(--accent)" }}>No courses created yet. Create a course first.</span>
              ) : (
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="form-select"
                  required
                >
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Quiz Title</label>
            <input
              type="text"
              placeholder="e.g. Intermediate Git Quiz"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Short Description</label>
            <textarea
              rows="3"
              placeholder="Brief instructions or summary..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-input"
              style={{ resize: "none" }}
            ></textarea>
          </div>
        </div>

        <div className="questions-title-row flex justify-between items-center w-full" style={{ marginTop: "1rem" }}>
          <h3 className="section-title">Questions Registry</h3>
          <button type="button" className="btn btn-secondary" onClick={addQuestion}>
            ➕ Add Question Choice
          </button>
        </div>

        <div className="questions-composer-stack flex flex-col gap-6">
          {questions.map((q, qIdx) => (
            <div key={qIdx} className="card glass-panel flex flex-col gap-4 question-composer-card">
              <div className="flex justify-between items-center">
                <span className="question-index-tag">Question {qIdx + 1}</span>
                <button
                  type="button"
                  className="btn btn-danger text-xs"
                  onClick={() => removeQuestion(qIdx)}
                  style={{ padding: "0.25rem 0.6rem" }}
                >
                  Delete Question
                </button>
              </div>

              <div className="form-group">
                <label className="form-label">Question Prompt Text</label>
                <input
                  type="text"
                  placeholder="e.g. Which keyword starts a Git repository?"
                  value={q.questionText}
                  onChange={(e) => updateQuestionText(qIdx, e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div className="options-composer-grid grid gap-3">
                {q.options.map((opt, optIdx) => {
                  const isCorrect = q.correctAnswerIndex === optIdx;
                  return (
                    <div key={optIdx} className="option-composer-row flex items-center gap-3">
                      <button
                        type="button"
                        className={`correct-toggle-btn flex items-center justify-center ${
                          isCorrect ? "selected" : ""
                        }`}
                        onClick={() => setCorrectOption(qIdx, optIdx)}
                        title="Mark as correct answer"
                      >
                        ✓
                      </button>
                      <input
                        type="text"
                        placeholder={`Option ${optIdx + 1}`}
                        value={opt}
                        onChange={(e) => updateOptionText(qIdx, optIdx, e.target.value)}
                        className="form-input flex-1"
                        required
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3" style={{ marginTop: "1.5rem" }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate(`/courses/${id}`)}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? "Publishing Quiz..." : "Compile & Publish Quiz ➔"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateQuiz;
