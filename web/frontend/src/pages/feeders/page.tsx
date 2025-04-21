import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import axios from "axios";

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
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-semibold text-gray-900">
                {feeder.name}
              </h1>
              <div className="flex items-center space-x-4">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    feeder.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {feeder.isActive ? "Active" : "Inactive"}
                </span>
                <button
                  onClick={handleToggleActive}
                  className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition-colors"
                >
                  Toggle Status
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">All Pets</h3>
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
      </div>
    </Layout>
  );
};

export default FeederDetails;
