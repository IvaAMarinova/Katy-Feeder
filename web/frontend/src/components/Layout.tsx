import React from "react";
import { useNavigate } from "react-router-dom";

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <nav className="bg-pink-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <h1
                onClick={() => navigate("/dashboard")}
                className="text-2xl font-bold text-pink-600 cursor-pointer"
              >
                KatyFeeder
              </h1>
              {title && (
                <>
                  <span className="text-gray-300">/</span>
                  <h2 className="text-lg text-pink-500">{title}</h2>
                </>
              )}
            </div>
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

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-8">{children}</main>

      {/* Footer */}
      <footer className="bg-pink-50 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-pink-600">
            © {new Date().getFullYear()} KatyFeeder - All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
