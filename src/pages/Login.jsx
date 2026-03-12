import { useState } from "react"
import { useNavigate } from "react-router-dom"

export default function Login() {

  const [aadhaar, setAadhaar] = useState("")
  const [error, setError] = useState("")

  const navigate = useNavigate()

  const handleLogin = () => {

    if (aadhaar.length !== 12) {
      setError("Aadhaar must be 12 digits")
      return
    }

    setError("")
    
    // future: backend verification
    navigate("/dashboard")
  }

  return (
    <div className="min-h-screen bg-[#e6e2d9] flex flex-col items-center justify-center">

      {/* Title */}
      <h1 className="text-4xl font-bold text-green-600 tracking-wide">
        SELFPIE
      </h1>

      <p className="text-gray-600 mt-2 mb-8">
        Universal Self Checkout
      </p>

      {/* Login Card */}
      <div className="bg-white w-[420px] rounded-2xl shadow-md p-8">

        <h2 className="text-xl font-semibold">
          Welcome Back
        </h2>

        <p className="text-gray-500 mt-1 mb-6">
          Login as Shopkeeper
        </p>

        {/* Aadhaar Input */}
        <label className="block text-sm font-medium mb-2">
          Aadhaar Number
        </label>

        <input
          type="text"
          value={aadhaar}
          onChange={(e) => setAadhaar(e.target.value)}
          placeholder="Enter 12-digit Aadhaar number"
          className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500"
        />

        {/* Error */}
        {error && (
          <p className="text-red-500 text-sm mt-2">
            {error}
          </p>
        )}

        <p className="text-xs text-gray-500 mt-2">
          Linked with DigiLocker for verification
        </p>

        {/* Login Button */}
        <button
          onClick={handleLogin}
          className="w-full mt-6 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition"
        >
          Login with Aadhaar
        </button>

        <p className="text-xs text-gray-500 text-center mt-6">
          By continuing, you agree to our Terms & Privacy Policy
        </p>

      </div>

    </div>
  )
}