#  SELFPIE: Universal Self-Checkout & Flash Pickup

**SELFPIE** is a full-stack solution designed to eliminate checkout queues in the Indian retail market. It offers two primary modes: **Flash Pickup** for remote ordering via handwritten lists and **In-Store Self-Checkout** for scanning barcodes on the go.

---

##  Core Features

###  Flash Pickup
* **OCR Digitization:** Snap a photo of a handwritten grocery list (Hindi/English).
* **Automated Matching:** Uses **Tesseract.js** to convert image text into a digital cart.
* **Inventory Link:** Matches list items with the store's real-time inventory.
* **Demand Send:** Send your order to the shopkeeper before leaving home.

###  In-Store Self-Checkout
* **Mobile Scanning:** Phone camera acts as a barcode scanner while shopping in the aisles.
* **Live Cart:** Real-time total amount updates as products are scanned.
* **Skip the Queue:** Pay digitally and generate a secure exit QR code.

###  Shop Discovery
* **Geolocation:** Finds nearest registered shops using MongoDB **2dsphere** geospatial indexing.
* **Distance Tracking:** Real-time KM distance from the user's current location.

---

##  Technical Stack

* **Frontend:** React.js, Vite, Tailwind CSS, Lucide React.
* **Backend:** Node.js, Express.js.
* **Database:** MongoDB Atlas.
* **Tools:** Tesseract.js (OCR), React-QR-Barcode-Scanner.

---

##  Project Structure

```text
PROJECT-SELFPIE/
├── selfpie-backend/           
│   ├── src/
│   │   ├── config/          # Database connection & Environment configs
│   │   ├── controllers/     # Logic for Orders, Products, and Shops
│   │   ├── middleware/      # Auth (JWT) & Error handling
│   │   ├── models/          # Mongoose Schemas (Shop, Product, Order)
│   │   ├── routes/          # Clean API endpoints (e.g., /api/v1/orders)
│   │   └── services/        # External logic (UPI Integration, SMS, OCR)
│   ├── .env                 # Secret Keys (Don't push to GitHub!)
│   ├── seed.js              # Development data script
│   └── server.js            # Minimalistic entry point
├── selfpie-frontend/          
│   ├── src/
│   │   ├── api/             # Axios instances & API call central (Industry Standard)
│   │   ├── components/      
│   │   │   ├── common/      # Reusable UI (Buttons, Inputs, Loaders)
│   │   │   ├── shop/        # ShopDiscovery, InventoryGrid
│   │   │   └── checkout/    # Tesseract, HandoverScanner, Summary
│   │   ├── hooks/           # Custom React hooks (e.g., useGeolocation, useOrderPoller)
│   │   ├── store/           # Global state (Redux or Zustand)
│   │   ├── layouts/         # Navbar/Footer wrappers
│   │   └── utils/           # Helper functions (Currency formatter, Date logic)
│   ├── App.jsx              # Main Router & Global Providers
│   └── main.jsx             
└── README.md                # Professional Documentation
