FROM python:3.12-slim AS base

WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

FROM base AS builder

COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir --prefix=/install -r requirements.txt

FROM base
COPY --from=builder /install /usr/local
COPY app/ ./app/

# Expose port
EXPOSE 8122

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8122", "--reload"]