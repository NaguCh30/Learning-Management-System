import { useState, useEffect } from "react";
import CourseCard from "../components/courses/CourseCard";
import api from "../services/api";
import "./BrowseCourses.css";

function BrowseCourses() {
  const [search, setSearch] = useState("");
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/courses?keyword=${search}`);
      setCourses(res.data);
    } catch (error) {
      console.error("Failed to fetch courses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce course search fetching by 300ms
    const delayDebounceFn = setTimeout(() => {
      fetchCourses();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  return (
    <div className="browse-courses-page">
      <div className="flex justify-between items-center w-full header-row">
        <h2 className="browse-courses-heading">Explore Courses</h2>
        <input
          type="text"
          placeholder="Search courses, categories, or keywords..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="form-input search-input"
          style={{ maxWidth: "340px" }}
        />
      </div>

      {loading ? (
        <div className="courses-grid grid gap-6">
          <div className="card skeleton" style={{ height: "300px" }}></div>
          <div className="card skeleton" style={{ height: "300px" }}></div>
          <div className="card skeleton" style={{ height: "300px" }}></div>
        </div>
      ) : (
        <div className="courses-grid grid gap-6">
          {courses.length === 0 ? (
            <div className="empty-state-panel flex flex-col items-center justify-center text-center gap-4 w-full">
              <span style={{ fontSize: "2.5rem" }}>👀</span>
              <h3>No courses found</h3>
              <p style={{ color: "var(--text-secondary)" }}>
                We couldn{"'"}t find any courses matching "{search}". Try searching for something else!
              </p>
            </div>
          ) : (
            courses.map((course) => (
              <CourseCard key={course._id} course={course} onEnrollSuccess={fetchCourses} />
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default BrowseCourses;