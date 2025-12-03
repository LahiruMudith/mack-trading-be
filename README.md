# Juki Machine Item — Backend (Node, Express & MongoDB)

A RESTful backend API for the Juki Machine Item MERN storefront. Handles products (machines), inventory, admin authentication, inquiries, orders, blog posts, image uploads, email notifications, and an optional AI proxy for Gemini.

## Tech stack
- Node.js, Express
- MongoDB with Mongoose
- JWT for authentication
- Multer (or direct S3 integration) for image uploads
- SendGrid / Mailgun (or SMTP) for email notifications
- Optional: proxy integration to Gemini AI for chat/FAQ

## Primary features (MVP)
- REST API for products (list, details, create, update, delete)
- Inventory management (stock quantity, status)
- Admin authentication (register/login, role-based guards)
- Contact / inquiry endpoints (persist inquiries, send email)
- Order request endpoints (capture order requests for admin review)
- Blog / news endpoints (posts CRUD)
- Admin endpoints to list/manage inquiries and orders
- Image upload support (local for dev, S3 for production)
- Optional AI proxy endpoint to forward chat queries to Gemini (keeps API key server-side)

## Repository structure (recommended)
src/
├─ controllers/         # Request handlers for products, auth, orders, inquiries, posts  
├─ models/              # Mongoose models (Product, User, Order, Inquiry, Post)  
├─ routes/              # Express routes (api/product.js, api/auth.js, api/admin.js)  
├─ middleware/          # Auth, errorHandler, validation, multer/S3 middleware  
├─ services/            # Email service, image upload service, AI proxy service  
├─ utils/               # Helpers (formatting, validators)  
├─ config/              # DB connection, env loader  
├─ jobs/                # Background jobs (email queue) — optional  
├─ app.js               # Express app  
└─ server.js            # Server start  
.env.example  
package.json  
README.md

## Core Models (summary)
- User
    - email, passwordHash, name, role (admin/user), createdAt
- Product
    - name, sku, description, specs (object/array), category, price, images[], stockQty, status, rating
- Order
    - user (optional), contact info, items [{ productId, qty, price }], total, status, createdAt
- Inquiry
    - name, email, phone, message, productId (optional), createdAt, status
- Post
    - title, slug, content, tags, published, createdAt

[//]: # ()
[//]: # (## API contract &#40;example endpoints&#41;)

[//]: # (- Auth)

[//]: # (    - POST /api/auth/register — register admin &#40;use only for initial setup or restricted&#41;)

[//]: # (    - POST /api/auth/login — login, returns JWT)

[//]: # (- Products)

[//]: # (    - GET /api/products — list &#40;support search, filter, sort, pagination&#41;)

[//]: # (    - GET /api/products/:id — details)

[//]: # (    - POST /api/products — create &#40;admin&#41;)

[//]: # (    - PUT /api/products/:id — update &#40;admin&#41;)

[//]: # (    - DELETE /api/products/:id — delete &#40;admin&#41;)

[//]: # (- Orders)

[//]: # (    - POST /api/orders — create order/request)

[//]: # (    - GET /api/admin/orders — list orders &#40;admin&#41;)

[//]: # (    - PUT /api/admin/orders/:id/status — update status &#40;admin&#41;)

[//]: # (- Inquiries)

[//]: # (    - POST /api/inquiries — submit contact/inquiry)

[//]: # (    - GET /api/admin/inquiries — list inquiries &#40;admin&#41;)

[//]: # (- Posts &#40;blog&#41;)

[//]: # (    - GET /api/posts — list posts)

[//]: # (    - POST /api/admin/posts — create post &#40;admin&#41;)

[//]: # (- AI proxy &#40;optional&#41;)

[//]: # (    - POST /api/ai/query — forward query to Gemini API and return response &#40;server-side key only&#41;)

[//]: # ()
[//]: # (## Environment variables &#40;.env.example&#41;)

[//]: # (- PORT=5000)

[//]: # (- MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/juki-shop)

[//]: # (- JWT_SECRET=your_jwt_secret_here)

[//]: # (- JWT_EXPIRES_IN=7d)

[//]: # (- SENDGRID_API_KEY=...)

[//]: # (- EMAIL_FROM=orders@yourdomain.com)

[//]: # (- AWS_S3_BUCKET=...)

[//]: # (- AWS_ACCESS_KEY_ID=...)

[//]: # (- AWS_SECRET_ACCESS_KEY=...)

[//]: # (- GEMINI_API_KEY=...              # optional; use only with server-side proxy)

[//]: # (- NODE_ENV=development)

[//]: # ()
[//]: # (## Authentication & Security)

[//]: # (- Hash passwords with bcrypt before storing.)

[//]: # (- Use JWT tokens and verify for protected/admin routes.)

[//]: # (- Prefer httpOnly cookie storage for access tokens or refresh-token approach for better security.)

[//]: # (- Validate and sanitize all incoming data &#40;express-validator or Joi&#41;.)

[//]: # (- Never commit .env or API keys to the repo.)

[//]: # (- Add rate-limiting and proper CORS configuration for public endpoints.)

[//]: # ()
[//]: # (## Image uploads)

[//]: # (- Development: use Multer to store files locally &#40;uploads/&#41;.)

[//]: # (- Production: upload directly to S3 or use signed URL flow; store returned public URLs in product documents.)

[//]: # (- Validate file types and sizes server-side.)

[//]: # ()
[//]: # (## Email & Notifications)

[//]: # (- Use SendGrid / Mailgun / SMTP to send notifications on inquiries and new orders.)

[//]: # (- Optionally queue emails &#40;Bull/Redis&#41; for reliability under load.)

[//]: # ()
[//]: # (## Deployment)

[//]: # (- Recommended: host backend on Render, Heroku, or a VPS.)

[//]: # (- Use MongoDB Atlas for managed DB with proper IP/role configuration.)

[//]: # (- Set production env variables on your host &#40;do not store secrets in repo&#41;.)

[//]: # (- Add HTTPS and environment-specific logging.)

[//]: # (- Monitor errors &#40;Sentry&#41; and set up backups for MongoDB.)

[//]: # ()
[//]: # (## Testing)

[//]: # (- Unit test controllers and utils with Jest.)

[//]: # (- Integration tests for critical endpoints using supertest.)

[//]: # (- Manual E2E verification for main flows: product listing, order request, inquiry, admin CRUD.)

[//]: # ()
[//]: # (## Development scripts &#40;package.json&#41;)

[//]: # (- npm start — start server &#40;production&#41;)

[//]: # (- npm run dev — start with nodemon &#40;development&#41;)

[//]: # (- npm test — run tests)

[//]: # (- npm run lint — run linter)

[//]: # ()
[//]: # (## CI / CD)

[//]: # (- Optional GitHub Actions: run lint & tests on push / PR, deploy to Render/Heroku on merge to main.)

[//]: # ()
[//]: # (## Logging & Monitoring)

[//]: # (- Use Winston or pino for structured logging.)

[//]: # (- Capture uncaught exceptions and promise rejections, and log in production.)

[//]: # (- Add basic health check endpoint GET /health for uptime monitoring.)

[//]: # ()
[//]: # (## Contributing)

[//]: # (1. Fork the repo and create a branch: git checkout -b feature/your-feature)

[//]: # (2. Add tests and maintain consistent style)

[//]: # (3. Open a Pull Request and include a description of changes)

[//]: # ()
[//]: # (## License)

[//]: # (Add a LICENSE file &#40;MIT recommended for apps / student projects&#41;)

## Contact
- Owner: Lahiru Mudith
- For pairing with frontend, set REACT_APP_API_URL to your deployed backend before building the frontend.

## Notes about Gemini AI integration
- Never expose the Gemini API key to the browser. Implement a server-side proxy endpoint (/api/ai/query) that authenticates requests and forwards them to the Gemini API.
- Add rate limits and usage logging to prevent abuse.
- Include a privacy notice if storing conversation logs.