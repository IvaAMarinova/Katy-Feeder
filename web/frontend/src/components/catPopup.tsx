"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
const API_BASE_URL = import.meta.env.VITE_API_URL;

interface CatPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CatPopup({ isOpen, onClose }: CatPopupProps) {
  const [step, setStep] = useState<"intro" | "options" | "success">("intro");
  const [foodTimer, setFoodTimer] = useState<number | null>(null);
  const [drinkTimer, setDrinkTimer] = useState<number | null>(null);
  const [foodDuration, setFoodDuration] = useState<number | null>(null);
  const [drinkDuration, setDrinkDuration] = useState<number | null>(null);
  const [selectedOption, setSelectedOption] = useState<"food" | "drink" | null>(
    null
  );
  const [showFoodAnimation, setShowFoodAnimation] = useState(false);
  const [showWaterAnimation, setShowWaterAnimation] = useState(false);
  const [showIntroAnimation, setShowIntroAnimation] = useState(true);

  const fetchTimerStatus = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/esp/commands/timer-status`
      );
      const {
        foodTimeRemaining,
        drinkTimeRemaining,
        foodTimerDuration,
        drinkTimerDuration,
      } = response.data;

      // Convert milliseconds to seconds for display
      setFoodTimer(Math.ceil(foodTimeRemaining / 1000));
      setDrinkTimer(Math.ceil(drinkTimeRemaining / 1000));

      // Store durations in minutes
      setFoodDuration(Math.ceil(foodTimerDuration / (60 * 1000)));
      setDrinkDuration(Math.ceil(drinkTimerDuration / (60 * 1000)));

      console.log("Timer Status:", {
        foodTimeRemaining: Math.ceil(foodTimeRemaining / 1000),
        drinkTimeRemaining: Math.ceil(drinkTimeRemaining / 1000),
        foodTimerDuration: Math.ceil(foodTimerDuration / (60 * 1000)),
        drinkTimerDuration: Math.ceil(drinkTimerDuration / (60 * 1000)),
      });
    } catch (error) {
      console.error("Failed to fetch timer status:", error);
      toast.error("Failed to fetch timer status");
    }
  };

  // Fetch initial timer status when component mounts and when isOpen changes
  useEffect(() => {
    if (isOpen) {
      fetchTimerStatus();
    }
  }, [isOpen]);

  // Regular updates when in options step
  useEffect(() => {
    if (step === "options") {
      const interval = setInterval(fetchTimerStatus, 1000);
      return () => clearInterval(interval);
    }
  }, [step]);

  // Hide intro animation after 3 seconds
  useEffect(() => {
    if (showIntroAnimation) {
      const timer = setTimeout(() => {
        setShowIntroAnimation(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showIntroAnimation]);

  const formatTime = (seconds: number | null): string => {
    if (seconds === null) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" + secs : secs}`;
  };

  const handleOptionClick = async (option: "food" | "drink") => {
    setSelectedOption(option);

    try {
      // If it's food option, trigger the feed-now endpoint first
      if (option === "food") {
        await axios.post(`${API_BASE_URL}/esp/commands/feeder/1/feed-now`);
        toast.success("Feeding triggered successfully!");
      }

      // Reset the timer
      await axios.post(`${API_BASE_URL}/esp/commands/reset-timer/${option}`);

      // Immediately fetch new timer status after reset
      await fetchTimerStatus();

      if (option === "food") {
        setShowFoodAnimation(true);
        setTimeout(() => setShowFoodAnimation(false), 2000);
      } else {
        setShowWaterAnimation(true);
        setTimeout(() => setShowWaterAnimation(false), 2000);
      }

      setTimeout(() => {
        setStep("success");
      }, 2000);
    } catch (error) {
      console.error("Failed to process request:", error);
      toast.error("Failed to process request");
    }
  };

  const handleClose = () => {
    setStep("intro");
    setSelectedOption(null);
    setShowFoodAnimation(false);
    setShowWaterAnimation(false);
    setShowIntroAnimation(true);
    fetchTimerStatus(); // Fetch fresh timer values when closing
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-purple-500 via-pink-400 to-blue-400 flex flex-col items-center justify-between p-4 overflow-hidden">
      {/* Intro Animation */}
      {showIntroAnimation && (
        <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center animate-fadeIn">
          <div className="text-center animate-scaleIn">
            <h1 className="text-5xl font-bold text-white mb-4">
              <span className="text-yellow-400">TUES </span>
              <span className="text-pink-400">Fest</span>
              <span className="text-blue-400">2025</span>
            </h1>
            <div className="text-2xl text-white animate-pulse">
              Специален режим отключен
            </div>
          </div>
        </div>
      )}

      <div
        className={`w-full flex-1 flex flex-col ${
          showIntroAnimation ? "opacity-0" : "animate-fadeIn"
        }`}
      >
        {/* Header */}
        <div className="w-full text-center py-4">
          <h1 className="text-4xl font-bold text-white drop-shadow-lg tracking-wider">
            Katy-Feeder
          </h1>
          <p className="text-white text-sm mt-2">
            TUES Fest 2025 - Специално Издание
          </p>
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 text-white hover:text-gray-200 z-50"
        >
          <X size={24} />
        </button>

        {/* Main content */}
        <div className="flex-1 w-full max-w-md mx-auto flex items-center justify-center">
          <div className="w-full">
            {step === "intro" && (
              <div className="space-y-6 text-center animate-fadeIn">
                <div className="bg-white/90 rounded-2xl p-6 shadow-xl">
                  <div className="cat-avatar mb-4">
                    <div className="flex justify-center items-center">
                      <img
                        src="/cat-image.png"
                        alt="Котенце"
                        className="w-24 h-24 object-contain"
                      />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-pink-600 mb-3">
                    Мяу!
                  </h2>
                  <p className="text-gray-700 text-lg">
                    Ти си това малко сладко котенце и си търсиш нещо за хапване
                    или пийване...
                  </p>
                </div>
                <Button
                  onClick={() => setStep("options")}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-10 rounded-full text-xl shadow-lg transform transition-transform hover:scale-105"
                >
                  Търси
                </Button>
              </div>
            )}

            {step === "options" && (
              <div className="space-y-8 text-center animate-fadeIn">
                <h2 className="text-3xl font-bold text-white drop-shadow-md">
                  Какво ми се яде?
                </h2>

                <div className="relative">
                  <div className="grid grid-cols-2 gap-8">
                    {/* Food Option */}
                    <div className="space-y-2">
                      <div className="bg-yellow-400 text-white font-bold rounded-xl p-2 shadow-md">
                        {formatTime(foodTimer)}
                      </div>
                      <Button
                        onClick={() => handleOptionClick("food")}
                        disabled={foodTimer ? foodTimer > 0 : false}
                        className={`w-full h-32 rounded-xl shadow-lg transform transition-transform hover:scale-105 flex flex-col items-center justify-center space-y-2 ${
                          foodTimer && foodTimer > 0
                            ? "bg-yellow-300 opacity-70 cursor-not-allowed"
                            : "bg-gradient-to-br from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600"
                        }`}
                      >
                        <div className="relative w-full h-full flex items-center justify-center">
                          <span className="text-xl font-bold">Храна</span>
                          {foodTimer === 0 && (
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full animate-ping"></div>
                          )}
                        </div>
                      </Button>
                      {showFoodAnimation && (
                        <div className="food-animation">
                          {Array.from({ length: 10 }).map((_, i) => (
                            <div
                              key={i}
                              className="food-particle bg-yellow-600 absolute rounded-full"
                              style={{
                                width: `${Math.random() * 10 + 5}px`,
                                height: `${Math.random() * 10 + 5}px`,
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                animation: `fall ${
                                  Math.random() * 1 + 1
                                }s linear forwards`,
                              }}
                            ></div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Water Option */}
                    <div className="space-y-2">
                      <div className="bg-blue-400 text-white font-bold rounded-xl p-2 shadow-md">
                        {formatTime(drinkTimer)}
                      </div>
                      <Button
                        onClick={() => handleOptionClick("drink")}
                        disabled={drinkTimer ? drinkTimer > 0 : false}
                        className={`w-full h-32 rounded-xl shadow-lg transform transition-transform hover:scale-105 flex flex-col items-center justify-center space-y-2 ${
                          drinkTimer && drinkTimer > 0
                            ? "bg-blue-300 opacity-70 cursor-not-allowed"
                            : "bg-gradient-to-br from-blue-400 to-cyan-500 hover:from-blue-500 hover:to-cyan-600"
                        }`}
                      >
                        <div className="relative w-full h-full flex items-center justify-center">
                          <span className="text-xl font-bold">Вода</span>
                          {drinkTimer === 0 && (
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full animate-ping"></div>
                          )}
                        </div>
                      </Button>
                      {showWaterAnimation && (
                        <div className="water-animation">
                          {Array.from({ length: 15 }).map((_, i) => (
                            <div
                              key={i}
                              className="water-drop bg-blue-400 absolute rounded-full"
                              style={{
                                width: `${Math.random() * 8 + 3}px`,
                                height: `${Math.random() * 12 + 8}px`,
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                animation: `splash ${
                                  Math.random() * 1 + 0.5
                                }s ease-out forwards`,
                              }}
                            ></div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-white text-sm mt-4">
                  <p>
                    Трябва да изчакаш таймера да стигне 00:00, за да получиш
                    лакомство!
                  </p>
                </div>
              </div>
            )}

            {step === "success" && (
              <div className="space-y-6 text-center animate-fadeIn">
                <div className="bg-white/90 rounded-2xl p-6 shadow-xl">
                  <div className="w-20 h-20 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <svg
                      className="w-12 h-12 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-green-600 mb-3">
                    Успех!
                  </h2>
                  <p className="text-gray-700">
                    {selectedOption === "food"
                      ? "Скоро ще получа вкусна храна!"
                      : "Скоро ще мога да пийна прясна водичка!"}
                  </p>
                </div>

                <div className="bg-pink-200 rounded-2xl p-6 shadow-xl">
                  <p className="text-gray-700 mb-3">
                    Моля, подкрепете проекта ни с вашия глас!
                  </p>
                  <Button
                    onClick={() =>
                      window.open("https://tuesfest.bg/projects/47", "_blank")
                    }
                    className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transform transition-transform hover:scale-105"
                  >
                    Гласувай за нас!
                  </Button>
                </div>

                <div className="flex space-x-4 justify-center">
                  <Button
                    onClick={() => {
                      setStep("intro");
                      setShowIntroAnimation(false);
                    }}
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-full shadow-md"
                  >
                    Играй пак
                  </Button>
                  <Button
                    onClick={handleClose}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-full shadow-md"
                  >
                    Затвори
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="w-full text-center py-4">
          <p className="text-white text-xs opacity-80">TUES Fest 2025</p>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scaleIn {
          0% {
            opacity: 0;
            transform: scale(0.8);
          }
          70% {
            opacity: 1;
            transform: scale(1.1);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes fall {
          0% {
            transform: translateY(-20px);
            opacity: 1;
          }
          100% {
            transform: translateY(100px);
            opacity: 0;
          }
        }

        @keyframes splash {
          0% {
            transform: translateY(-30px) scale(1);
            opacity: 0.8;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateY(80px) scale(0.5);
            opacity: 0;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }

        .animate-scaleIn {
          animation: scaleIn 1s ease-out forwards;
        }

        .food-animation,
        .water-animation {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 20;
        }
      `}</style>
    </div>
  );
}
