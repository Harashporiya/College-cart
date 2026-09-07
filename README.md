# 🛒 College Cart

College Cart is a secure, student-exclusive online marketplace designed
specifically for college campuses.\
It enables verified college students to **buy, sell, and exchange
items** safely within their university community.

🔗 **Live Website:** https://college-cart.netlify.app

---

## 📌 Project Overview

College students often face challenges in finding a trusted platform to
buy or sell items and exchange books within their campus.\
College Cart solves this problem by allowing access **only to verified
college students** and providing built-in features such as real-time
chat, online payments, book exchange, cart management, and AI
assistance.

---

## 🔐 Student-Only Authentication

-   Only students with a valid college email ID ending with:

        @chitkarauniversity.edu.in

-   Verified students can:

    -   Create an account
    -   Log in
    -   Access all marketplace features

-   This ensures:

    -   Authentic users
    -   Safe transactions
    -   A trusted campus-only environment

---

## 🛍 Products Marketplace (Buy Items)

-   Dedicated **Products Page** displays all listed products
-   Users can:
    -   View product details
    -   Chat with sellers using the built-in chat system
-   Buyers may:
    -   Pay online via **Razorpay**
    -   Meet offline and pay in person

---

## 💬 Built-in Chat Application

-   Real-time chat between buyers and sellers
-   Enables:
    -   Price negotiation
    -   Product inquiries
    -   Payment and meet-up coordination

---

## 📦 Sell Products (List & Manage Items)

-   Sellers can add products through:
    -   Sidebar **Add Product** page
    -   **Profile Section**
-   Product details can be updated anytime to improve visibility and
    sales

---

## 📚 Book Exchange System

-   Exclusive **Book Exchange** feature
-   Users can:
    -   List books for exchange
    -   Send and receive exchange requests
-   Requests and acknowledgements appear in:
    -   Profile Section
    -   Settings tab

📌 *Only books are allowed for exchange.*

---

## 🧾 Supported Categories

-   Electronics
-   Groceries
-   Sports Equipment
-   Books
-   Clothing

---

## 🤖 AI Assistant Bot

-   AI-powered assistant helps with:
    -   Product queries
    -   Website navigation
    -   General assistance
-   Product listings are indexed into a **Pinecone** vector store so the
    assistant can answer questions about what is actually for sale

---

## 🛒 Cart & Payments

-   Cart page shows:
    -   Selected items
    -   Final price
-   Payments supported via **Razorpay**

---

## 🛠 Tech Stack

### Frontend
- React 18 (Vite)
- Tailwind CSS + CSS Modules
- Redux Toolkit & Redux-Saga
- React Router
- Framer Motion

### Backend
- Node.js
- Express.js
- JWT authentication (httpOnly cookie + bearer token)

### Database
- MongoDB (Mongoose)

### Integrations & Services
- Razorpay (Payments)
- Socket.io (Real-time Chat)
- Cloudinary (Image Uploads)
- Nodemailer (Email Notifications)
- Google Gemini API (AI Assistant)
- Pinecone (Vector search for the AI Assistant)

### Deployment
- Frontend deployed on Netlify
- Backend deployed on Render

---

## 📁 Project Structure

```
College-cart/
├── Backend/                    # Express API
│   ├── Config/                 # Cloudinary, Multer, Pinecone and prompt config
│   ├── Controllers/            # Route handlers
│   ├── Model/                  # Mongoose schemas and indexes
│   ├── Routes/                 # Express routers
│   ├── Token/                  # JWT signing
│   ├── db/                     # MongoDB connection
│   ├── middleware/             # Auth and request validation
│   ├── services/               # RAG service for the AI assistant
│   ├── util/                   # Cookies and mail templates
│   └── server.js               # Entry point
│
└── Frontend/College_Cart/      # React app (Vite)
    ├── scripts/                # Build-time image optimiser
    └── src/
        ├── Components/         # Feature folders (Home, Product, Cart, Profile, ...)
        ├── Components/ui/      # Shared primitives (skeletons)
        ├── styles/             # Global keyframes
        ├── util/               # Auth, token, scroll and warm-up helpers
        └── index.css           # Design tokens and base styles
```

---

## 💻 Local Setup

**Requirements:** Node.js 18 or newer, npm, and a MongoDB connection string.

### 1. Clone the repository

```bash
git clone https://github.com/Harashporiya/College-cart.git
cd College-cart
```

### 2. Configure the backend

Create `Backend/.env`:

```env
PORT=3000
MONGODB_URI=<your MongoDB connection string>
JWT_SECRET=<any long random string>

# Cloudinary (image uploads)
CLOUD_NAME=<cloudinary cloud name>
CLOUD_API_KEY=<cloudinary api key>
CLOUD_API_SECRET=<cloudinary api secret>

# Email (password reset / notifications)
EMAIL_USER=<gmail address>
EMAIL_PASS=<gmail app password>

# Payments
RAZORPAY_KEY_ID=<razorpay key id>
RAZORPAY_KEY_SECRET=<razorpay key secret>

# AI assistant
GEMINI_API_KEY=<google gemini api key>
PINECONE_API_KEY=<pinecone api key>
PINECONE_INDEX_NAME=<pinecone index name>

# Allowed frontend origins for CORS
FRONTEND_URL=http://localhost:5173
```

### 3. Configure the frontend

Create `Frontend/College_Cart/.env`:

```env
VITE_BACKEND_API_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000
VITE_RAZORPAY_KEY_ID=<razorpay key id>
```

> `.env` files are gitignored. Never commit real keys — if one is ever
> pushed, rotate it rather than only deleting the file.

### 4. Install and run the backend

```bash
cd Backend
npm install
npm start
```

The API starts on `http://localhost:3000` (nodemon, restarts on change).
`PORT` is optional — `server.js` falls back to 3000.

### 5. Install and run the frontend

In a second terminal:

```bash
cd Frontend/College_Cart
npm install
npm run dev
```

The app is served at `http://localhost:5173`.

---

## 📜 Available Scripts

### Frontend (`Frontend/College_Cart`)

| Script | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server with HMR |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint over the project |
| `npm run optimize:images` | Re-encode `src/assets` images to WebP |

### Backend (`Backend`)

| Script | Description |
| --- | --- |
| `npm start` | Start the API with nodemon |

---

## ⚡ Build & Performance Notes

Useful context if you are working on the frontend:

- **Routes are lazily loaded** in `src/App.jsx`, and Vite splits the
  React and Redux vendor bundles separately so they stay cached across
  deploys.
- **`console.log` is stripped from production builds** (see
  `vite.config.js`). `console.error` and `console.warn` are kept
  deliberately, so real failures still surface in a deployed build.
- **Images ship as WebP.** `npm run optimize:images` regenerates them and
  keeps the full-resolution originals in `src/assets/.originals/`, which
  is gitignored — commit only the optimised output.
- **Shared layout tokens** live in `src/index.css`. The sidebar width in
  particular is the `--cc-drawer-w` custom property, read by both the
  sidebar and the header so the logo stays aligned to the drawer edge.
- **Keyframes are global.** CSS Modules rewrite `animation-name` to a
  hashed local name, so animations must be defined in
  `src/styles/keyframes.css` and imported, not declared inside a module.
- **Netlify SPA routing** is handled by `netlify.toml`, which rewrites all
  paths to `index.html`.

---

## 🌱 Future Enhancements
- [ ] **Advanced Filtering:** Search by price range and item condition.
- [ ] **Real-Time Notifications:** Push alerts for new chat messages.
- [ ] **Admin Dashboard:** Tools for moderating campus listings.
- [ ] **Mobile App:** Expanding accessibility via React Native.
