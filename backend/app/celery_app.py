#!/usr/bin/env python3
"""
Celery Application Configuration
Background task processing untuk concurrent operations
"""

from celery import Celery
import os

# Redis connection URL
REDIS_URL = os.getenv('REDIS_URL', 'redis://localhost:6379/0')

# Create Celery app
celery_app = Celery(
    'turnitin_bypass',
    broker=REDIS_URL,
    backend=REDIS_URL,
    include=['app.tasks']
)

# Celery configuration
celery_app.conf.update(
    # Task settings
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='Asia/Jakarta',
    enable_utc=True,

    # Task execution settings
    task_track_started=True,
    task_time_limit=600,  # 10 minutes max per task
    task_soft_time_limit=540,  # 9 minutes soft limit

    # Result backend settings
    result_expires=3600,  # Results expire after 1 hour
    result_backend_transport_options={
        'master_name': 'mymaster',
        'visibility_timeout': 3600,
    },

    # Worker settings
    worker_prefetch_multiplier=1,  # Only fetch 1 task at a time
    worker_max_tasks_per_child=50,  # Restart worker after 50 tasks

    # Task routing
    task_routes={
        'app.tasks.analyze_detect_flags_task': {'queue': 'analysis'},
        'app.tasks.match_flags_task': {'queue': 'matching'},
        'app.tasks.bypass_matched_flags_task': {'queue': 'bypass'},
        'app.tasks.process_document_unified_task': {'queue': 'unified'},  # Unified processing queue
    },
)

# Task annotations for progress tracking
celery_app.conf.task_annotations = {
    '*': {
        'rate_limit': '10/s',  # Max 10 tasks per second globally
    }
}

if __name__ == '__main__':
    celery_app.start()
