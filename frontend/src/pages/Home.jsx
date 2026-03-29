import { useEffect, useState } from "react";
import "../styles/Home.css";
import { useNavigate } from "react-router-dom";

function Home() {
    const navigate = useNavigate();
    const [isLoaded, setIsLoaded] = useState(false);
    const [seconds, setSeconds] = useState(60);

    useEffect(() => {
        if(isLoaded) return;

        const interval = setInterval(() => {
            setSeconds((prev) => {
                if(prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [isLoaded]);

    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/`);

                if(res.ok) {
                    setIsLoaded(true);
                    clearInterval(interval);
                }
            } catch (error) {
                console.log("Server still sleeping...");
            }
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <>
            {!isLoaded ? (
                <div className="home-container">
                    <div className="loading-box">
                        <h2>The application takes time to load...</h2>
                        <p>see why</p>
                        <p>Please wait</p>

                        <div className="timer">
                            <span>Loading: {seconds}s</span>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="continue-container">
                    <button className="continue-btn" onClick={() => navigate("/auth")}>Continue to Application</button>
                </div>
            )
        }
        </>
    )
}

export default Home;