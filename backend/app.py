from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
import os

app = Flask(__name__)

# Configure CORS with explicit settings
CORS(
    app,
    resources={
        r"/api/*": {
            "origins": [
                "http://localhost:5173",
                "http://localhost:3000",
                "http://localhost:3001",
                "http://127.0.0.1:5173",
                "http://127.0.0.1:3000",
            ],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "supports_credentials": True,
        }
    },
)

# Database configuration
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv(
    "DATABASE_URL", "postgresql://username:password@localhost:5432/ecommerce_db"
)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SECRET_KEY"] = os.getenv(
    "SECRET_KEY", "dev-secret-key-change-in-production"
)

db = SQLAlchemy(app)


# Database Models
class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    orders = db.relationship("Order", backref="user", lazy=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)


class Category(db.Model):
    __tablename__ = "categories"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    slug = db.Column(db.String(100), unique=True, nullable=False)
    description = db.Column(db.Text)
    products = db.relationship("Product", backref="category", lazy=True)


class Product(db.Model):
    __tablename__ = "products"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    price = db.Column(db.Numeric(10, 2), nullable=False)
    unit = db.Column(db.String(20), nullable=False)
    stock = db.Column(db.Integer, default=0)
    image_url = db.Column(db.String(500))
    rating = db.Column(db.Numeric(3, 2), default=0)
    category_id = db.Column(db.Integer, db.ForeignKey("categories.id"), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )


class Order(db.Model):
    __tablename__ = "orders"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    total_amount = db.Column(db.Numeric(10, 2), nullable=False)
    status = db.Column(db.String(50), default="pending")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    items = db.relationship("OrderItem", backref="order", lazy=True)


class OrderItem(db.Model):
    __tablename__ = "order_items"
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey("orders.id"), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey("products.id"), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Numeric(10, 2), nullable=False)
    product = db.relationship("Product")


# API Routes


# Categories
@app.route("/api/categories", methods=["GET"])
def get_categories():
    categories = Category.query.all()
    return jsonify(
        [
            {"id": c.id, "name": c.name, "slug": c.slug, "description": c.description}
            for c in categories
        ]
    )


@app.route("/api/categories", methods=["POST"])
def create_category():
    data = request.json
    category = Category(
        name=data["name"], slug=data["slug"], description=data.get("description", "")
    )
    db.session.add(category)
    db.session.commit()
    return jsonify({"id": category.id, "message": "Category created"}), 201


# Products
@app.route("/api/products", methods=["GET"])
def get_products():
    category_slug = request.args.get("category")
    search = request.args.get("search", "")

    query = Product.query

    if category_slug:
        category = Category.query.filter_by(slug=category_slug).first()
        if category:
            query = query.filter_by(category_id=category.id)

    if search:
        query = query.filter(Product.name.ilike(f"%{search}%"))

    products = query.all()
    return jsonify(
        [
            {
                "id": p.id,
                "name": p.name,
                "description": p.description,
                "price": float(p.price),
                "unit": p.unit,
                "stock": p.stock,
                "image_url": p.image_url,
                "rating": float(p.rating) if p.rating else 0,
                "category": p.category.name,
                "category_id": p.category_id,
            }
            for p in products
        ]
    )


@app.route("/api/products/<int:product_id>", methods=["GET"])
def get_product(product_id):
    product = Product.query.get_or_404(product_id)
    return jsonify(
        {
            "id": product.id,
            "name": product.name,
            "description": product.description,
            "price": float(product.price),
            "unit": product.unit,
            "stock": product.stock,
            "image_url": product.image_url,
            "rating": float(product.rating) if product.rating else 0,
            "category": product.category.name,
        }
    )


@app.route("/api/products", methods=["POST"])
def create_product():
    data = request.json
    product = Product(
        name=data["name"],
        description=data.get("description", ""),
        price=data["price"],
        unit=data["unit"],
        rating=data["rating"],
        stock=data.get("stock", 0),
        image_url=data.get("image_url", ""),
        category_id=data["category_id"],
    )
    db.session.add(product)
    db.session.commit()
    return jsonify({"id": product.id, "message": "Product created"}), 201


@app.route("/api/products/<int:product_id>", methods=["PUT"])
def update_product(product_id):
    product = Product.query.get_or_404(product_id)
    data = request.json

    product.name = data.get("name", product.name)
    product.description = data.get("description", product.description)
    product.price = data.get("price", product.price)
    product.unit = data.get("unit", product.unit)
    product.stock = data.get("stock", product.stock)
    product.rating = data.get("rating", product.rating)
    product.category_id = data.get("category_id", product.category_id)
    product.image_url = data.get("image_url", product.image_url)

    db.session.commit()
    return jsonify({"message": "Product updated"})


@app.route("/api/products/<int:product_id>", methods=["DELETE"])
def delete_product(product_id):
    product = Product.query.get_or_404(product_id)
    db.session.delete(product)
    db.session.commit()
    return jsonify({"message": "Product deleted"})


# Orders
@app.route("/api/orders", methods=["POST"])
def create_order():
    data = request.json

    # Create order
    order = Order(
        user_id=data["user_id"], total_amount=data["total_amount"], status="pending"
    )
    db.session.add(order)
    db.session.flush()

    # Add order items
    for item in data["items"]:
        order_item = OrderItem(
            order_id=order.id,
            product_id=item["product_id"],
            quantity=item["quantity"],
            price=item["price"],
        )

        # Update product stock
        product = Product.query.get(item["product_id"])
        if product:
            product.stock -= item["quantity"]

        db.session.add(order_item)

    db.session.commit()
    return jsonify({"order_id": order.id, "message": "Order created"}), 201


@app.route("/api/orders/<int:order_id>", methods=["GET"])
def get_order(order_id):
    order = Order.query.get_or_404(order_id)
    return jsonify(
        {
            "id": order.id,
            "user_id": order.user_id,
            "total_amount": float(order.total_amount),
            "status": order.status,
            "created_at": order.created_at.isoformat(),
            "items": [
                {
                    "product_id": item.product_id,
                    "product_name": item.product.name,
                    "quantity": item.quantity,
                    "price": float(item.price),
                }
                for item in order.items
            ],
        }
    )


@app.route("/api/users/<int:user_id>/orders", methods=["GET"])
def get_user_orders(user_id):
    orders = (
        Order.query.filter_by(user_id=user_id).order_by(Order.created_at.desc()).all()
    )
    return jsonify(
        [
            {
                "id": o.id,
                "total_amount": float(o.total_amount),
                "status": o.status,
                "created_at": o.created_at.isoformat(),
                "items_count": len(o.items),
            }
            for o in orders
        ]
    )


# Users
@app.route("/api/users/register", methods=["POST"])
def register_user():
    data = request.json

    if User.query.filter_by(email=data["email"]).first():
        return jsonify({"error": "Email already exists"}), 400

    user = User(
        email=data["email"], first_name=data["first_name"], last_name=data["last_name"]
    )
    user.set_password(data["password"])

    db.session.add(user)
    db.session.commit()

    return jsonify({"id": user.id, "message": "User registered"}), 201


@app.route("/api/users/login", methods=["POST"])
def login_user():
    data = request.json
    user = User.query.filter_by(email=data["email"]).first()

    if user and user.check_password(data["password"]):
        return jsonify(
            {
                "id": user.id,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
            }
        )

    return jsonify({"error": "Invalid credentials"}), 401


# Health check
@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({"status": "healthy"})


# Initialize database
@app.cli.command()
def init_db():
    """Initialize the database with tables and sample data."""
    db.create_all()

    # Create sample categories
    categories = [
        Category(
            name="Fruit & Veg",
            slug="fruit-veg",
            description="Fresh fruits and vegetables",
        ),
        Category(
            name="Meat & Seafood",
            slug="meat-seafood",
            description="Quality meats and seafood",
        ),
        Category(name="Bakery", slug="bakery", description="Fresh baked goods"),
        Category(
            name="Dairy & Eggs", slug="dairy", description="Dairy products and eggs"
        ),
        Category(name="Pantry", slug="pantry", description="Pantry staples"),
    ]

    for category in categories:
        if not Category.query.filter_by(slug=category.slug).first():
            db.session.add(category)

    db.session.commit()
    print("Database initialized!")


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=8000)
