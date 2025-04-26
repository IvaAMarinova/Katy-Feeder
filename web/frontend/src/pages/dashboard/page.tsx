"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import axios from "axios";
import CatPopup from "@/components/catPopup";

const API_URL = import.meta.env.VITE_API_URL;
const NGROK_URL = import.meta.env.VITE_NGROK_URL;

// Configure axios defaults
axios.defaults.baseURL = API_URL;
axios.defaults.withCredentials = true;
axios.defaults.headers.common["Accept"] = "application/json";
axios.defaults.headers.common["Content-Type"] = "application/json";

interface Feeder {
  id: number;
  name: string;
  isActive: boolean;
}

interface Pet {
  id: number;
  name: string;
  breed: string;
  currentWeight: number;
  targetWeight: number;
  feeder: Feeder;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [feeders, setFeeders] = useState<Feeder[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [feedersResponse, petsResponse] = await Promise.all([
          axios.get("/feeders"),
          axios.get("/pets"),
        ]);

        setFeeders(feedersResponse.data);
        setPets(petsResponse.data);
      } catch (err) {
        setError("Failed to fetch data");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Layout title="Dashboard">
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-gray-600">Loading...</div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Dashboard">
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-red-600">{error}</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Dashboard">
      <CatPopup isOpen={isPopupOpen} onClose={() => setIsPopupOpen(false)} />

      {!isPopupOpen && (
        <div className="fixed bottom-4 right-4 z-10">
          <button
            onClick={() => setIsPopupOpen(true)}
            className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-full shadow-lg"
          >
            Open Cat Game
          </button>
        </div>
      )}

      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Live Camera Feed
          </h2>
          <p> Coming soon! </p>
          {/* <div className="w-full aspect-video bg-gray-100 rounded-lg overflow-hidden shadow-md">
            <iframe
              src={NGROK_URL}
              className="w-full h-full border-0"
              allow="camera"
              title="Pet Camera Feed"
            />
          </div> */}
        </div>

        {/* Feeders Section */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Feeders</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {feeders.map((feeder) => (
              <div
                key={feeder.id}
                className="bg-white rounded-lg shadow-md p-6 border border-pink-100"
              >
                <h3 className="text-xl font-semibold text-pink-600 mb-2">
                  {feeder.name}
                </h3>
                <div className="flex items-center mb-4">
                  <span
                    className={`inline-block w-3 h-3 rounded-full mr-2 ${
                      feeder.isActive ? "bg-green-500" : "bg-gray-300"
                    }`}
                  />
                  <span className="text-gray-600">
                    {feeder.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <button
                  onClick={() => navigate(`/feeders/${feeder.id}`)}
                  className="w-full bg-pink-600 text-white py-2 rounded-md hover:bg-pink-700 transition-colors"
                >
                  Manage Feeder
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Pets Section */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Pets</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pets.map((pet) => (
              <div
                key={pet.id}
                className="bg-white rounded-lg shadow-md p-6 border border-pink-100"
              >
                <h3 className="text-xl font-semibold text-pink-600 mb-2">
                  {pet.name}
                </h3>
                <div className="space-y-2 text-gray-600 mb-4">
                  <p>Breed: {pet.breed}</p>
                  <p>Current Weight: {pet.currentWeight}kg</p>
                  <p>Target Weight: {pet.targetWeight}kg</p>
                  <p>Assigned Feeder: {pet.feeder?.name || "None"}</p>
                </div>
                <button
                  onClick={() => navigate(`/pet/${pet.id}`)}
                  className="w-full bg-pink-600 text-white py-2 rounded-md hover:bg-pink-700 transition-colors"
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
