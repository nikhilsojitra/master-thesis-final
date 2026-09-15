# ShopHub - Full-Stack Online Shop

A complete e-commerce platform built with React, Node.js, Express, MySQL, and Stripe for payments.

## 🚀 Features

### Authentication & Authorization
- JWT-based authentication
- User registration and login
- Role-based access control (Admin/User)
- Protected routes and admin panel

### Product Management
- Product listing with search and filtering
- Product details with image support
- Admin CRUD operations for products
- Stock management with low-stock alerts

### Shopping Cart & Checkout
- Add/remove items from cart
- Real-time stock validation
- Stripe payment integration
- Order confirmation and tracking

### Order Management
- Order history for users
- Order status tracking
- Admin order management
- Order cancellation

### Admin Dashboard
- Analytics and insights
- User management
- Product management
- Order management
- Sales reporting

### Responsive Design
- Mobile-first design
- TailwindCSS for styling
- Fully responsive across all devices

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **TailwindCSS** - Styling
- **React Router** - Navigation
- **Axios** - HTTP client
- **Stripe React** - Payment processing
- **React Hot Toast** - Notifications
- **Lucide React** - Icons

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **Prisma** - ORM
- **MySQL** - Database
- **JWT** - Authentication
- **Stripe** - Payment processing
- **Bcrypt** - Password hashing
- **Helmet** - Security

## 📋 Prerequisites

- Node.js (v16 or higher)
- MySQL (v8 or higher)
- Stripe account for payments
- Git

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd online-shop
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Database Setup

1. Create a MySQL database:
```sql
CREATE DATABASE online_shop;
```

2. Copy environment file:
```bash
cd backend
cp .env.example .env
```

3. Update the `.env` file with your database credentials:
```env
DATABASE_URL="mysql://username:password@localhost:3306/online_shop"
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_EXPIRES_IN="7d"
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"
STRIPE_PUBLISHABLE_KEY="pk_test_your_stripe_publishable_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"
PORT=5000
NODE_ENV=development
FRONTEND_URL="http://localhost:3000"
```

4. Generate Prisma client and push schema:
```bash
npm run db:generate
npm run db:push
```

### 4. Frontend Environment Setup

Create a `.env` file in the frontend directory:
```bash
cd ../frontend
touch .env
```

Add the following:
```env
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

### 5. Stripe Setup

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Get your test API keys from the Stripe dashboard
3. Update the environment variables with your Stripe keys
4. For webhooks (optional):
   - Install Stripe CLI
   - Run `stripe listen --forward-to localhost:5000/api/payments/webhook`
   - Copy the webhook secret to your `.env` file

## 🚀 Running the Application

### Development Mode

1. Start the backend server:
```bash
cd backend
npm run dev
```

2. Start the frontend development server:
```bash
cd frontend
npm start
```

3. Or run both simultaneously from the root:
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### Production Mode

1. Build the frontend:
```bash
cd frontend
npm run build
```

2. Start the backend in production:
```bash
cd backend
npm start
```

## 👥 Default Users

For testing purposes, you can create these demo accounts:

### Admin Account
- Email: admin@example.com
- Password: password
- Role: ADMIN

### Regular User Account
- Email: nikhilsojitra@gmail.com
- Password: 123456
- Role: USER

## ✅ Automated Testing

The project follows a four-tier testing pyramid (static analysis → unit → integration → E2E), matching the CI/CD pipeline design in the thesis (Chapter 3, §3.7.3):

| Tier | Tooling | Location | Runs on |
|---|---|---|---|
| Static analysis | ESLint | `backend/` | every push/PR |
| Unit tests | Jest (backend), Jest + React Testing Library (frontend) | `backend/tests/unit`, `frontend/src/**/*.test.js` | every push/PR |
| Integration tests | Jest + Supertest, against a real MySQL instance | `backend/tests/integration` | every push/PR |
| Feature/E2E tests | Playwright, against the full running stack | `e2e/` | **main branch only** (slower, so excluded from every PR commit) |

```bash
# Backend — lint, unit, integration
cd backend
npm run lint
npm run test:unit
npm run test:integration   # requires DATABASE_URL to point at a reachable MySQL instance

# Frontend — unit/component tests
cd frontend
npm test -- --watchAll=false

# End-to-end (from the repo root; spins up the backend + frontend itself)
npm run test:e2e
```

The `.github/workflows/ci-cd.yml` pipeline runs all of the above (E2E gated to `main`), then a Trivy + `npm audit` security gate, before building/pushing Docker images and deploying to EC2 with a post-deploy smoke test and automatic rollback.

## 🧪 Testing Payments

Use Stripe's test card numbers:

- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **Require 3D Secure**: 4000 0025 0000 3155

Use any future date for expiry and any 3-digit CVC.

## 📁 Project Structure

```
online-shop/
├── backend/
│   ├── middleware/
│   │   └── auth.js
│   ├── prisma/
│   │   └── schema.prisma
│   ├── routes/
│   │   ├── admin.js
│   │   ├── auth.js
│   │   ├── orders.js
│   │   ├── payments.js
│   │   ├── products.js
│   │   └── users.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/
│   │   │   └── Layout/
│   │   ├── contexts/
│   │   │   ├── AuthContext.js
│   │   │   └── CartContext.js
│   │   ├── pages/
│   │   │   ├── Admin/
│   │   │   └── [other pages]
│   │   ├── App.js
│   │   ├── index.css
│   │   └── index.js
│   ├── package.json
│   ├── tailwind.config.js
│   └── postcss.config.js
├── package.json
└── README.md
```

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### Products
- `GET /api/products` - Get all products (with search/filter)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Orders
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get single order
- `POST /api/orders` - Create order
- `PUT /api/orders/:id/status` - Update order status
- `DELETE /api/orders/:id` - Cancel order

### Payments
- `POST /api/payments/create-payment-intent` - Create payment intent
- `POST /api/payments/confirm-payment` - Confirm payment
- `POST /api/payments/webhook` - Stripe webhook

### Admin
- `GET /api/admin/analytics` - Get dashboard analytics
- `GET /api/admin/users` - Get all users
- `GET /api/admin/orders` - Get all orders
- `PUT /api/admin/orders/:id/status` - Update order status
- `DELETE /api/admin/users/:id` - Delete user

## 🔒 Security Features

- JWT token authentication
- Password hashing with bcrypt
- Rate limiting
- CORS protection
- Helmet security headers
- Input validation
- SQL injection prevention (Prisma ORM)

## 🎨 UI/UX Features

- Modern, clean design
- Responsive layout
- Loading states
- Error handling
- Toast notifications
- Smooth animations
- Accessible components

## 📱 Mobile Responsiveness

The application is fully responsive and optimized for:
- Mobile phones (320px+)
- Tablets (768px+)
- Desktops (1024px+)
- Large screens (1280px+)

## 🚀 Deployment

### Backend Deployment
1. Set up a MySQL database on your hosting provider
2. Update environment variables for production
3. Deploy to platforms like Heroku, Railway, or DigitalOcean
4. Set up Stripe webhooks for production

### Frontend Deployment
1. Build the production bundle: `npm run build`
2. Deploy to platforms like Netlify, Vercel, or AWS S3
3. Update API URLs for production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues:

1. Check the console for error messages
2. Verify all environment variables are set correctly
3. Ensure the database is running and accessible
4. Check that all dependencies are installed
5. Verify Stripe keys are valid and in test mode

## 🔄 Updates & Maintenance

- Regularly update dependencies
- Monitor Stripe API changes
- Backup database regularly
- Monitor application logs
- Update security patches

---

**Happy Shopping! 🛒**
