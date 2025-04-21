import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "@/components/Layout";
import axios from "axios";

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
    <Layout title={`Pet Details - ${pet.name}`}>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-semibold text-pink-600 mb-6">
          {pet.name}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Basic Information
            </h2>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Breed:</span> {pet.breed}
              </p>
              <p>
                <span className="font-medium">Sex:</span> {pet.sex}
              </p>
              <p>
                <span className="font-medium">Age:</span> {pet.ageYears} years
              </p>
              <p>
                <span className="font-medium">Neutered:</span>{" "}
                {pet.isNeutered ? "Yes" : "No"}
              </p>
              <p>
                <span className="font-medium">Activity Level:</span>{" "}
                {pet.activityLevel}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Weight & Feeding
            </h2>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Current Weight:</span>{" "}
                {pet.currentWeight}kg
              </p>
              <p>
                <span className="font-medium">Target Weight:</span>{" "}
                {pet.targetWeight}kg
              </p>
              <p>
                <span className="font-medium">Food Coefficient:</span>{" "}
                {pet.foodCoefficient}
              </p>
              <p>
                <span className="font-medium">Last Weight Update:</span>{" "}
                {new Date(pet.lastWeightUpdateDate).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Daily Portions
            </h2>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Morning:</span>{" "}
                {pet.morningPortionGrams}g
              </p>
              <p>
                <span className="font-medium">Afternoon:</span>{" "}
                {pet.afternoonPortionGrams}g
              </p>
              <p>
                <span className="font-medium">Evening:</span>{" "}
                {pet.eveningPortionGrams}g
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Feeder Information
            </h2>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Assigned Feeder:</span>{" "}
                {pet.feeder.name}
              </p>
              <p>
                <span className="font-medium">Feeder Status:</span>{" "}
                {pet.feeder.isActive ? "Active" : "Inactive"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
