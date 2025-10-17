FROM python:3.12-slim AS base

WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Step 1: Install build dependencies
FROM base AS builder
RUN apt-get update && apt-get install -y --no-install-recommends build-essential

# Step 2: Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir --prefix=/install -r requirements.txt

# Step 3: Final image, only runtime dependencies
FROM base
COPY --from=builder /install /usr/local
COPY app/ ./app/

# Expose port
EXPOSE 8122

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8122", "--reload"]