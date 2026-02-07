# DiaBeatIt 🥗

DiaBeatIt is a personalized meal planning application designed specifically for diabetic patients. Powered by Google's Gemini AI, it helps users manage their nutrition by calculating health metrics, providing AI-driven dietary advice, and generating low-GI meal plans.

## 🚀 Features

- **🧮 Personalized Health Metrics**: Calculate BMR, TDEE, and precise nutritional targets (carbs, protein, sodium) based on user profile and diabetic type.
- **💬 AI Nutritionist**: A Gemini-powered chat interface that understands your cravings and suggests appropriate low-GI recipes.
- **📋 Smart Meal Planning**: Generate daily and weekly meal plans that adhere to your nutritional constraints and personal preferences.
- **🥗 Low GI Recipe Database**: Access a curated collection of diabetic-friendly recipes with full nutritional breakdowns.
- **📊 Interactive Dashboard**: Monitor your health metrics and manage your meal plans through a clean, modern interface.

## 🛠️ Tech Stack

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python)
- **AI**: [Google Gemini AI](https://ai.google.dev/)
- **Database**: SQLite with SQLAlchemy ORM
- **Validation**: Pydantic

### Frontend
- **Framework**: [React](https://react.dev/) (Vite)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **HTTP Client**: Axios

## 📋 Prerequisites

- Python 3.9+
- Node.js 18+
- [Google Gemini API Key](https://aistudio.google.com/app/apikey)

## ⚙️ Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/diabeatit_app.git
cd diabeatit_app
```

### 2. Backend Setup
```bash
# Create a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create a .env file in the root directory
echo "GEMINI_API_KEY=your_api_key_here" > .env
echo "DATABASE_URL=sqlite:///./diabeatit.db" >> .env
echo "ALLOWED_ORIGINS=http://localhost:5173" >> .env
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

## 🏃 Running the Application

### Start the Backend
From the root directory:
```bash
# Using the python module
python -m app.main

# Or using uvicorn directly
uvicorn app.main:app --reload
```
The API will be available at `http://localhost:8000` and Swagger docs at `http://localhost:8000/docs`.

### Start the Frontend
From the `frontend` directory:
```bash
npm run dev
```
The application will be available at `http://localhost:5173`.

## 📁 Project Structure

```text
diabeatit_app/
├── app/                # Backend FastAPI application
│   ├── agents/         # AI Agents (Gemini integration)
│   ├── api/            # API Routes
│   ├── database/       # Database connection & schema
│   ├── models/         # Pydantic & SQLAlchemy models
│   ├── services/       # Business logic & repositories
│   └── main.py         # Entry point
├── frontend/           # React Frontend
│   ├── src/
│   │   ├── components/ # UI Components
│   │   ├── hooks/      # Custom React hooks
│   │   └── services/   # API service layer
├── tests/              # Backend tests
└── requirements.txt    # Python dependencies
```

## 📝 License
This project is licensed under the MIT License - see the LICENSE file for details.
