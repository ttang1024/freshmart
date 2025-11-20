# E-commerce Project Setup Guide

## Woolworths-Style Online Grocery Store

This is a full-stack e-commerce application inspired by Woolworths, built with Next.js, Flask, and PostgreSQL.

## 🏗️ Architecture

-   **Frontend**: Next.js 14+ with React
-   **Backend**: Flask (Python) REST API
-   **Database**: PostgreSQL
-   **Styling**: Tailwind CSS

---

## 📋 Prerequisites

-   Node.js 18+ and npm
-   Python 3.9+
-   PostgreSQL 14+
-   Git

---

## 🚀 Installation & Setup

### 1. Database Setup (PostgreSQL)

```bash
# Install PostgreSQL (Ubuntu/Debian)
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib

# macOS with Homebrew
brew install postgresql@14
brew services start postgresql@14

# Create database and user
sudo -u postgres psql

# In PostgreSQL shell:
CREATE DATABASE ecommerce_db;
CREATE USER ecommerce_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE ecommerce_db TO ecommerce_user;
\q
```

```bash
# Run the schema file
psql -U ecommerce_user -d ecommerce_db -f schema.sql
```

### 2. Backend Setup (Flask)

```bash
# Create project directory
mkdir ecommerce-app
cd ecommerce-app

# Create backend directory
mkdir backend
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install flask flask-cors flask-sqlalchemy psycopg2-binary python-dotenv

# Create .env file
cat > .env << EOF
DATABASE_URL=postgresql://ecommerce_user:your_secure_password@localhost:5432/ecommerce_db
SECRET_KEY=your-secret-key-here-change-in-production
FLASK_ENV=development
EOF

# Save the Flask app as app.py (use the code provided above)

# Initialize database
flask init-db

# Run the Flask server
python app.py
```

The API will be available at `http://localhost:5000`

### 3. Frontend Setup (Next.js)

```bash
# Navigate back to project root
cd ..

# Create Next.js app
npx create-next-app@latest frontend --typescript --tailwind --app

cd frontend

# Install additional dependencies
npm install lucide-react

# Create .env.local file
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:5000/api
EOF

# Replace app/page.tsx with the React component code provided above

# Run the development server
npm run dev
```

The app will be available at `http://localhost:3000`

---

## 📁 Project Structure

```
ecommerce-app/
├── backend/
│   ├── venv/
│   ├── app.py
│   ├── .env
│   └── requirements.txt
├── frontend/
│   ├── app/
│   │   ├── page.tsx
│   │   └── layout.tsx
│   ├── public/
│   ├── .env.local
│   ├── package.json
│   └── tailwind.config.js
└── schema.sql
```

---

## 🔌 API Endpoints

### Categories

-   `GET /api/categories` - Get all categories
-   `POST /api/categories` - Create category

### Products

-   `GET /api/products` - Get all products (supports ?category=slug&search=term)
-   `GET /api/products/:id` - Get single product
-   `POST /api/products` - Create product
-   `PUT /api/products/:id` - Update product
-   `DELETE /api/products/:id` - Delete product

### Orders

-   `POST /api/orders` - Create order
-   `GET /api/orders/:id` - Get order details
-   `GET /api/users/:id/orders` - Get user orders

### Users

-   `POST /api/users/register` - Register new user
-   `POST /api/users/login` - Login user

---

## 🎨 Features Implemented

### Frontend (React/Next.js)

✅ Responsive design with Tailwind CSS
✅ Product grid with categories
✅ Search functionality
✅ Shopping cart with quantity management
✅ Category filtering
✅ Product cards with ratings
✅ Cart sidebar
✅ Header with navigation

### Backend (Flask)

✅ RESTful API architecture
✅ Database models with SQLAlchemy
✅ CRUD operations for products
✅ Order management
✅ User authentication (registration/login)
✅ Category management
✅ Stock management

### Database (PostgreSQL)

✅ Normalized schema
✅ Foreign key relationships
✅ Indexes for performance
✅ Triggers for timestamps
✅ Sample data seeding

---

## 🔄 Connecting Frontend to Backend

Update the Next.js component to connect to the real API:

```typescript
// In your Next.js page.tsx
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

useEffect(() => {
	// Fetch real products from API
	fetch(`${API_URL}/products`)
		.then(res => res.json())
		.then(data => setProducts(data))
		.catch(err => console.error('Error fetching products:', err))
}, [])
```

---

## 🧪 Testing the API

```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Get all products
curl http://localhost:5000/api/products

# Get products by category
curl http://localhost:5000/api/products?category=fruit-veg

# Search products
curl http://localhost:5000/api/products?search=banana

# Create a new product (POST with JSON)
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Product",
    "price": 9.99,
    "unit": "kg",
    "stock": 10,
    "category_id": 1
  }'
```

---

## 🚢 Production Deployment

### Backend (Flask)

1. Use Gunicorn as WSGI server: `pip install gunicorn`
2. Run with: `gunicorn -w 4 -b 0.0.0.0:5000 app:app`
3. Deploy to: Heroku, AWS, DigitalOcean, or Railway

### Frontend (Next.js)

1. Build: `npm run build`
2. Deploy to: Vercel, Netlify, or AWS Amplify

### Database

-   Use managed PostgreSQL: AWS RDS, Heroku Postgres, or DigitalOcean Managed Databases

---

## 🔐 Security Considerations

1. **Environment Variables**: Never commit `.env` files
2. **Password Hashing**: Already implemented with werkzeug
3. **CORS**: Configure properly for production
4. **SQL Injection**: Using SQLAlchemy ORM prevents this
5. **Input Validation**: Add validation middleware
6. **HTTPS**: Use SSL certificates in production
7. **Authentication**: Implement JWT tokens for sessions

---

## 📈 Future Enhancements

-   [ ] JWT authentication
-   [ ] Payment integration (Stripe/PayPal)
-   [ ] Email notifications
-   [ ] Product image uploads
-   [ ] Admin dashboard
-   [ ] Order tracking
-   [ ] Product recommendations
-   [ ] Reviews and ratings
-   [ ] Wishlist functionality
-   [ ] Delivery slot booking
-   [ ] Promotions and discounts
-   [ ] Mobile app (React Native)

---

## 🐛 Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Check connection
psql -U ecommerce_user -d ecommerce_db -h localhost
```

### CORS Errors

Ensure Flask-CORS is properly configured in `app.py`

### Port Already in Use

```bash
# Find and kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Or change port in Flask app
app.run(port=5001)
```

---

## 📚 Resources

-   [Next.js Documentation](https://nextjs.org/docs)
-   [Flask Documentation](https://flask.palletsprojects.com/)
-   [PostgreSQL Documentation](https://www.postgresql.org/docs/)
-   [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)

---

## 📝 License

This project is for educational purposes.
