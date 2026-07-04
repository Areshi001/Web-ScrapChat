# Web ScrapChat: Rationale & Architecture

Hey there! If you are looking at the files and wondering why things are structured the way they are, here is a quick, human-friendly breakdown of what we used, how they fit together, and the reasoning behind these design choices.

---

## 🛠️ The Core Stack (And Why We Chose It)

### 1. The Split: Client & Server (`client/` and `server/`)
We separated the application into a frontend React web app (`client`) and a Python backend API (`server`). 
- **Why?** It keeps things modular. If you ever want to build a mobile app in the future, you can point it to the exact same backend API without changing a line of server code. It also allows us to host them on separate optimized nodes (e.g., static frontend hosting vs. dynamic backend compute).

### 2. Next.js + Tailwind (Frontend)
The frontend uses Next.js (React framework) and Tailwind CSS.
- **Why?** Next.js gives us a production-ready environment right out of the box with built-in TypeScript support and optimization. We used custom CSS and Tailwind to build a premium glassmorphic dark theme. It makes the app feel responsive and "alive" with smooth animations.

### 3. FastAPI + LangGraph (Backend)
The backend is built in Python using FastAPI and LangGraph.
- **Why FastAPI?** It is incredibly fast, writes automatic documentation (OpenAPI), and natively supports asynchronous endpoints, which is crucial for handling multiple concurrent streams.
- **Why LangGraph?** Instead of just sending a prompt to an AI model, we wanted a structured agent loop. LangGraph allows us to build stateful multi-step cycles:
  1. The user sends a message.
  2. The LLM decides whether to respond directly or call tools (like Tavily Search).
  3. If search is needed, the graph triggers the search tool, consumes the data, and returns to the LLM to write the final answer.

---

## 📡 Communication: Server-Sent Events (SSE)
Instead of standard HTTP requests (which make the user wait 10 seconds for the search and synthesis to finish), we used **Server-Sent Events (SSE)**.
- **Why?** It allows us to stream updates to the frontend in real time. The moment the backend gets a search result, it pushes a status update (`searching`, `reading`). As the LLM writes the answer word-by-word, it streams the content immediately, creating that fast, modern "typing" effect.

---

## 🔐 Credentials & Token Control
We implemented two key features for self-credit efficiency:
- **Token budget limits**: Standard users are capped at 15,000 tokens per session to prevent accidental API bills.
- **Custom configurations**: Users can input their own OpenRouter / Tavily API keys in a settings modal. When provided, the frontend passes these credentials securely as query parameters to the backend, which overrides the server keys dynamically. This allows you to host the project publicly without paying for other people's searches.

---

## 📦 Containerization & Deployment: Docker + Render
Both the client and server have their own `Dockerfile`, orchestrated globally by `docker-compose.yml` and `render.yaml`.
- **Why Docker?** It ensures that "it works on my machine" applies everywhere. It bundles all node modules and python libraries into a clean, reproducible container.
- **Why Next.js Standalone Build?** In `client/Dockerfile`, we use Next.js's `standalone` output mode. It builds a highly compressed server bundle, reducing the Docker image size from ~1GB to just ~120MB, speeding up deployments on Render.
- **Why `render.yaml`?** We wrote a Render blueprint definition. You just link your repository to Render, and it spins up the FastAPI backend and Next.js frontend automatically. The frontend's API URL is dynamically mapped to the backend's public domain at build time.
