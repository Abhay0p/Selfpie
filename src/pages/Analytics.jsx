import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";

import { Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  Tooltip,
  Legend
);

export default function Analytics() {

  const barData = {
    labels: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],
    datasets: [
      {
        label: "Sales",
        data: [4500,5200,4800,6100,7200,8500,7800],
        backgroundColor: "#7AAE5A",
        borderRadius: 8
      }
    ]
  };

  const doughnutData = {
    labels: ["Ice Cream","Dairy","Bakery","Grains","Vegetables"],
    datasets: [
      {
        data: [55,18,7,16,4],
        backgroundColor: [
          "#D7D2C6",
          "#6BAA4A",
          "#8BC26B",
          "#B9B4AA",
          "#333333"
        ],
        borderWidth: 0
      }
    ]
  };

  const barOptions = {
    responsive: true,

    animation: {
      duration: 1500,
      easing: "easeOutQuart"
    },

    animations: {
      y: {
        from: 0
      }
    },

    scales: {
      y: {
        beginAtZero: true
      }
    },

    plugins: {
      legend: {
        display: true
      }
    }
  };

  const donutOptions = {
    animation: {
      animateRotate: true,
      duration: 1500
    },

    plugins: {
      legend: {
        position: "top"
      }
    }
  };

  return (

    <div className="mt-6 space-y-6">

      {/* STAT CARDS */}

      <div className="grid grid-cols-4 gap-6">

        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-500 text-sm">Total Revenue</p>
          <h2 className="text-2xl font-semibold">₹0</h2>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-500 text-sm">Total Orders</p>
          <h2 className="text-2xl font-semibold">0</h2>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-500 text-sm">Products</p>
          <h2 className="text-2xl font-semibold">10</h2>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-500 text-sm">Total Stock</p>
          <h2 className="text-2xl font-semibold">468</h2>
        </div>

      </div>


      {/* CHARTS */}

      <div className="grid grid-cols-2 gap-6">

        {/* BAR CHART */}

        <div className="bg-white p-6 rounded-xl shadow">

          <div className="flex justify-between mb-4">

            <div>
              <h2 className="font-semibold">Sales Overview</h2>
              <p className="text-sm text-gray-500">
                Daily sales for the week
              </p>
            </div>

            <p className="text-sm text-gray-500">Daily</p>

          </div>

          <Bar
            key={Math.random()}
            data={barData}
            options={barOptions}
          />

        </div>


        {/* DONUT CHART */}

        <div className="bg-white p-6 rounded-xl shadow">

          <h2 className="font-semibold mb-1">
            Sales by Category
          </h2>

          <p className="text-sm text-gray-500 mb-4">
            Revenue distribution across categories
          </p>

          <div className="flex justify-center">

            <div className="w-[260px]">

              <Doughnut
                data={doughnutData}
                options={donutOptions}
              />

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}