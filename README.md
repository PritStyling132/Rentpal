# 🏠 **AllRentr – Peer-to-Peer Rental Marketplace for India**

> **AllRentr** is a modern **P2P rental platform** designed for the Indian market — connecting people who have items to rent with those who need them.
> From gadgets to furniture, vehicles to tools — AllRentr enables users to **earn from their unused items** and **discover affordable rentals nearby**.

Built using **React**, **TypeScript**, and **Supabase**, AllRentr delivers a **fast**, **secure**, and **real-time experience** across web and mobile devices.

---

## 🚀 **Key Features**


| Category                        | Description                                                                                 |
| ------------------------------- | ------------------------------------------------------------------------------------------- |
| 🧳**Listings & Rentals**        | Create, manage, and browse rental listings with photos, prices, and availability schedules. |
| 💬**Real-time Chat**            | WebSocket-powered instant messaging between renters and owners for seamless communication.  |
| 👤**User Profiles**             | Personalized dashboards with profile info, reviews, and rental activity tracking.           |
| 📰**Community Blog**            | Stay updated with announcements, user stories, and platform tips.                           |
| 🏆**Leaderboard**               | Discover the top-performing users based on engagement and rental activity.                  |
| 🔔**Notifications**             | Real-time notifications for messages, bookings, and payment updates.                        |
| 🎟️**Coupons & Rewards**       | Smart discount and promotional offer system for loyal users.                                |
| 💼**Packages & Subscriptions**  | Unlock exclusive features through flexible membership plans.                                |
| 🤝**Influencer Collaborations** | Partner program for creators to promote their listings and grow with the platform.          |
| 📍**Location-based Search**     | Geo-aware discovery system to find rentals closest to you using geohashing.                 |
| 💳**Secure Payments**           | Fully integrated with**Razorpay**for safe and smooth transactions.                          |
| 🔐**Social Authentication**     | Sign up and log in easily using Google and other OAuth providers.                           |

---

## 🧱 **Tech Stack Overview**

### 🎨 **Frontend**


| Technology                | Purpose                                           |
| ------------------------- | ------------------------------------------------- |
| **React 18**              | UI framework using hooks and concurrent features  |
| **TypeScript**            | Type-safe development for better scalability      |
| **Vite**                  | Fast development build tool                       |
| **Tailwind CSS**          | Utility-first CSS for custom design systems       |
| **shadcn/ui**             | Reusable, accessible UI components                |
| **React Router**          | Client-side routing for navigation                |
| **Framer Motion**         | Smooth animations and transitions                 |
| **React Query**           | Smart data fetching and caching                   |
| **React Hook Form + Zod** | Optimized forms with validation and schema safety |

---

### ⚙️ **Backend & Database**


| Technology                   | Purpose                                  |
| ---------------------------- | ---------------------------------------- |
| **Supabase (PostgreSQL)**    | Database with real-time subscriptions    |
| **RLS (Row Level Security)** | Fine-grained access control and policies |
| **Supabase Auth**            | Authentication and authorization layer   |
| **Supabase Storage**         | File uploads and CDN for media assets    |

---

### ⚡ **Real-time & Caching**


| Service                      | Role                                          |
| ---------------------------- | --------------------------------------------- |
| **Node.js WebSocket Server** | Enables live chat and instant updates         |
| **Upstash Redis**            | Manages caching, sessions, and message queues |

---

### 🧰 **Development Tools**


| Tool                       | Description                                    |
| -------------------------- | ---------------------------------------------- |
| **ESLint**                 | Code linting and formatting                    |
| **PostCSS + Autoprefixer** | Modern CSS compilation                         |
| **TypeScript ESLint**      | Type-aware linting for consistent code quality |

---

## 🧩 **Prerequisites**

Before starting, make sure you have:

* **Node.js v18+**
* **npm or yarn**
* **Git**

---

## ⚙️ **Getting Started**

### 💻 Frontend Setup

1. **Clone the repository**

   ```bash
   git clone <YOUR_GIT_URL>
   cd <YOUR_PROJECT_NAME>
   ```
2. **Install dependencies**

   ```bash
   npm install
   ```
3. **Setup environment variables**
   Create a `.env` file in the project root:

   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_WS_URL=ws://localhost:8080
   VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
   ```
4. **Run the development server**

   ```bash
   npm run dev
   ```

   App runs at → [http://localhost:8080](http://localhost:8080/)

---

### 🔌 Chat Server Setup

1. **Navigate to the server directory**

   ```bash
   cd server
   ```
2. **Install server dependencies**

   ```bash
   npm install
   ```
3. **Add environment variables**
   Create `.env` in `server/`:

   ```env
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   WS_PORT=8081
   ```
4. **Run the chat server**

   ```bash
   npm start
   ```

   or in dev mode:

   ```bash
   npm run dev
   ```

---

## 🧾 **Available Scripts**

### 🖥️ Frontend


| Command             | Description              |
| ------------------- | ------------------------ |
| `npm run dev`       | Start development server |
| `npm run build`     | Build for production     |
| `npm run build:dev` | Build for development    |
| `npm run preview`   | Preview production build |
| `npm run lint`      | Run ESLint checks        |

### ⚙️ Server


| Command       | Description                       |
| ------------- | --------------------------------- |
| `npm start`   | Start production WebSocket server |
| `npm run dev` | Start dev server with nodemon     |

---

## ☁️ **Deployment**

### 🌍 Frontend (Vercel)

1. Connect your GitHub repo to **Vercel**
2. Set the following **Environment Variables** in Vercel:
   ```env
   VITE_SUPABASE_URL
   VITE_SUPABASE_ANON_KEY
   VITE_WS_URL
   VITE_RAZORPAY_KEY_ID
   ```
3. Deploy — automatic builds trigger on every `main` branch push.

---

### 🧠 Chat Server Hosting

Deploy the server on your preferred **Node.js hosting platform**:


| Platform              | Notes                         |
| --------------------- | ----------------------------- |
| **Render**            | Simple and free-tier friendly |
| **Railway**           | Easy deployment from GitHub   |
| **Heroku**            | Rapid prototyping             |
| **DigitalOcean Apps** | Scalable production option    |

Be sure to configure `.env` variables in your hosting dashboard.

Note: We use **Render** to deploye our chat server

---

## 🧩 **Configuration Guide**

### 🔧 Supabase Setup

1. Create a new Supabase project
2. Run migration scripts from `/supabase/migrations`
3. Enable Google or OAuth providers under **Auth → Providers**
4. Create storage buckets for images and thumbnails
5. Define Row Level Security (RLS) policies for user isolation

---

### 🌿 **Environment Variables Overview**

#### Frontend `.env`

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_WS_URL=wss://your-chat-server.com
VITE_RAZORPAY_KEY_ID=rzp_test_...
```

#### Server `.env`

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
WS_PORT=8080
```


