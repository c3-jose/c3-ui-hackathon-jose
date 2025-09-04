# C3 UI Hackathon - Wind Turbine Management Dashboard

This repository contains two frontend applications built for a Wind Turbine Management System, showcasing different modern web development approaches to create interactive dashboards for monitoring wind turbine fleets.

## 🚀 Projects Overview

### 📊 Dashboard Features (Both Projects)
- **Real-time Wind Turbine Monitoring**: Live fleet status and performance metrics
- **Interactive Maps**: Leaflet-based turbine location mapping
- **Power Output Analytics**: Charts and visualizations using D3.js
- **Fleet Management**: Add, view, and manage turbine information
- **Performance Reports**: Analytics dashboard with insights and trends
- **Responsive Design**: Modern UI components with TailwindCSS

---

## 🌟 Chema-Astro

A **Wind Turbine Management Dashboard** built with the Astro framework, combining the power of static site generation with interactive Svelte components.

### 🛠️ Technologies Used

- **[Astro](https://astro.build/)** `v5.13.5` - Modern static site generator with partial hydration
- **[Svelte](https://svelte.dev/)** `v5.38.6` - Component framework for interactive UI elements
- **[TailwindCSS](https://tailwindcss.com/)** `v4.1.12` - Utility-first CSS framework
- **[DaisyUI](https://daisyui.com/)** `v5.1.6` - TailwindCSS component library
- **[Skeleton UI](https://www.skeleton.dev/)** `v3.2.0` - Modern UI toolkit
- **[D3.js](https://d3js.org/)** `v7.9.0` - Data visualization library
- **[Leaflet](https://leafletjs.com/)** `v1.9.4` - Interactive map library
- **[Open Props](https://open-props.style/)** `v1.7.16` - CSS custom properties
- **[Sass](https://sass-lang.com/)** `v1.92.0` - CSS preprocessor
- **TypeScript** - Type safety and better developer experience

### 🚀 Getting Started

1. **Navigate to the project directory:**
   ```bash
   cd chema-astro
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:4321`

4. **Build for production:**
   ```bash
   npm run build
   ```

5. **Preview production build:**
   ```bash
   npm run preview
   ```

### 📁 Project Structure

```
chema-astro/
├── src/
│   ├── components/          # Svelte components
│   │   ├── charts/         # Chart components (D3.js)
│   │   └── ...             # Dashboard components
│   ├── layouts/            # Astro layouts
│   ├── pages/              # Astro pages (routes)
│   ├── stores/             # State management
│   ├── types/              # TypeScript definitions
│   ├── utils/              # Utility functions
│   └── styles/             # Global styles
├── public/                 # Static assets
└── package.json
```

---

## ⚡ Chema-SvelteKit

A **Wind Turbine Management System** built with SvelteKit, offering a full-stack approach with server-side rendering capabilities.

### 🛠️ Technologies Used

- **[SvelteKit](https://kit.svelte.dev/)** `v1.27.4` - Full-stack Svelte framework
- **[Svelte](https://svelte.dev/)** `v4.2.7` - Reactive component framework
- **[TypeScript](https://www.typescriptlang.org/)** `v5.0.0` - Type safety
- **[Vite](https://vitejs.dev/)** `v4.4.2` - Fast build tool and dev server
- **[Flowbite Svelte](https://flowbite-svelte.com/)** `v0.46.15` - Svelte components library
- **[D3.js](https://d3js.org/)** `v7.9.0` - Data visualization
- **[Leaflet](https://leafletjs.com/)** `v1.9.4` - Interactive maps
- **[Lucide Svelte](https://lucide.dev/)** `v0.542.0` - Beautiful icons
- **[Open Props](https://open-props.style/)** `v1.7.16` - CSS custom properties
- **[Sass](https://sass-lang.com/)** `v1.92.0` - CSS preprocessor
- **[Vitest](https://vitest.dev/)** `v0.34.0` - Fast unit testing
- **[Prettier](https://prettier.io/)** - Code formatting

### 🚀 Getting Started

1. **Navigate to the project directory:**
   ```bash
   cd chema-sveltekit
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`

4. **Build for production:**
   ```bash
   npm run build
   ```

5. **Preview production build:**
   ```bash
   npm run preview
   ```

6. **Run tests:**
   ```bash
   npm run test
   ```

7. **Format code:**
   ```bash
   npm run format
   ```

### 📁 Project Structure

```
chema-sveltekit/
├── src/
│   ├── lib/
│   │   ├── components/     # Reusable Svelte components
│   │   ├── stores.ts       # Global state management
│   │   ├── types.ts        # TypeScript definitions
│   │   └── api.ts          # API utilities
│   ├── routes/             # File-based routing
│   │   ├── +layout.svelte  # Root layout
│   │   ├── +page.svelte    # Home page
│   │   ├── dashboard/      # Dashboard routes
│   │   ├── windturbines/   # Turbine management
│   │   └── ...
│   ├── app.html            # App template
│   └── app.scss            # Global styles
├── static/                 # Static assets
└── package.json
```

---

## 🎯 Key Features Comparison

| Feature | Chema-Astro | Chema-SvelteKit |
|---------|-------------|-----------------|
| **Framework** | Astro + Svelte Islands | SvelteKit (Full-Stack) |
| **Rendering** | Static + Partial Hydration | SSR + Client-Side |
| **Routing** | File-based (Astro) | File-based (SvelteKit) |
| **State Management** | Nano Stores | Svelte Stores |
| **UI Components** | DaisyUI + Skeleton | Flowbite Svelte |
| **Development** | Astro Dev Server | Vite + SvelteKit |
| **Testing** | Not configured | Vitest |
| **Best For** | Content-heavy dashboards | Interactive web apps |

---

## 🌐 Live Demo Features

Both applications include:

- **📈 Dashboard**: Real-time metrics and KPIs
- **🗺️ Fleet Map**: Interactive turbine locations
- **📊 Analytics**: Power output charts and trends  
- **⚙️ Turbine Management**: Add, edit, view turbines
- **📋 Reports**: Performance and maintenance reports
- **🔔 Alerts**: System notifications and status updates

---

## 🛠️ Development

### Prerequisites
- **Node.js** (v16 or higher)
- **npm** or **yarn**

### Common Commands
```bash
# Install dependencies for both projects
cd chema-astro && npm install
cd ../chema-sveltekit && npm install

# Run both in development (in separate terminals)
cd chema-astro && npm run dev     # http://localhost:4321
cd chema-sveltekit && npm run dev # http://localhost:5173
```

---

## 📝 Notes

- Both projects are configured to work with a backend API for turbine data
- The Astro project uses port `4321` by default
- The SvelteKit project uses port `5173` by default
- Both include TypeScript support and modern development tooling

---

## 🤝 Contributing

Feel free to explore both implementations and see how the same features can be achieved using different modern web development approaches!
