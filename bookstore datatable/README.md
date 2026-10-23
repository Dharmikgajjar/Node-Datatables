
1. Database Connection
What it does: This part acts as the bridge between your Express server and MongoDB. It reads your private database link from the hidden environment file and securely opens up communication so your app can save and read data.

2. Database Models
Mongoose models define the exact shape and rules for the information stored in your database collections:

User Model: Stores account details like name, email, encrypted passwords, and user roles. It includes a security feature that scrambles (hashes) user passwords automatically before saving them so they remain secure.

Author & Category Models: Simple blueprints for grouping and describing book authors and product categories.

Book Model: The core catalog blueprint. It links each book directly to its specific author and category using ID references, and sets up search indexing so users can look up books quickly by title or description.

Order Model: Keeps track of customer purchases. It records who bought what, the quantities, total pricing, shipping address, payment method, and the current status of the order.

3. Middleware and Security
Middleware functions act as security checkpoints and helpers that process incoming requests before they reach your main route logic:

Token Protection: Acts like a security guard. It inspects incoming requests for a valid digital token, verifies its authenticity, and identifies who is making the request.

Admin-Only Check: Looks at the verified user's role to ensure that only administrators can perform sensitive actions like adding, updating, or deleting books and categories.

Centralized Error Handler: Catches unexpected database crashes, validation errors, or duplicate entries and turns them into clean, readable error messages for the client.

4. Reusable CRUD Template
What it does: Instead of writing separate routes for simple resources like authors and categories, a single factory template generates standard listing, single-item lookup, creation, update, and deletion rules automatically for any given model.

5. Authentication Routes
What it does: Handles user registration and login. When a user logs in with correct credentials, the server generates a secure digital token (JWT) that the client stores and sends back with future requests to prove who they are.

6. Book Routes
What it does: Manages how books are retrieved. It handles advanced queries such as keyword searching, filtering books by price ranges or categories, sorting lists, and breaking long result lists into smaller pages so the app remains fast and responsive.

7. Order Routes
What it does: Manages the shopping and checkout flow. When an order is placed, it checks if enough stock is available, safely reduces the inventory count, and includes a safety rollback feature to restore stock if any part of the checkout process fails halfway through. It also lets users view their past orders or cancel them if necessary.
