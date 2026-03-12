const products = [
  {
    name: "Fresh Milk",
    category: "Dairy",
    price: 60,
    stock: 50,
    code: "8901234567890",
  },
  {
    name: "Whole Wheat Bread",
    category: "Bakery",
    price: 40,
    stock: 30,
    code: "8901234567891",
  },
  {
    name: "Organic Eggs",
    category: "Dairy",
    price: 80,
    stock: 40,
    code: "8901234567892",
  },
  {
    name: "Basmati Rice 1kg",
    category: "Grains",
    price: 120,
    stock: 100,
    code: "8901234567893",
  },
];

export default function ProductList() {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-md mt-6">

      {/* Top Section */}
      <div className="flex justify-between items-center">

        <div>
          <h2 className="text-lg font-semibold">
            Inventory Management
          </h2>

          <p className="text-gray-500 text-sm">
            Manage your shop's products and stock
          </p>
        </div>

        <button className="bg-green-600 text-white px-4 py-2 rounded-lg">
          + Add Product
        </button>

      </div>

      {/* Search + Filter */}
      <div className="flex justify-between items-center mt-6">

        <input
          type="text"
          placeholder="Search by name or barcode..."
          className="border border-gray-300 p-3 rounded-lg w-[60%]"
        />

        <select className="border border-gray-300 p-3 rounded-lg">
          <option>All Categories</option>
          <option>Dairy</option>
          <option>Bakery</option>
          <option>Grains</option>
        </select>

      </div>

      {/* Product Cards */}
      <div className="mt-6 space-y-4">

        {products.map((p, i) => (
          <div
            key={i}
            className="border border-gray-200 rounded-xl p-5 flex justify-between items-center hover:shadow-sm"
          >

            <div>

              <h3 className="font-semibold text-lg">
                {p.name}
              </h3>

              <div className="flex items-center gap-3 mt-2 text-sm text-gray-600">

                <span className="bg-gray-200 px-3 py-1 rounded-md text-xs">
                  {p.category}
                </span>

                <span>₹{p.price}</span>

                <span>Stock: {p.stock}</span>

                <span className="text-gray-400">
                  {p.code}
                </span>

              </div>

            </div>

            <div className="flex gap-5 text-lg">

              <button>✏️</button>

              <button className="text-red-500">
                🗑
              </button>

            </div>

          </div>
        ))}

      </div>

    </div>
  );
}