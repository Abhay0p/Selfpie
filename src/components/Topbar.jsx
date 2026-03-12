export default function Topbar() {
  return (
    <div className="bg-green-600 text-white px-10 py-4 flex justify-between items-center">

      <div>
        <h1 className="font-bold text-lg">SELFPIE</h1>
        <p className="text-sm opacity-90">Shopkeeper Dashboard</p>
      </div>

      <button className="flex items-center gap-2">
        Logout
      </button>

    </div>
  )
}