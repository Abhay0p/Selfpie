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
d:\ProjectSelfpie\
├── 📁 backend\
│   ├── 📁 controllers\
│   │   ├── SpAbhay_aiMatcher.js
│   │   ├── SpAbhay_authController.js
│   │   └── SpAbhay_coreController.js
│   ├── 📁 middleware\
│   │   └── SpAbhay_requireAuth.js
│   ├── 📁 models\
│   │   ├── SpAbhay_Item.js
│   │   ├── SpAbhay_Order.js
│   │   └── SpAbhay_User.js
│   ├── 📁 routes\
│   │   ├── SpAbhay_authRoutes.js
│   │   └── SpAbhay_coreRoutes.js
│   ├── 📁 sockets\
│   │   └── SpAbhay_socketManager.js
│   ├── .env
│   ├── Dockerfile
│   ├── out.txt
│   ├── package.json
│   ├── package-lock.json
│   ├── seed.js
│   ├── server.js
│   ├── test_ai.js
│   └── test_barcode.js
│
├── 📁 frontend\
│   ├── 📁 public\
│   ├── 📁 src\
│   │   ├── 📁 assets\
│   │   ├── 📁 components\
│   │   │   ├── SpAbhay_ActiveCart.jsx
│   │   │   ├── SpAbhay_BarcodeScanner.jsx
│   │   │   ├── SpAbhay_CustomerDashboard.jsx
│   │   │   ├── SpAbhay_ManualItemSelection.jsx
│   │   │   ├── SpAbhay_MerchantDashboard.jsx
│   │   │   ├── SpAbhay_OrderChat.jsx
│   │   │   ├── SpAbhay_SmartScanner.jsx
│   │   │   └── SpAbhay_StoreCheckIn.jsx
│   │   ├── 📁 hooks\
│   │   │   ├── useCustomerAuth.js
│   │   │   ├── useMerchantAuth.js
│   │   │   └── useMerchantOrders.js
│   │   ├── 📁 store\
│   │   │   └── SpAbhay_useCartStore.js
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── config.js
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .gitignore
│   ├── Dockerfile
│   ├── README.md
│   ├── build.log
│   ├── build.txt
│   ├── build2.txt
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── .gitignore
├── docker-compose.yml
├── package.json
├── package-lock.json
└── README.md

