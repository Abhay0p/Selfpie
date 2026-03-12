export default function Tabs({ activeTab, setActiveTab }) {

  const tabStyle = "flex-1 py-2 rounded-full transition"

  const active = "bg-white shadow"

  return (

    <div className="bg-gray-200 rounded-full p-2 flex gap-2 mb-6">

      <button
        onClick={() => setActiveTab("inventory")}
        className={`${tabStyle} ${activeTab === "inventory" ? active : ""}`}
      >
        Inventory
      </button>

      <button
        onClick={() => setActiveTab("history")}
        className={`${tabStyle} ${activeTab === "history" ? active : ""}`}
      >
        History
      </button>

      <button
        onClick={() => setActiveTab("analytics")}
        className={`${tabStyle} ${activeTab === "analytics" ? active : ""}`}
      >
        Analytics
      </button>

      <button
        onClick={() => setActiveTab("flash")}
        className={`${tabStyle} ${activeTab === "flash" ? active : ""}`}
      >
        Flash Pickup
      </button>

      <button
        onClick={() => setActiveTab("settings")}
        className={`${tabStyle} ${activeTab === "settings" ? active : ""}`}
      >
        Settings
      </button>

    </div>
  )
}