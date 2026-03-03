#!/bin/bash
echo "Starting Django..."
cd /var/home/sizma86/Documents/GitHub/Learning_Efficiency2_0
python manage.py makemigrations
python manage.py migrate
python manage.py runserver &

echo "Starting React..."
cd /var/home/sizma86/Documents/GitHub/Learning_Efficiency2_0/frontend
npm run dev &

echo ""
echo "✅ Django  → http://localhost:8000"
echo "✅ React   → http://localhost:5173/live"
