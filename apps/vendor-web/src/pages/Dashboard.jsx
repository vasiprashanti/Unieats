import React, { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";

export default function VendorStatus() {
  const [status, setStatus] = useState("pending");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    const fetchStatus = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) throw new Error("User not logged in");

        const token = await user.getIdToken();

        const response = await fetch(`${API_BASE_URL}/api/v1/vendors/vendorStatus`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("Fetch response:", response);

        if (!response.ok) {
          const text = await response.text();
          console.error("Failed to fetch vendor status:", text);
          throw new Error("Failed to fetch vendor status");
        }

        const data = await response.json();
        console.log("Vendor Status Data:", data);

        if (active) setStatus(data.status ?? "pending");
      } catch (err) {
        console.log("Error Occurred-", err);
        if (active) setError("Failed to fetch vendor status.");
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchStatus();

    return () => {
      active = false;
    };
  }, []);

  const getStatusStyles = () => {
    switch (status) {
      case "approved":
        return {
          bg: "bg-green-50",
          border: "border-green-200",
          text: "text-green-800",
          icon: "bg-green-100 text-green-600"
        };
      case "rejected":
        return {
          bg: "bg-red-50",
          border: "border-red-200",
          text: "text-red-800",
          icon: "bg-red-100 text-red-600"
        };
      case "pending":
      default:
        return {
          bg: "bg-yellow-50",
          border: "border-yellow-200",
          text: "text-yellow-800",
          icon: "bg-yellow-100 text-yellow-600"
        };
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case "approved":
        return "Your application has been approved!";
      case "rejected":
        return "Your application has been rejected.";
      case "pending":
      default:
        return "Your application is under review by the admin.";
    }
  };

  const styles = getStatusStyles();

  return (
    <div className="p-4 md:p-6 text-[hsl(var(--foreground))]">
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }
        
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out;
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .hover-lift {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .hover-lift:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
        
        .image-glow {
          position: relative;
          overflow: hidden;
        }
        
        .image-glow::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(
            to bottom right,
            rgba(255, 255, 255, 0.3),
            rgba(255, 255, 255, 0.1),
            transparent
          );
          animation: shimmer 3s infinite;
        }
      `}</style>
      
      <div className={`rounded-3xl border ${styles.border} ${styles.bg} p-6 shadow-lg text-center animate-fade-in-up hover-lift`}>
        {loading ? (
          <p className="text-sm text-muted">Loading status...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className={`${styles.icon} rounded-full p-3 w-16 h-16 flex items-center justify-center animate-float`}>
              {status === "approved" && (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {status === "rejected" && (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              {status === "pending" && (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
            <div>
              <p className={`text-lg font-semibold ${styles.text}`}>
                {getStatusMessage()}
              </p>
              <p className="text-sm text-gray-600 mt-1 capitalize">
                Status: {status}
              </p>
            </div>
          </div>
        )}
      </div>
      
      {!loading && !error && (
        <div className="mt-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="rounded-3xl overflow-hidden shadow-xl hover-lift image-glow border border-gray-200 bg-white">
            <img 
              src="https://i.postimg.cc/k5yMpRt8/Whats-App-Image-2025-10-10-at-22-34-27-61235788.jpg"
              alt="Vendor illustration"
              className="w-full h-auto object-cover"
              style={{ 
                transition: 'transform 0.5s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            />
          </div>
        </div>
      )}
    </div>
  );
}