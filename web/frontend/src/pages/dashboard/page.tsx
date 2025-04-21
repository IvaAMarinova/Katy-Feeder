import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      navigate("/login");
      return;
    }

    // Set dummy data
    setFeeders([
      { id: 1, name: "Kitchen Feeder", isActive: true },
      { id: 2, name: "Living Room Feeder", isActive: false },
    ]);

    setPets([
      {
        id: 1,
        name: "Whiskers",
        breed: "Persian",
        currentWeight: 5.2,
        targetWeight: 4.5,
        feeder: { id: 1, name: "Kitchen Feeder", isActive: true },
      },
      {
        id: 2,
        name: "Mittens",
        breed: "Maine Coon",
        currentWeight: 6.8,
        targetWeight: 6.5,
        feeder: { id: 2, name: "Living Room Feeder", isActive: false },
      },
    ]);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-white">
      <nav className="bg-pink-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-pink-600">KatyFeeder</h1>
            <button
              onClick={() => {
                localStorage.removeItem("user");
                navigate("/login");
              }}
              className="text-pink-600 hover:text-pink-700 px-4 py-2 rounded-md
                border border-pink-200 hover:bg-pink-50 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {feeders.map((feeder) => (
            <div
              key={feeder.id}
              className="bg-white rounded-lg shadow-md border border-pink-100 p-6 hover:border-pink-200 transition-colors"
            >
              <h2 className="text-xl font-semibold text-pink-600 mb-4">
                {feeder.name}
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status</span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      feeder.isActive
                        ? "bg-pink-100 text-pink-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
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
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
