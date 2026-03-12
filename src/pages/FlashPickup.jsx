export default function FlashPickup() {

  return (

    <div className="mt-6 space-y-6 pb-24">

      {/* REQUEST CARD */}

      <div className="bg-white rounded-xl shadow-md p-8">

        <div className="flex justify-between items-start">

          <div>

            <h2 className="font-semibold text-lg">
              Flash Pickup Requests
            </h2>

            <p className="text-gray-500 text-sm mt-1">
              Customer list uploads via camera - AI scanned orders
            </p>

          </div>

          {/* CAMERA BUTTON */}

          <div className="bg-green-100 text-green-600 w-12 h-12 flex items-center justify-center rounded-full">
            📷
          </div>

        </div>


        {/* EMPTY STATE */}

        <div className="flex flex-col items-center justify-center py-20 text-center">

          <div className="text-6xl text-gray-400">
            📷
          </div>

          <p className="mt-4 font-medium text-gray-700">
            No flash pickup requests yet
          </p>

          <p className="text-gray-500 text-sm mt-1">
            Customers can upload their shopping list using the camera
          </p>

        </div>

      </div>


      {/* HOW IT WORKS CARD */}

      <div className="bg-green-50 border border-green-100 rounded-xl p-8 flex gap-6">

        {/* ICON */}

        <div className="bg-green-500 text-white w-12 h-12 flex items-center justify-center rounded-full text-xl">
          📷
        </div>


        {/* TEXT */}

        <div>

          <h3 className="font-semibold text-lg mb-3">
            How Flash Pickup Works
          </h3>

          <ul className="space-y-2 text-gray-600 text-sm">

            <li>• Customers upload their shopping list via camera</li>
            <li>• AI scans and converts image to text</li>
            <li>• Customers can edit the list before submitting</li>
            <li>• You receive the request and prepare the order</li>
            <li>• Customer picks up within an hour</li>

          </ul>

        </div>

      </div>

    </div>

  )

}