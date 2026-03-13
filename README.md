## Setting Up the Frontend

This project uses **Create React App (CRA)** to scaffold the React frontend.

### What is Create React App?

CRA is an official React tool that sets up a ready-to-use React project for you in one command. It comes pre-configured with:
- **Webpack** — bundles all your JS/CSS files for the browser
- **Babel** — converts modern JavaScript & JSX into browser-compatible code
- **Dev Server** — runs your app locally with live reload on file save

No manual configuration needed — you can start writing React code immediately.

### Commands

- `npx create-react-app my-app` — creates the project
- `cd my-app` then `npm start` — starts the dev server at **http://localhost:3000**

### Folder Structure Created

```
my-app/
├── public/         # Static files (index.html)
├── src/            # Your React code lives here
│   ├── App.js
│   └── index.js
├── package.json
└── node_modules/
```

### Available Scripts

| Command | Description |
|---|---|
| `npm start` | Runs the app in development mode |
| `npm run build` | Builds the app for production |
| `npm test` | Runs tests |

> **Note:** `npx` means the tool is downloaded and run temporarily — no global install needed.

---

## ⚠️ Known Issue: Nested Git Repository (frontend folder)

### The Problem

When CRA created the `frontend` folder, it automatically ran `git init` inside it — creating its own `.git` folder. So now you have:

```
auth-mern-app/          ← has .git  (your main repo)
└── frontend/           ← also has .git  (CRA created this!)
```

Git sees `frontend` as a "repo inside a repo" and refuses to track its files normally. If you push to GitHub, the `frontend` folder will appear as an **empty unclickable box**.

### The Fix — run these commands one by one

**Step 1:** Navigate into frontend and delete its `.git` folder
- Mac/Linux: `cd frontend` then `rm -rf .git`
- Windows PowerShell: `Remove-Item -Recurse -Force frontend\.git`

**Step 2:** Go back to root and remove frontend from git's index
- `cd ..` then `git rm --cached frontend`

**Step 3:** Add everything fresh
- `git add .` → `git commit -m "fix: remove nested git repo from frontend"` → `git push`

### Why does CRA do this?

CRA automatically runs `git init` in the new project folder because it assumes you're starting a standalone frontend project. It doesn't know you already have a parent git repo. Vite does the same thing — this problem would have happened with either tool.

### How to avoid this next time

After running `npx create-react-app frontend`, immediately delete the `.git` folder inside it before doing your first `git add .` in the parent folder.

---

## Backend Dependencies

### Install Command

`npm i express jsonwebtoken bcrypt body-parser dotenv mongoose joi cors`

### Library Reference

| Library | Used Where | Purpose |
|---|---|---|
| `express` | Entire backend | Creates the server and defines routes (`/signup`, `/login`, `/products`) |
| `jsonwebtoken` | `/login` + middleware | Generates JWT token on login, verifies it on every protected route |
| `bcrypt` | `/signup` + `/login` | Hashes password before saving, compares password on login |
| `body-parser` | App setup | Parses incoming JSON request body so `req.body` is available |
| `dotenv` | App setup | Loads `.env` file so you can use `process.env.JWT_SECRET`, `process.env.MONGO_URI` |
| `mongoose` | `/signup` + `/login` | Connects to MongoDB, defines User schema, saves and queries users |
| `joi` | `/signup` + `/login` | Validates request body (email format, password length) before any logic runs |
| `cors` | App setup | Allows the React frontend (`localhost:3000`) to call the Express backend (different port) |

> **Note:** Express 4.16+ has `body-parser` built-in via `express.json()`. Having it as a separate package is fine but not required.

---

## Backend Folder Structure & MVC Architecture

### What is MVC?

This project follows **MVC Architecture** (Model-View-Controller) — the most widely used way to organize a backend. The core idea is **separation of concerns** — every file has one job and one job only.

### Folder Structure

```
backend/
├── models/
│   └── User.js              ← defines User schema for MongoDB
├── controllers/
│   └── authController.js    ← signup logic, login logic
├── routes/
│   └── authRoutes.js        ← maps URLs to controllers
├── middleware/
│   └── authMiddleware.js    ← verifies JWT token
└── index.js                 ← app entry point
```

### What Each Folder Does

| Folder | Job | In This Project |
|---|---|---|
| `models/` | Defines data shape, talks to MongoDB | User schema (name, email, password) |
| `controllers/` | Contains all business logic | Signup, login logic |
| `routes/` | Maps URLs to controller functions | POST /signup, POST /login, GET /products |
| `middleware/` | Runs between request and controller | JWT token verification |

### How a Request Flows

```
Request
   ↓
Routes          (which URL? which controller?)
   ↓
Middleware      (is the JWT token valid?)
   ↓
Controllers     (business logic — what should happen?)
   ↓
Models          (talk to MongoDB)
   ↓
Response
```

### Why Not Just Write Everything in index.js?

For a small project it would work — but the moment you want to:
- Fix a JWT bug → you know it's in `middleware/`
- Change how passwords are hashed → you know it's in `controllers/`
- Add a new route → you only touch `routes/`

Without this structure you'd be hunting through one giant file every time. This architecture makes your code **easy to find, easy to fix, and easy to scale**.

---

## Mongoose Model — How It Works

Every file inside `models/` follows the same 3-step pattern. Here's what each part does:

### 1. `mongoose.Schema`

`Schema` is a class provided by Mongoose. It lets you define the **structure and rules** of your data — what fields exist, what type they are, and whether they are required or unique.

Think of it like a **blueprint or form template**. Before anyone fills the form, the form itself defines what fields exist and what's mandatory.

`const Schema = mongoose.Schema` — just saves it into a shorter variable so you can write `new Schema()` instead of `new mongoose.Schema()`.

### 2. `new Schema({})`

This is where you use that blueprint to define your User's shape. Every user document in MongoDB must follow these rules:

| Field | Type | Rule | Why |
|---|---|---|---|
| `name` | String | required | Can't save a user without a name |
| `email` | String | required + unique | No duplicate accounts allowed |
| `password` | String | required | Can't save a user without a password |

> **Without `required: true`** — you could save a user with no password and it would silently succeed. These rules are your safety net.

### 3. `mongoose.model()`

Converts your schema into something you can actually use to talk to MongoDB — query, save, delete, update.

- **First argument** `'users'` — the MongoDB collection name. Mongoose will look for (or create) a collection called `users` in your database.
- **Second argument** `UserSchema` — the rules this collection must follow.
- **Returns** `UserModel` — an object with built-in methods: `findOne()`, `create()`, `findById()`, `deleteOne()` and more.

### How All 3 Connect Together

```
mongoose.Schema      →   defines what fields exist and their rules
new Schema({})       →   creates your specific UserSchema using those rules
mongoose.model()     →   turns UserSchema into a usable database object (UserModel)
```

> `UserSchema` is just a description. `UserModel` is the actual tool you import in your controllers to interact with the `users` collection in MongoDB.

---

## Express Router — How Routes Work

### What is `Router()`?

`Router()` is a mini version of your Express app that handles only routes. It lets you define routes in a separate file and plug them into `index.js`.

- Routes are defined in `routes/authRoutes.js` using `router.post()` and `router.get()`
- They are mounted onto the main app in `index.js` using `app.use('/auth', authRoutes)`
- This makes your URLs: `POST /auth/login` and `POST /auth/signup`

### Line by Line

| Line | What it does |
|---|---|
| `require('express').Router()` | Creates a new isolated router instance |
| `router.post('/login', ...)` | Registers a POST route, works like `app.post()` but scoped to this file |
| `module.exports = router` | Exports the router so `index.js` can import and mount it |
| `app.use('/auth', authRoutes)` | Mounts the router onto the main app under the `/auth` prefix |

### Mental Model

```
index.js         →   the main app   (app.use)
authRoutes.js    →   a plugin       (router.post, router.get)
```

> **Why not define all routes in `index.js`?** For 2 routes it works fine. But with 20+ routes across users, products, orders — `index.js` becomes unmanageable. Router keeps each concern in its own file.

---

## Middleware — Joi Validation (`authValidation.js`)

### 1. `Joi.object()`

Defines the **shape of the entire request body**. Since `req.body` is always an object, `Joi.object()` validates the whole thing at once. Inside it, you define rules for each individual field.

```
Joi.object()     →   validates the entire box
Joi.string()     →   validates one item inside the box
```

### 2. Joi Rules — What Each One Means

| Rule | Meaning |
|---|---|
| `Joi.string()` | Must be text, not a number or boolean |
| `.min(3)` | Minimum 3 characters |
| `.max(100)` | Maximum 100 characters |
| `.email()` | Must be a valid email format (has @ and domain) |
| `.required()` | Field must be present, cannot be empty |

### 3. `schema.validate(req.body)`

Checks if the incoming data matches all the rules defined in the schema. Returns two properties:

| Property | Meaning |
|---|---|
| `error` | Contains details of what failed. Is `undefined` if everything passed |
| `value` | The cleaned version of the data (not needed right now) |

- **Invalid data** — if any field fails a rule, `error` is populated and the middleware returns `400 Bad Request`. The request never reaches the controller.
- **Valid data** — all rules pass, `error` is `undefined`, and `next()` is called to continue.

### 4. The `next` Parameter

Every middleware receives 3 parameters: `(req, res, next)`. `next` is a function that passes control to the next step. Think of it as a **relay race baton**:

```
POST /signup
     ↓
signupValidation     ← validates req.body
     ↓ valid   → next()          → moves to controller
     ↓ invalid → res.status(400) → stops here, never reaches controller
signupController     ← actual signup logic runs only if validation passed
```

> **Without `next()`** — even if validation passes, the request hangs forever and the controller is never called.

### How the Flow Works Together

```
req.body arrives
      ↓
Joi.object()        defines expected shape
      ↓
schema.validate()   checks req.body against the rules
      ↓
error exists?   YES → return 400, stop here
                NO  → call next(), continue to controller
```

---

## Signup & Login — Complete Feature Flow

### Signup Flow

```
User fills the form (name, email, password)
          ↓
Frontend validates the form (client-side)
  → name not empty, email valid, password min length
  → if invalid → show error, STOP here
          ↓
Frontend calls POST /signup with { name, email, password }
          ↓
Backend: Joi middleware validates req.body (server-side)
  → if invalid → return 400, STOP here
          ↓
Backend: Check if email already exists in MongoDB
  → if exists → return 409 "User already exists", STOP here
          ↓
Backend: Hash the password with bcrypt
  → "1234" becomes "$2b$10$abc..."
          ↓
Backend: Save new user to MongoDB
  → { name, email, password: "$2b$10$abc..." }
          ↓
Backend: Return 201 { success: true }
          ↓
Frontend: Redirect to /login page
```

---

### Login Flow

```
User fills the form (email, password)
          ↓
Frontend validates the form (client-side)
  → email valid, password not empty
  → if invalid → show error, STOP here
          ↓
Frontend calls POST /login with { email, password }
          ↓
Backend: Joi middleware validates req.body (server-side)
  → if invalid → return 400, STOP here
          ↓
Backend: Find user by email in MongoDB
  → if not found → return 401 "User does not exist", STOP here
          ↓
Backend: Compare incoming password with stored hashed password
  → bcrypt.compare("1234", "$2b$10$abc...")
  → if no match → return 401 "Wrong password", STOP here
          ↓
Backend: Generate JWT token
  → jwt.sign({ email, _id }, JWT_SECRET, { expiresIn: "24h" })
          ↓
Backend: Return 200 { success: true, token, name }
          ↓
Frontend: Store token in localStorage
  → localStorage.setItem("token", token)
  → localStorage.setItem("name", name)
          ↓
Frontend: Redirect to /home page
```

---

### After Login — Every Protected Page Request

```
User visits /home
          ↓
Frontend: Check if token exists in localStorage
  → if no token → redirect to /login, STOP here
          ↓
Frontend: Call GET /products with token in header
  → headers: { authorization: token }
          ↓
Backend: JWT middleware intercepts the request
  → reads token from header
  → jwt.verify(token, JWT_SECRET)
  → if invalid/expired → return 401, STOP here
          ↓
Backend: Token is valid → allow request to continue
          ↓
Backend: Return products data
          ↓
Frontend: Display products on the page
```

---

### Key Concepts to Remember

| Operation | What happens |
|---|---|
| Signup | Hash the password and store the user |
| Login | Verify password → issue JWT token |
| Protected routes | Verify JWT token → serve data |

The **JWT token is proof of identity** after login. Instead of sending email and password on every request, you send the token. The server trusts it because only it knows the secret used to sign it.

---

## JWT — How It Works

### Why Do We Need JWT?

HTTP is **stateless** — the server has no memory of who you are between requests. Without JWT this would happen:

```
Request 1: Login with email/password → server says OK
Request 2: Get /products → server says "who are you? I don't know you"
```

JWT solves this by giving the frontend a **proof of identity** after login, which it sends on every future request.

---

### What is a JWT Token?

A JWT is a long string made of 3 parts separated by dots:

```
header.payload.signature
eyJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6InhAZ21haWwuY29tIn0.SIGNATURE
```

| Part | Contains | Secret? |
|---|---|---|
| Header | Algorithm used to sign the token (HS256) | No |
| Payload | Data baked in — `{ email, _id, expiresIn }` | No — anyone can decode it |
| Signature | Header + Payload + JWT_SECRET hashed together | Yes — only your server can verify it |

> **Never put passwords in the payload.** It is readable by anyone.

---

### The Server NEVER Stores the JWT Token

This is the most important thing to understand. Here is exactly where the token lives at each stage:

```
LOGIN
  Server creates token → sends to frontend → forgets it completely
  Frontend stores token in localStorage

EVERY PROTECTED REQUEST
  Frontend sends token in request header
  Server verifies it → forgets it again

LOGOUT
  Frontend deletes token from localStorage
  Server does nothing — it never had the token
```

---

### What Lives Where

| What | MongoDB | Server | Frontend |
|---|---|---|---|
| name, email | ✅ Yes | ❌ No | ❌ No |
| Hashed password | ✅ Yes | ❌ No | ❌ No |
| JWT Token | ❌ Never | ❌ Never | ✅ localStorage |
| JWT_SECRET | ❌ Never | ✅ .env file only | ❌ No |

---

### How JWT Works in This Project

**On Login — token is CREATED:**
```
User logs in successfully
          ↓
jwt.sign({ email, _id }, JWT_SECRET, { expiresIn: '24h' })
          ↓
Token "eyJhbGci..." sent to frontend
          ↓
Frontend stores in localStorage
```

**On every protected request — token is VERIFIED:**
```
Frontend sends GET /products
with header: { authorization: "eyJhbGci..." }
          ↓
JWT Middleware intercepts
          ↓
jwt.verify(token, JWT_SECRET)
          ↓ invalid/expired → return 401, STOP
          ↓ valid → continue to controller → return data
```

---

### Why JWT and Not a Random String?

A random string token requires a database lookup on every request to check if it is valid. JWT does not — the server just verifies the signature using `JWT_SECRET`. No database hit needed.

```
Random token:   Request → check database → serve data
JWT token:      Request → verify signature → serve data
                                ↑ no database involved
```

---

### What Makes JWT Secure?

If a hacker tries to fake a token with `{ email: "admin@gmail.com" }`:
- They don't know `JWT_SECRET`
- They cannot create a valid signature
- `jwt.verify()` fails → request rejected with 401

Any change to the payload breaks the signature. The token cannot be tampered with.

---

### Complete JWT Lifecycle

```
SIGNUP      →   no token involved, just save user

LOGIN       →   verify password → create token → send to frontend

PROTECTED   →   frontend sends token → middleware verifies
REQUESTS        → valid   → serve data
                → invalid → 401

LOGOUT      →   frontend deletes token from localStorage
                server does nothing
```

> **One line summary:** JWT is a signed proof of identity that the server creates on login, the frontend carries on every request, and the server verifies without touching the database.
