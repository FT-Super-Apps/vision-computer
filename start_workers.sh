#!/bin/bash

# Start Celery workers for concurrent processing
# Run this in separate terminal or background

echo "Starting Celery workers..."

# Start worker with 4 concurrent workers
celery -A app.celery_app worker \
  --loglevel=info \
  --concurrency=4 \
  --pool=prefork \
  --queues=analysis,matching,bypass \
  --max-tasks-per-child=10 \
  --time-limit=600 \
  --soft-time-limit=540

# Alternative: Start with autoscale (min 2, max 8 workers)
# celery -A app.celery_app worker --loglevel=info --autoscale=8,2
