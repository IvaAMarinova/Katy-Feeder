import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "@/components/Layout";
import axios from "axios";
import {
  FaPaw,
  FaVenusMars,
  FaBirthdayCake,
  FaWeight,
  FaRunning,
  FaClock,
  FaHome,
} from "react-icons/fa";
import { MdPets } from "react-icons/md";
import { GiDogBowl } from "react-icons/gi";

interface Pet {
  id: number;
  name: string;
  breed: string;
  sex: string;
  ageYears: number;
  isNeutered: boolean;
  activityLevel: number;
  targetWeight: number;
  currentWeight: number;
  foodCoefficient: number;
  morningPortionGrams: number;
  afternoonPortionGrams: number;
  eveningPortionGrams: number;
  lastWeightUpdateDate: string;
  feeder: {
    id: number;
    name: string;
    isActive: boolean;
  };
}

export default function Pet() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPet = async () => {
      try {
        const response = await axios.get(`/pets/${id}`);
        setPet(response.data);
      } catch (err) {
        setError("Failed to fetch pet details");
        console.error("Error fetching pet:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPet();
  }, [id]);

  if (loading) {
    return (
      <Layout title="Pet Details">
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-gray-600">Loading...</div>
        </div>
      </Layout>
    );
  }

  if (error || !pet) {
    return (
      <Layout title="Pet Details">
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-red-600">{error || "Pet not found"}</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`${pet.name}`}>
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Card */}
        <div className="bg-pink-500 rounded-lg shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <MdPets className="text-3xl sm:text-4xl text-white" />
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                {pet.name}
              </h1>
            </div>
            <div className="bg-white/20 px-4 py-2 rounded-full self-start sm:self-auto">
              <span className="text-white font-semibold">ID: #{pet.id}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 transform hover:scale-102 transition-transform duration-200">
            <div className="flex items-center space-x-2 mb-4">
              <FaPaw className="text-2xl text-pink-600" />
              <h2 className="text-xl font-semibold text-gray-800">
                Basic Information
              </h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-pink-50 rounded-lg">
                <FaPaw className="text-pink-600" />
                <span className="font-medium">Breed:</span>
                <span>{pet.breed}</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-pink-50 rounded-lg">
                <FaVenusMars className="text-pink-600" />
                <span className="font-medium">Sex:</span>
                <span>{pet.sex}</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-pink-50 rounded-lg">
                <FaBirthdayCake className="text-pink-600" />
                <span className="font-medium">Age:</span>
                <span>{pet.ageYears} years</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-pink-50 rounded-lg">
                <MdPets className="text-pink-600" />
                <span className="font-medium">Neutered:</span>
                <span>{pet.isNeutered ? "Yes" : "No"}</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-pink-50 rounded-lg">
                <FaRunning className="text-pink-600" />
                <span className="font-medium">Activity Level:</span>
                <span>{pet.activityLevel}</span>
              </div>
            </div>
          </div>

          {/* Weight & Feeding */}
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 transform hover:scale-102 transition-transform duration-200">
            <div className="flex items-center space-x-2 mb-4">
              <FaWeight className="text-2xl text-pink-600" />
              <h2 className="text-xl font-semibold text-gray-800">
                Weight & Feeding
              </h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-pink-50 rounded-lg">
                <FaWeight className="text-pink-600" />
                <span className="font-medium">Current Weight:</span>
                <span>{pet.currentWeight}kg</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-pink-50 rounded-lg">
                <FaWeight className="text-pink-600" />
                <span className="font-medium">Target Weight:</span>
                <span>{pet.targetWeight}kg</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-pink-50 rounded-lg">
                <GiDogBowl className="text-pink-600" />
                <span className="font-medium">Food Coefficient:</span>
                <span>{pet.foodCoefficient}</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-pink-50 rounded-lg">
                <FaClock className="text-pink-600" />
                <span className="font-medium">Last Weight Update:</span>
                <span>
                  {new Date(pet.lastWeightUpdateDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Daily Portions */}
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 transform hover:scale-102 transition-transform duration-200">
            <div className="flex items-center space-x-2 mb-4">
              <GiDogBowl className="text-2xl text-pink-600" />
              <h2 className="text-xl font-semibold text-gray-800">
                Daily Portions
              </h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-pink-50 rounded-lg">
                <FaClock className="text-pink-600" />
                <span className="font-medium">Morning:</span>
                <span>{pet.morningPortionGrams}g</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-pink-50 rounded-lg">
                <FaClock className="text-pink-600" />
                <span className="font-medium">Afternoon:</span>
                <span>{pet.afternoonPortionGrams}g</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-pink-50 rounded-lg">
                <FaClock className="text-pink-600" />
                <span className="font-medium">Evening:</span>
                <span>{pet.eveningPortionGrams}g</span>
              </div>
            </div>
          </div>

          {/* Feeder Information */}
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 transform hover:scale-102 transition-transform duration-200">
            <div className="flex items-center space-x-2 mb-4">
              <FaHome className="text-2xl text-pink-600" />
              <h2 className="text-xl font-semibold text-gray-800">
                Feeder Information
              </h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-pink-50 rounded-lg">
                <FaHome className="text-pink-600" />
                <span className="font-medium">Assigned Feeder:</span>
                <span>{pet.feeder.name}</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-pink-50 rounded-lg">
                <div
                  className={`w-3 h-3 rounded-full ${
                    pet.feeder.isActive ? "bg-green-500" : "bg-red-500"
                  }`}
                />
                <span className="font-medium">Feeder Status:</span>
                <span>{pet.feeder.isActive ? "Active" : "Inactive"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
