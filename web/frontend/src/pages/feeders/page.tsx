import React, { useState, useEffect } from "react";
import { FaPaw, FaCog, FaPlay } from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";

interface Pet {
  id: string;
  name: string;
  breed: string;
  avatar?: string;
}

interface FeederDetailsProps {
  id: string;
  name: string;
  status: "active" | "inactive";
  pets: Pet[];
}

const FeederDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"active" | "inactive">("inactive");
  const [isFeeding, setIsFeeding] = useState(false);
  const [feederData, setFeederData] = useState<{
    name: string;
    pets: Pet[];
  } | null>(null);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      navigate("/login");
      return;
    }

    // Simulate API call with dummy data
    setTimeout(() => {
      setFeederData({
        name: "Kitchen Feeder",
        pets: [
          {
            id: "1",
            name: "Whiskers",
            breed: "Persian",
          },
          {
            id: "2",
            name: "Mittens",
            breed: "Maine Coon",
          },
        ],
      });
      setStatus("active");
    }, 500);
  }, [id, navigate]);

  if (!feederData) {
    return (
      <Layout title="Feeder Details">
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-gray-600">Loading...</div>
        </div>
      </Layout>
    );
  }

  const handleStatusToggle = () => {
    setStatus(status === "active" ? "inactive" : "active");
  };

  const handleFeedNow = () => {
    setIsFeeding(true);
    // Add your feeding logic here
    setTimeout(() => setIsFeeding(false), 2000); // Simulate feeding process
  };

  return (
    <Layout title={feederData.name}>
      <div className="max-w-2xl mx-auto mt-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-pink-100 flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold text-pink-700 mb-1">
                {feederData.name}
              </h2>
              <p className="text-sm text-gray-500">Feeder ID: {id}</p>
            </div>
            <span
              className={`inline-flex px-3 py-1 rounded-full text-xs font-medium
              ${
                status === "active"
                  ? "bg-pink-500 text-white"
                  : "border border-pink-500 text-pink-500"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Status Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaPlay className="text-xl text-pink-600" />
                <span className="text-gray-700">Feeder Status</span>
              </div>
              <label className="relative inline-block w-12 h-6">
                <input
                  type="checkbox"
                  className="hidden"
                  checked={status === "active"}
                  onChange={handleStatusToggle}
                />
                <span
                  className={`absolute cursor-pointer inset-0 rounded-full transition-colors duration-300
                  ${status === "active" ? "bg-pink-500" : "bg-gray-200"}`}
                >
                  <span
                    className={`absolute w-5 h-5 bg-white rounded-full transition-transform duration-300
                    ${
                      status === "active" ? "translate-x-6" : "translate-x-1"
                    } top-0.5`}
                  />
                </span>
              </label>
            </div>

            <hr className="border-pink-100" />

            {/* Feed Now Button */}
            <button
              onClick={handleFeedNow}
              disabled={status !== "active" || isFeeding}
              className={`w-full bg-pink-500 text-white py-6 px-4 rounded-md text-xl font-bold
                flex items-center justify-center shadow-md transition-transform
                ${
                  status === "active" && !isFeeding
                    ? "hover:scale-102 hover:bg-pink-600"
                    : "opacity-50 cursor-not-allowed"
                }`}
            >
              {isFeeding ? "Feeding..." : "Feed Now"}
            </button>

            {/* Pets Section */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-lg font-medium text-pink-700">
                <FaPaw />
                Connected Pets
              </h3>
              <div className="space-y-2">
                {feederData.pets.length > 0 ? (
                  feederData.pets.map((pet) => (
                    <div
                      key={pet.id}
                      className="flex items-center justify-between p-3 bg-white rounded-md border border-pink-100 shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center text-pink-800">
                          {pet.avatar || <FaPaw />}
                        </div>
                        <div className="text-left">
                          <p className="font-medium">{pet.name}</p>
                          <p className="text-sm text-gray-500">{pet.breed}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate(`/pet/${pet.id}`)}
                        className="text-sm text-pink-700 hover:text-pink-800"
                      >
                        View Details
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500">No pets connected</p>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-pink-100">
            <button className="w-full py-2.5 px-5 border border-pink-100 rounded-md text-sm font-medium text-pink-700 hover:bg-pink-50">
              <FaCog className="inline mr-2" />
              Edit Feeder Settings
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default FeederDetails;
