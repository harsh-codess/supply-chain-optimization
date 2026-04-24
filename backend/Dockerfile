# ── Backend Dockerfile for Google Cloud Run ───────────────────────────────
FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Install dependencies first (layer caching)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY main.py .

# Cloud Run injects PORT env variable; default to 8080
ENV PORT=8080

# Expose port
EXPOSE 8080

# Run with uvicorn — bind to 0.0.0.0:$PORT
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT}"]
