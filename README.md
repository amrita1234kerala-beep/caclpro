# CalcPro — React + FastAPI Calculator

A full-stack scientific calculator for deployment as a separate frontend and backend.

## Project structure

- `frontend/` — React + Vite application
- `backend/` — Python + FastAPI REST API

## 1. Run the backend

```bash
cd backend
python -m venv .venv
```

Windows:

```bash
.venv\Scripts\activate
```

macOS/Linux:

```bash
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start the API:

```bash
uvicorn main:app --reload
```

Backend runs at `http://localhost:8000`.

## 2. Run the frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the Vite URL shown in the terminal, normally `http://localhost:5173`.

The frontend defaults to `http://localhost:8000` for the API.

## 3. Deploy backend to Railway

Create a GitHub repository containing this project.

In Railway:
1. Create a new project.
2. Deploy from the GitHub repository.
3. Set the service root directory to `backend` if Railway asks for it.
4. Railway will use the `Procfile`, or you can set the start command to:
   `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Generate a public domain.
6. Test `<railway-domain>/health`.

## 4. Deploy frontend to Vercel

Import the same GitHub repository into Vercel.

Set the project root directory to `frontend`.

Build command:

```text
npm run build
```

Output directory:

```text
dist
```

Add this environment variable in Vercel:

```text
VITE_API_URL=https://YOUR-RAILWAY-DOMAIN
```

Redeploy.

The frontend will then call the separate Python backend.

## Important

For a production submission, replace the backend's `allow_origins=["*"]` with your exact Vercel URL after deployment, for example:

```python
allow_origins=["https://your-calculator.vercel.app"]
```

This project intentionally performs the calculation through the Python API rather than calculating the final answer only in the browser, so the separate backend requirement is demonstrable.
