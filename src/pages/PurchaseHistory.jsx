import { useState } from "react";

export default function PurchaseHistory() {

  const [activeTab, setActiveTab] = useState("all");

  return (
    <div className="bg-white rounded-2xl p-6 shadow-md mt-6">

      {/* Title */}
      <h2 className="text-lg font-semibold">
        Purchase History
      </h2>

      <p className="text-gray-500 text-sm mb-6">
        View all customer transactions
      </p>

      {/* Tabs */}
      <div className="bg-gray-300 p-1 rounded-full flex justify-between">

        <button
          onClick={() => setActiveTab("all")}
          className={`flex-1 py-2 rounded-full ${
            activeTab === "all" ? "bg-white shadow" : ""
          }`}
        >
          All Orders
        </button>

        <button
          onClick={() => setActiveTab("pickup")}
          className={`flex-1 py-2 rounded-full ${
            activeTab === "pickup" ? "bg-white shadow" : ""
          }`}
        >
          Pickup Orders
        </button>

        <button
          onClick={() => setActiveTab("scan")}
          className={`flex-1 py-2 rounded-full ${
            activeTab === "scan" ? "bg-white shadow" : ""
          }`}
        >
          In-Store Scan
        </button>

      </div>

      {/* Empty State */}
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">

        <div className="text-5xl mb-3">
          📦
        </div>

        <p>No orders yet</p>

      </div>

    </div>
  );
}