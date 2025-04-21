import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "@/components/Layout";

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

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      navigate("/login");
      return;
    }

    // Simulate API call with dummy data
    setTimeout(() => {
      setPet({
        id: Number(id),
        name: "Whiskers",
        breed: "Persian",
        sex: "male",
        ageYears: 3,
        isNeutered: true,
        activityLevel: 3,
        targetWeight: 4.5,
        currentWeight: 5.2,
        foodCoefficient: 1.2,
        morningPortionGrams: 30,
        afternoonPortionGrams: 20,
        eveningPortionGrams: 30,
        lastWeightUpdateDate: new Date().toISOString(),
        feeder: { id: 1, name: "Kitchen Feeder", isActive: true },
      });
      setLoading(false);
    }, 500);
  }, [id, navigate]);

  if (loading) {
    return (
      <Layout title="Pet Details">
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-gray-600">Loading...</div>
        </div>
      </Layout>
    );
  }

  if (!pet) {
    return (
      <Layout title="Pet Details">
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-gray-600">Pet not found</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={pet.name}>
      <div className="max-w-2xl mx-auto mt-8">
        <div className="bg-white rounded-lg shadow-md border border-pink-100 p-6">
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="h-20 w-20 rounded-full bg-pink-100 flex items-center justify-center">
                <span className="text-3xl text-pink-600">🐱</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-pink-600">{pet.name}</h2>
                <p className="text-gray-600">{pet.breed}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-pink-50 rounded-lg">
                <h3 className="font-semibold text-pink-700">
                  Feeding Schedule
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-pink-50 p-4 rounded-lg">
                    <h3 className="font-medium">Morning</h3>
                    <p>{pet.morningPortionGrams}g</p>
                  </div>
                  <div className="bg-pink-50 p-4 rounded-lg">
                    <h3 className="font-medium">Afternoon</h3>
                    <p>{pet.afternoonPortionGrams}g</p>
                  </div>
                  <div className="bg-pink-50 p-4 rounded-lg">
                    <h3 className="font-medium">Evening</h3>
                    <p>{pet.eveningPortionGrams}g</p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-pink-50 rounded-lg">
                <h3 className="font-semibold text-pink-700">Feeding History</h3>
                {/* Add history content */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
