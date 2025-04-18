import React, { useState, useEffect } from "react";
import "./styles.css";

const API_KEY = "bdf6220fa27bd1160d2637c4dc9ef427";

export default function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState("");
  const [localTime, setLocalTime] = useState("");
  const [userState, setUserState] = useState("");
  const [searchedCityTime, setSearchedCityTime] = useState("");
  const [currentHour, setCurrentHour] = useState(0);

  // Get user's actual local time and state on app load
  useEffect(() => {
    const updateLocalTime = () => {
      const now = new Date();
      const hours = now.getHours();
      setCurrentHour(hours);

      setLocalTime(
        now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
    };

    const timer = setInterval(updateLocalTime, 1000);
    updateLocalTime();

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const response = await fetch(
              `https://api.openweathermap.org/data/2.5/weather?lat=${position.coords.latitude}&lon=${position.coords.longitude}&appid=${API_KEY}`
            );
            const data = await response.json();
            if (data.cod === 200) {
              const state = data.name.includes(",")
                ? data.name.split(",")[1].trim()
                : data.name;
              setUserState(state);
            }
          } catch (err) {
            console.error("Location error:", err);
            setUserState("Your Location");
          }
        },
        () => {
          setUserState("Your Location");
        }
      );
    }

    return () => clearInterval(timer);
  }, []);

  // Accurate time emoji function based on current hour (0-23)
  const getTimeEmoji = (hour) => {
    if (hour >= 6 && hour < 12) return "🌅"; // Morning (6am-11:59am)
    if (hour >= 12 && hour < 18) return "☀️"; // Afternoon (12pm-5:59pm)
    if (hour >= 18 && hour < 24) return "🌆"; // Evening (6pm-11:59pm)
    return "🌙"; // Night (12am-5:59am)
  };

  const fetchWeather = async () => {
    if (!city) return;

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
      );
      const data = await response.json();

      if (data.cod === 200) {
        setWeather(data);
        // Calculate accurate local time for searched city
        const now = new Date();
        const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
        const cityTime = new Date(utcTime + data.timezone * 1000);
        const options = {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        };
        setSearchedCityTime(cityTime.toLocaleTimeString([], options));
        setError("");
      } else {
        setWeather(null);
        setError(data.message);
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while fetching weather data.");
    }
  };

  return (
    <div
      className={`app-container ${
        currentHour >= 6 && currentHour < 18 ? "day-mode" : "night-mode"
      }`}
    >
      <header className="app-header">
        <h1>Weather Forecast</h1>
        <p>Get real-time weather updates for any city</p>
        <div className="live-clock">
          {getTimeEmoji(currentHour)} {localTime} |{" "}
          {userState || "Detecting location..."}
        </div>
      </header>

      <div className="app">
        <input
          type="text"
          placeholder="Enter city name..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <button onClick={fetchWeather}>Get Weather</button>

        {error && <p className="error">{error}</p>}

        {weather && (
          <div
            className={`weather-card ${
              getTimeEmoji(new Date().getHours()) === "☀️" ||
              getTimeEmoji(new Date().getHours()) === "🌅"
                ? "day"
                : "night"
            }`}
          >
            <h2>{weather.name.split(",")[0]}</h2>
            <p className="local-time">🕒 Local Time: {searchedCityTime}</p>
            <div className="weather-main">
              <p className="weather-description">
                {weather.weather[0].description}
                <span className="emoji">
                  {weather.weather[0].main === "Clear" &&
                    getTimeEmoji(new Date().getHours())}
                  {weather.weather[0].main === "Rain" && "🌧️"}
                  {weather.weather[0].main === "Clouds" && "☁️"}
                  {weather.weather[0].main === "Snow" && "❄️"}
                  {weather.weather[0].main === "Thunderstorm" && "⛈️"}
                  {weather.weather[0].main === "Drizzle" && "🌦️"}
                  {weather.weather[0].main === "Mist" && "🌫️"}
                </span>
              </p>
              <p className="temperature">{Math.round(weather.main.temp)}°C</p>
            </div>
            <div className="weather-details">
              <div className="detail-item">
                <span className="detail-label">Feels Like:</span>
                <span className="detail-value">
                  {Math.round(weather.main.feels_like)}°C
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Humidity:</span>
                <span className="detail-value">{weather.main.humidity}%</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Wind:</span>
                <span className="detail-value">{weather.wind.speed} m/s</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Pressure:</span>
                <span className="detail-value">
                  {weather.main.pressure} hPa
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <footer className="app-footer">
        <div className="footer-content">
          <p className="footer-main">
            Developed by <a>Tim Afolayan</a>
          </p>
          <div className="portfolio-link">
            <a
              href="https://afolayan-tim-portfolio.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Visit My Portfolio →
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
