# Backend

## Install Dependencies

```bash
pip3 install -r requirements.txt
```

## Connect Database

## CORS Error Troubleshooting Guide

### ✅ Solution 1: Update Flask CORS Configuration (RECOMMENDED)

#### Step 1: Install Flask-CORS

```bash
pip install flask-cors
```

#### Step 2: Update Your `app.py`

Replace the CORS configuration at the top of your file:

```python
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)

# Configure CORS properly
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})

# Rest of your app configuration...
```

#### Step 3: Restart Flask Server

```bash
# Stop the current server (Ctrl+C)
# Then restart it
python app.py
```

---

### ✅ Solution 2: Alternative CORS Configuration

If Solution 1 doesn't work, try this more permissive configuration (development only):

```python
from flask import Flask
from flask_cors import CORS

app = Flask(__name__)

# Allow all origins (DEVELOPMENT ONLY)
CORS(app, origins="*",
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
     allow_headers=["Content-Type"])
```

---

### ✅ Solution 3: Manual CORS Headers

Add manual CORS headers to your Flask app:

```python
from flask import Flask, jsonify, request

app = Flask(__name__)

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response

# Add OPTIONS handler for preflight requests
@app.route('/api/<path:path>', methods=['OPTIONS'])
def handle_options(path):
    response = jsonify({'status': 'ok'})
    response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response, 200
```

---

### ✅ Solution 4: Check Frontend Configuration

#### Update Next.js Environment Variables

Create or update `.env.local` in your Next.js project:

```bash
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

#### Update Your API Calls

Make sure you're using the correct URL:

```javascript
// Correct
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

// Use it in fetch
fetch(`${API_URL}/products`)
	.then(res => res.json())
	.then(data => console.log(data))
	.catch(err => console.error('Error:', err))
```

---

### ✅ Solution 5: Check Flask Server Status

#### Verify Flask is Running

```bash
# Check if Flask is running on port 5000
lsof -i :5000

# Or use curl to test
curl http://localhost:5000/api/health
```

#### Expected Response

```json
{
	"status": "healthy",
	"message": "API is running"
}
```

### Backend (`app.py`)

```python
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)

# CORS Configuration
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type"],
    }
})

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy', 'message': 'API is running'})

@app.route('/api/products', methods=['GET'])
def get_products():
    products = [
        {'id': 1, 'name': 'Product 1', 'price': 10.99},
        {'id': 2, 'name': 'Product 2', 'price': 20.99}
    ]
    return jsonify(products)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
```

### Frontend (Next.js Component)

```javascript
import { useState, useEffect } from 'react'

export default function ProductList() {
	const [products, setProducts] = useState([])
	const [error, setError] = useState(null)
	const API_URL = 'http://localhost:5000/api'

	useEffect(() => {
		fetch(`${API_URL}/products`)
			.then(res => {
				if (!res.ok) {
					throw new Error(`HTTP error! status: ${res.status}`)
				}
				return res.json()
			})
			.then(data => {
				console.log('Products loaded:', data)
				setProducts(data)
			})
			.catch(err => {
				console.error('Error fetching products:', err)
				setError(err.message)
			})
	}, [])

	if (error) return <div>Error: {error}</div>

	return (
		<div>
			<h1>Products</h1>
			{products.map(product => (
				<div key={product.id}>
					{product.name} - ${product.price}
				</div>
			))}
		</div>
	)
}
```
