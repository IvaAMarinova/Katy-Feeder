import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import axios from "axios";
import { FaHome, FaPaw } from "react-icons/fa";
import { MdPets } from "react-icons/md";
import { toast } from "react-toastify";

interface Pet {
  id: number;
  name: string;
  breed: string;
  feeder?: {
    id: number;
    name: string;
  };
}

interface Feeder {
  id: number;
  name: string;
  isActive: boolean;
}

const FeederDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [feeder, setFeeder] = useState<Feeder | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [feederResponse, petsResponse] = await Promise.all([
          axios.get(`/feeders/${id}`),
          axios.get("/pets"),
        ]);
        setFeeder(feederResponse.data);
        setPets(petsResponse.data);
      } catch (err) {
        setError("Failed to fetch data");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleToggleActive = async () => {
    try {
      const response = await axios.put(`/feeders/${id}/toggle`);
      setFeeder(response.data);
    } catch (err) {
      console.error("Error toggling feeder status:", err);
    }
  };

  const handleFeedNow = async () => {
    try {
      await axios.post(`/esp/commands/feeder/${id}/feed-now`);
      // Optional: Show success message
      toast.success("Feeding triggered successfully!");
    } catch (err) {
      console.error("Error triggering feed:", err);
      toast.error("Failed to trigger feeding");
    }
  };

  if (loading) {
    return (
      <Layout title="Feeder Details">
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-gray-600">Loading...</div>
        </div>
      </Layout>
    );
  }

  if (error || !feeder) {
    return (
      <Layout title="Feeder Details">
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-red-600">{error || "Feeder not found"}</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`${feeder.name}`}>
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Card */}
        <div className="bg-pink-500 rounded-lg shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <FaHome className="text-3xl sm:text-4xl text-white" />
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                {feeder.name}
              </h1>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="bg-white/20 px-4 py-2 rounded-full">
                <span className="text-white font-semibold">
                  ID: #{feeder.id}
                </span>
              </div>
              <button
                onClick={handleToggleActive}
                className={`px-6 py-2 rounded-full font-semibold transition-colors ${
                  feeder.isActive
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-red-500 hover:bg-red-600"
                } text-white`}
              >
                {feeder.isActive ? "Active" : "Inactive"}
              </button>
            </div>
          </div>
        </div>

        {/* Status Card */}
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <FaHome className="text-2xl text-pink-600" />
                <h2 className="text-xl font-semibold text-gray-800">
                  Feeder Status
                </h2>
              </div>
              <div
                className={`px-4 py-2 rounded-full ${
                  feeder.isActive
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {feeder.isActive ? "Online" : "Offline"}
              </div>
            </div>

            {/* New Feed Now Button */}
            <button
              onClick={handleFeedNow}
              disabled={!feeder.isActive}
              className={`w-full py-4 rounded-lg text-white text-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-3
                ${
                  feeder.isActive
                    ? "bg-pink-600 hover:bg-pink-700 transform hover:scale-102"
                    : "bg-gray-400 cursor-not-allowed"
                }
              `}
            >
              <MdPets className="text-2xl" />
              <span>Feed Now</span>
            </button>

            {/* Optional: Add helper text */}
            {!feeder.isActive && (
              <p className="text-sm text-gray-500 text-center">
                Feeder must be online to trigger manual feeding
              </p>
            )}
          </div>
        </div>

        {/* Pets Grid */}
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
          <div className="flex items-center space-x-4 mb-6">
            <MdPets className="text-2xl text-pink-600" />
            <h2 className="text-xl font-semibold text-gray-800">
              Connected Pets
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {pets.map((pet) => (
              <div
                key={pet.id}
                className="bg-white rounded-lg shadow-md p-6 border border-pink-100 hover:border-pink-300 transform hover:scale-102 transition-all duration-200"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <FaPaw className="text-2xl text-pink-600" />
                  <h3 className="text-xl font-semibold text-pink-600">
                    {pet.name}
                  </h3>
                </div>
                <div className="space-y-3 text-gray-600 mb-4">
                  <div className="flex items-center space-x-2">
                    <MdPets className="text-pink-400" />
                    <p>Breed: {pet.breed}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FaHome className="text-pink-400" />
                    <p>Assigned Feeder: {pet.feeder?.name || "None"}</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/pet/${pet.id}`)}
                  className="w-full bg-pink-600 text-white py-2 rounded-md hover:bg-pink-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <MdPets />
                  <span>View Details</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default FeederDetails;
