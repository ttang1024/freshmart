from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

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
    # Settings fields
    email_notifications = db.Column(db.Boolean, default=True)
    two_factor_enabled = db.Column(db.Boolean, default=False)
    payment_methods = db.Column(db.Text, default="[]")  # JSON list

    # Password helpers
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)


# Update user settings
@app.route("/api/users/<int:user_id>/settings", methods=["PUT"])
def update_user_settings(user_id):
    user = User.query.get_or_404(user_id)
    data = request.json
    if "email_notifications" in data:
        user.email_notifications = bool(data["email_notifications"])
    if "two_factor_enabled" in data:
        user.two_factor_enabled = bool(data["two_factor_enabled"])
    if "payment_methods" in data:
        user.payment_methods = str(data["payment_methods"])
    db.session.commit()
    return jsonify({"message": "Settings updated"})


# Change password
@app.route("/api/users/<int:user_id>/password", methods=["PUT"])
def change_user_password(user_id):
    user = User.query.get_or_404(user_id)
    data = request.json
    current = data.get("current_password")
    new = data.get("new_password")
    confirm = data.get("confirm_password")
    if not user.check_password(current):
        return jsonify({"error": "Current password is incorrect"}), 400
    if not new or new != confirm:
        return jsonify({"error": "New passwords do not match"}), 400
    user.set_password(new)
    db.session.commit()
    return jsonify({"message": "Password updated"})


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


class CartItem(db.Model):
    __tablename__ = "cart_items"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey("products.id"), nullable=False)
    quantity = db.Column(db.Integer, nullable=False, default=1)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # Relationships
    product = db.relationship("Product")
    user = db.relationship("User")

    # Ensure unique product per user
    __table_args__ = (
        db.UniqueConstraint("user_id", "product_id", name="_user_product_uc"),
    )


class Wishlist(db.Model):
    __tablename__ = "wishlist"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey("products.id"), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    product = db.relationship("Product")
    user = db.relationship("User")

    # Ensure unique product per user
    __table_args__ = (
        db.UniqueConstraint("user_id", "product_id", name="_wishlist_user_product_uc"),
    )


class Address(db.Model):
    __tablename__ = "addresses"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    type = db.Column(db.String(50), nullable=False)  # Home, Work, etc.
    name = db.Column(db.String(100), nullable=False)
    street = db.Column(db.String(200), nullable=False)
    city = db.Column(db.String(100), nullable=False)
    state = db.Column(db.String(100), nullable=False)
    zip = db.Column(db.String(20), nullable=False)
    country = db.Column(db.String(100), nullable=False)
    is_default = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # Relationships
    user = db.relationship("User")


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


@app.route("/api/users/<int:user_id>", methods=["GET"])
def get_user_profile(user_id):
    """Get user profile information"""
    # Query only the specific columns we need to avoid selecting columns
    # that may not exist in older database schemas (prevents UndefinedColumn errors).
    row = (
        db.session.query(
            User.id, User.email, User.first_name, User.last_name, User.created_at
        )
        .filter_by(id=user_id)
        .first()
    )
    if not row:
        return jsonify({"error": "User not found"}), 404

    # row may be a sqlalchemy.util.KeyedTuple or similar
    user_id_val = row[0]
    email = row[1]
    first_name = row[2]
    last_name = row[3]
    created_at = row[4]

    return jsonify(
        {
            "id": user_id_val,
            "email": email,
            "firstName": first_name,
            "lastName": last_name,
            "first_name": first_name,
            "last_name": last_name,
            "joinedDate": created_at.isoformat() if created_at else None,
        }
    )


# Addresses
@app.route("/api/users/<int:user_id>/addresses", methods=["GET"])
def get_user_addresses(user_id):
    """Get all addresses for a user"""
    try:
        # Check if user exists (select only id to avoid missing-column errors on older DBs)
        user_exists = db.session.query(User.id).filter_by(id=user_id).first()
        if not user_exists:
            return jsonify({"error": "User not found"}), 404

        addresses = Address.query.filter_by(user_id=user_id).all()
        result = [
            {
                "id": a.id,
                "type": a.type,
                "name": a.name,
                "street": a.street,
                "city": a.city,
                "state": a.state,
                "zip": a.zip,
                "country": a.country,
                "isDefault": a.is_default,
                "created_at": a.created_at.isoformat() if a.created_at else None,
            }
            for a in addresses
        ]
        return jsonify(result)
    except Exception as e:
        app.logger.exception("Failed to fetch addresses for user %s", user_id)
        return (
            jsonify({"error": "Failed to fetch addresses", "details": str(e)}),
            500,
        )


@app.route("/api/users/<int:user_id>/addresses", methods=["POST"])
def add_address(user_id):
    """Add a new address for user"""
    # Check if user exists (select id only)
    user_exists = db.session.query(User.id).filter_by(id=user_id).first()
    if not user_exists:
        return jsonify({"error": "User not found"}), 404

    data = request.json

    # If this is being set as default, unset other defaults
    if data.get("isDefault") or data.get("is_default"):
        Address.query.filter_by(user_id=user_id, is_default=True).update(
            {"is_default": False}
        )

    address = Address(
        user_id=user_id,
        type=data.get("type", "Home"),
        name=data.get("name", ""),
        street=data.get("street", ""),
        city=data.get("city", ""),
        state=data.get("state", ""),
        zip=data.get("zip", ""),
        country=data.get("country", ""),
        is_default=data.get("isDefault") or data.get("is_default", False),
    )
    db.session.add(address)
    db.session.commit()

    return jsonify({"id": address.id, "message": "Address added"}), 201


@app.route("/api/users/<int:user_id>/addresses/<int:address_id>", methods=["PUT"])
def update_address(user_id, address_id):
    """Update an address"""
    address = Address.query.filter_by(id=address_id, user_id=user_id).first()
    if not address:
        return jsonify({"error": "Address not found"}), 404
    data = request.json

    # If this is being set as default, unset other defaults
    if data.get("isDefault") or data.get("is_default"):
        Address.query.filter_by(user_id=user_id, is_default=True).update(
            {"is_default": False}
        )

    address.type = data.get("type", address.type)
    address.name = data.get("name", address.name)
    address.street = data.get("street", address.street)
    address.city = data.get("city", address.city)
    address.state = data.get("state", address.state)
    address.zip = data.get("zip", address.zip)
    address.country = data.get("country", address.country)
    if "isDefault" in data or "is_default" in data:
        address.is_default = data.get("isDefault") or data.get("is_default", False)

    db.session.commit()
    return jsonify({"message": "Address updated"})


@app.route("/api/users/<int:user_id>/addresses/<int:address_id>", methods=["DELETE"])
def delete_address(user_id, address_id):
    """Delete an address"""
    address = Address.query.filter_by(id=address_id, user_id=user_id).first()
    if not address:
        return jsonify({"error": "Address not found"}), 404
    db.session.delete(address)
    db.session.commit()
    return jsonify({"message": "Address deleted"})


# Health check
@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({"status": "healthy"})


# Shopping Cart API Endpoints
# ============================================


@app.route("/api/users/<int:user_id>/cart", methods=["GET"])
def get_cart(user_id):
    """Get user's shopping cart"""
    cart_items = CartItem.query.filter_by(user_id=user_id).all()

    total = sum(float(item.product.price) * item.quantity for item in cart_items)

    return jsonify(
        {
            "items": [
                {
                    "id": item.id,
                    "product_id": item.product_id,
                    "quantity": item.quantity,
                    "product": {
                        "id": item.product.id,
                        "name": item.product.name,
                        "price": float(item.product.price),
                        "unit": item.product.unit,
                        "image_url": item.product.image_url,
                        "stock": item.product.stock,
                        "rating": (
                            float(item.product.rating) if item.product.rating else 0
                        ),
                    },
                    "subtotal": float(item.product.price * item.quantity),
                }
                for item in cart_items
            ],
            "total": round(total, 2),
            "item_count": sum(item.quantity for item in cart_items),
        }
    )


@app.route("/api/users/<int:user_id>/cart", methods=["POST"])
def add_to_cart(user_id):
    """Add item to cart"""
    data = request.json
    product_id = data.get("product_id")
    quantity = data.get("quantity", 1)

    if not product_id:
        return jsonify({"error": "Product ID required"}), 400

    # Check if product exists and has stock
    product = Product.query.get_or_404(product_id)
    if product.stock < quantity:
        return jsonify({"error": f"Only {product.stock} items available"}), 400

    # Check if item already in cart
    cart_item = CartItem.query.filter_by(user_id=user_id, product_id=product_id).first()

    if cart_item:
        # Update quantity
        new_quantity = cart_item.quantity + quantity
        if new_quantity > product.stock:
            return (
                jsonify(
                    {"error": f"Cannot add more. Only {product.stock} items available"}
                ),
                400,
            )

        cart_item.quantity = new_quantity
        cart_item.updated_at = datetime.utcnow()
        message = "Cart updated"
    else:
        # Add new item
        cart_item = CartItem(user_id=user_id, product_id=product_id, quantity=quantity)
        db.session.add(cart_item)
        message = "Item added to cart"

    db.session.commit()

    return (
        jsonify(
            {
                "message": message,
                "cart_item": {
                    "id": cart_item.id,
                    "product_id": cart_item.product_id,
                    "quantity": cart_item.quantity,
                },
            }
        ),
        201,
    )


@app.route("/api/users/<int:user_id>/cart/<int:item_id>", methods=["PUT"])
def update_cart_item(user_id, item_id):
    """Update cart item quantity"""
    cart_item = CartItem.query.filter_by(id=item_id, user_id=user_id).first_or_404()

    data = request.json
    new_quantity = data.get("quantity")

    if new_quantity is None:
        return jsonify({"error": "Quantity required"}), 400

    if new_quantity <= 0:
        # Remove item if quantity is 0 or negative
        db.session.delete(cart_item)
        db.session.commit()
        return jsonify({"message": "Item removed from cart"})

    # Check stock availability
    if new_quantity > cart_item.product.stock:
        return (
            jsonify({"error": f"Only {cart_item.product.stock} items available"}),
            400,
        )

    cart_item.quantity = new_quantity
    cart_item.updated_at = datetime.utcnow()
    db.session.commit()

    return jsonify(
        {
            "message": "Cart updated",
            "cart_item": {
                "id": cart_item.id,
                "quantity": cart_item.quantity,
                "subtotal": float(cart_item.product.price * cart_item.quantity),
            },
        }
    )


@app.route("/api/users/<int:user_id>/cart/<int:item_id>", methods=["DELETE"])
def remove_from_cart(user_id, item_id):
    """Remove item from cart"""
    cart_item = CartItem.query.filter_by(id=item_id, user_id=user_id).first_or_404()

    product_name = cart_item.product.name

    db.session.delete(cart_item)
    db.session.commit()

    return jsonify({"message": f"{product_name} removed from cart"})


@app.route("/api/users/<int:user_id>/cart/clear", methods=["DELETE"])
def clear_cart(user_id):
    """Clear entire cart"""
    deleted_count = CartItem.query.filter_by(user_id=user_id).delete()
    db.session.commit()

    return jsonify({"message": "Cart cleared", "items_removed": deleted_count})


@app.route("/api/users/<int:user_id>/cart/sync", methods=["POST"])
def sync_cart(user_id):
    """Sync local cart with server (merge carts)"""
    data = request.json
    local_items = data.get("items", [])

    # Get existing cart
    existing_items = CartItem.query.filter_by(user_id=user_id).all()
    existing_products = {item.product_id: item for item in existing_items}

    synced_count = 0

    for local_item in local_items:
        product_id = local_item.get("product_id")
        quantity = local_item.get("quantity", 1)

        if product_id in existing_products:
            # Update existing item (keep higher quantity)
            cart_item = existing_products[product_id]
            cart_item.quantity = max(cart_item.quantity, quantity)
            cart_item.updated_at = datetime.utcnow()
        else:
            # Add new item
            cart_item = CartItem(
                user_id=user_id, product_id=product_id, quantity=quantity
            )
            db.session.add(cart_item)

        synced_count += 1

    db.session.commit()

    return jsonify(
        {"message": "Cart synced successfully", "items_synced": synced_count}
    )


@app.route("/api/users/<int:user_id>/cart/validate", methods=["POST"])
def validate_cart(user_id):
    """Validate cart items (check stock availability)"""
    cart_items = CartItem.query.filter_by(user_id=user_id).all()

    issues = []
    valid_items = []

    for item in cart_items:
        if not item.product.is_active:
            issues.append(
                {
                    "item_id": item.id,
                    "product_name": item.product.name,
                    "issue": "Product no longer available",
                }
            )
        elif item.quantity > item.product.stock:
            issues.append(
                {
                    "item_id": item.id,
                    "product_name": item.product.name,
                    "issue": f"Only {item.product.stock} items available (you have {item.quantity} in cart)",
                }
            )
        else:
            valid_items.append(
                {
                    "item_id": item.id,
                    "product_name": item.product.name,
                    "quantity": item.quantity,
                    "available_stock": item.product.stock,
                }
            )

    return jsonify(
        {"is_valid": len(issues) == 0, "issues": issues, "valid_items": valid_items}
    )


# ============================================
# Wishlist API Endpoints (Enhanced)
# ============================================


@app.route("/api/users/<int:user_id>/wishlist", methods=["GET"])
def get_wishlist(user_id):
    """Get user's wishlist with product details"""
    wishlist_items = Wishlist.query.filter_by(user_id=user_id).all()

    return jsonify(
        [
            {
                "id": item.id,
                "product_id": item.product_id,
                "name": item.product.name,
                "price": float(item.product.price),
                "unit": item.product.unit,
                "image": item.product.image_url,
                "rating": float(item.product.rating) if item.product.rating else 0,
                "stock": item.product.stock,
                "created_at": item.created_at.isoformat(),
            }
            for item in wishlist_items
        ]
    )


@app.route("/api/users/<int:user_id>/wishlist", methods=["POST"])
def add_to_wishlist(user_id):
    """Add item to wishlist"""
    data = request.json
    product_id = data.get("product_id")

    if not product_id:
        return jsonify({"error": "Product ID required"}), 400

    # Check if product exists
    product = Product.query.get_or_404(product_id)

    # Check if already in wishlist
    existing = Wishlist.query.filter_by(user_id=user_id, product_id=product_id).first()
    if existing:
        return jsonify({"error": "Product already in wishlist"}), 400

    wishlist_item = Wishlist(user_id=user_id, product_id=product_id)
    db.session.add(wishlist_item)
    db.session.commit()

    return (
        jsonify(
            {
                "message": "Item added to wishlist",
                "wishlist_item": {
                    "id": wishlist_item.id,
                    "product_id": wishlist_item.product_id,
                    "name": product.name,
                    "price": float(product.price),
                },
            }
        ),
        201,
    )


@app.route("/api/users/<int:user_id>/wishlist/<int:product_id>", methods=["DELETE"])
def remove_from_wishlist(user_id, product_id):
    """Remove item from wishlist"""
    wishlist_item = Wishlist.query.filter_by(
        user_id=user_id, product_id=product_id
    ).first_or_404()

    product_name = wishlist_item.product.name
    db.session.delete(wishlist_item)
    db.session.commit()

    return jsonify({"message": f"{product_name} removed from wishlist"})


@app.route(
    "/api/users/<int:user_id>/wishlist/move-to-cart/<int:product_id>", methods=["POST"]
)
def move_wishlist_to_cart(user_id, product_id):
    """Move item from wishlist to cart"""
    # Find wishlist item
    wishlist_item = Wishlist.query.filter_by(
        user_id=user_id, product_id=product_id
    ).first_or_404()

    # Add to cart
    cart_item = CartItem.query.filter_by(user_id=user_id, product_id=product_id).first()

    if cart_item:
        cart_item.quantity += 1
        cart_item.updated_at = datetime.utcnow()
    else:
        cart_item = CartItem(user_id=user_id, product_id=product_id, quantity=1)
        db.session.add(cart_item)

    # Remove from wishlist
    db.session.delete(wishlist_item)
    db.session.commit()

    return jsonify({"message": "Item moved to cart", "cart_item_id": cart_item.id})


@app.route("/api/users/<int:user_id>/wishlist/check/<int:product_id>", methods=["GET"])
def check_wishlist(user_id, product_id):
    """Check if product is in wishlist"""
    exists = (
        Wishlist.query.filter_by(user_id=user_id, product_id=product_id).first()
        is not None
    )

    return jsonify({"in_wishlist": exists})


# ============================================
# Batch Operations
# ============================================


@app.route("/api/users/<int:user_id>/cart/batch", methods=["POST"])
def batch_add_to_cart(user_id):
    """Add multiple items to cart at once"""
    data = request.json
    items = data.get("items", [])

    if not items:
        return jsonify({"error": "No items provided"}), 400

    added_count = 0
    errors = []

    for item_data in items:
        product_id = item_data.get("product_id")
        quantity = item_data.get("quantity", 1)

        try:
            product = Product.query.get(product_id)
            if not product:
                errors.append(f"Product {product_id} not found")
                continue

            if product.stock < quantity:
                errors.append(f"{product.name}: Only {product.stock} available")
                continue

            cart_item = CartItem.query.filter_by(
                user_id=user_id, product_id=product_id
            ).first()

            if cart_item:
                cart_item.quantity += quantity
            else:
                cart_item = CartItem(
                    user_id=user_id, product_id=product_id, quantity=quantity
                )
                db.session.add(cart_item)

            added_count += 1

        except Exception as e:
            errors.append(f"Error adding product {product_id}: {str(e)}")

    db.session.commit()

    return jsonify(
        {
            "message": f"{added_count} items added to cart",
            "added_count": added_count,
            "errors": errors,
        }
    )


# ============================================
# Cart Statistics
# ============================================


@app.route("/api/users/<int:user_id>/cart/stats", methods=["GET"])
def get_cart_stats(user_id):
    """Get cart statistics"""
    cart_items = CartItem.query.filter_by(user_id=user_id).all()

    if not cart_items:
        return jsonify(
            {
                "total_items": 0,
                "total_quantity": 0,
                "subtotal": 0,
                "estimated_delivery": 0,
                "total": 0,
            }
        )

    total_quantity = sum(item.quantity for item in cart_items)
    subtotal = sum(float(item.product.price) * item.quantity for item in cart_items)

    # Calculate delivery fee (free over $50)
    delivery_fee = 0 if subtotal >= 50 else 5.99

    total = subtotal + delivery_fee

    return jsonify(
        {
            "total_items": len(cart_items),
            "total_quantity": total_quantity,
            "subtotal": round(subtotal, 2),
            "estimated_delivery": delivery_fee,
            "total": round(total, 2),
            "free_delivery_threshold": 50.0,
            "amount_until_free_delivery": max(0, round(50 - subtotal, 2)),
        }
    )


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
