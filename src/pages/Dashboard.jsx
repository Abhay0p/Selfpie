import { useState } from "react"
import Topbar from "../components/Topbar"
import Tabs from "../components/Tabs"
import ProductList from "../components/ProductList"
import PurchaseHistory from "./PurchaseHistory"
import Analytics from "./Analytics"
import FlashPickup from "./FlashPickup"

export default function Dashboard() {

  const [activeTab, setActiveTab] = useState("inventory")

  return (
    <div className="min-h-screen bg-[#e6e2d9]">

      <Topbar />

      <div className="max-w-6xl mx-auto mt-6">

        <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

        {activeTab === "inventory" && <ProductList />}

        {activeTab === "history" && <PurchaseHistory />}

        {activeTab === "analytics" && <Analytics />}

        {activeTab === "flash" && <FlashPickup />}

      </div>

    </div>
  )
}