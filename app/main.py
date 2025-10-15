from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import user_stats, revive_stats

# Initialize FastAPI application
app = FastAPI(
    title="Torn Tracker",
    description="User stat tracker for the Torn API, providing endpoints to fetch user data such as attacks, bars, battle stats, bounties, and cooldowns.",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Allow requests from localhost:3000
    allow_credentials=True,                   # Allow cookies and auth headers
    allow_methods=["GET"],                    # Allow only GET requests (based on router)
    allow_headers=["*"],                      # Allow all headers (e.g., Authorization, Accept)
)

# Include the Torn API router
app.include_router(user_stats.router)
app.include_router(revive_stats.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)