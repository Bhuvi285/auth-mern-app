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

---

## Protected Route Flow — GET /products

### How the 3 Files Work Together

```
index.js         →   receives request, routes to ProductsRouter
Auth.js          →   middleware, checks JWT token first
ProductsRouter   →   returns products only if token is valid
```

### Complete Request Flow

```
Frontend sends:
GET /products
headers: { authorization: "eyJhbGci..." }
          ↓
index.js sees /products → hands to ProductsRouter
          ↓
ProductsRouter sees ensureAuthenticated → runs Auth.js first
          ↓
Auth.js: reads token from headers
          ↓ no token      → 403 "JWT token is required", STOP
          ↓ token exists  → jwt.verify(token, JWT_SECRET)
               ↓ fails    → 401 "JWT token wrong or expired", STOP
               ↓ passes   → decoded = { email, _id }
                          → req.user = decoded
                          → next()
          ↓
Route handler runs
  → console.log(req.user) prints { email, _id }
  → returns 200 with products array
          ↓
Frontend receives products
```

### Why `req.user`?

`Auth.js` sets `req.user = decoded` before calling `next()`. This passes the decoded JWT payload (email, _id) forward through the `req` object into the route handler. This is how the route handler knows who made the request without touching the database.

### Why `ensureAuthenticated` is Reusable

It is written once in `Auth.js` and plugged into any route that needs protection:

```
router.get('/products', ensureAuthenticated, handler)
router.get('/orders',   ensureAuthenticated, handler)
router.get('/profile',  ensureAuthenticated, handler)
```

One bug fix in `Auth.js` fixes all protected routes at once.

---

## Frontend Libraries

### Install Command

`npm i react-router-dom react-toastify`

---

### `react-router-dom` — Navigation & Routing

Without this library, your React app is just a single page — you cannot navigate between `/login`, `/signup`, and `/home`. It lets you define which component should show for which URL.

| URL | Component shown |
|---|---|
| `/login` | Login component |
| `/signup` | Signup component |
| `/home` | Home component |

Key tools it gives you:
- `useNavigate` — redirect user programmatically (after login, redirect to `/home`)
- `Link` — navigate between pages without full page reload
- Private Route — protect pages that require login (redirect to `/login` if no token)

> It is the backbone of the entire frontend navigation.

---

### `react-toastify` — Toast Notifications

Instead of ugly browser `alert()` popups, it shows clean styled toast notifications — small message boxes that appear at the corner of the screen and disappear automatically.

Used in your project to show:
- ✅ Login Successful — green toast
- ❌ Invalid credentials — red toast
- ⚠️ User already exists — warning toast

Usage: `toast.success("Login Successful")` or `toast.error("Invalid credentials")`

Without it you'd have to manually create and style notification components from scratch.

---

### In Short

| Library | Purpose |
|---|---|
| `react-router-dom` | Handles **where** the user goes |
| `react-toastify` | Handles **what message** the user sees |

---

## Frontend — Signup Component Flow

### Step 1 — State Setup with `useState`

`useState({ name, email, password })` creates a state variable `signupInfo` that holds all 3 form field values starting as empty strings. Every time the user types, this state updates and React re-renders the component.

Think of `signupInfo` as a **live snapshot of what is currently in the form.**

---

### Step 2 — `useNavigate`

Gives you a function to redirect the user programmatically. After successful signup, `navigate('/login')` sends the user to the login page. Without this you cannot redirect in React.

---

### Step 3 — `handleChange` — Tracks Every Keystroke

Runs every time the user types anything in any input field.

- `e.target.name` — the `name` attribute of the input field that was typed in (`"name"`, `"email"`, `"password"`)
- `e.target.value` — what the user just typed
- `{ ...signupInfo }` — spread operator, creates a copy of current state. You never modify state directly in React, always work on a copy first.
- `copySignupInfo[name] = value` — updates only the field that changed
- `setSignupInfo(copySignupInfo)` — saves the updated copy back to state

**Example of state as user types:**
```
Types "B" in name     → { name: "B",    email: "",    password: "" }
Types "Bh" in name    → { name: "Bh",   email: "",    password: "" }
Types in email "b@"   → { name: "Bh",   email: "b@",  password: "" }
```

---

### Step 4 — `handleSignup` — Runs on Form Submit

**`e.preventDefault()`** — stops the default browser behaviour of refreshing the page on form submit. Without this the page would reload and you'd lose everything.

**Client side validation:**
- Checks all fields are filled before making any API call
- If any field is empty → `handleError` shows a red toast, STOP

**The API call:**
- `fetch` — built-in browser function to make HTTP requests
- `method: "POST"` — tells server this is a POST request
- `headers: { 'Content-Type': 'application/json' }` — tells server the body is JSON. Without this header the server cannot parse `req.body`
- `body: JSON.stringify(signupInfo)` — converts the JavaScript object into a JSON string to send over the network

**Reading the response:**
- `response.json()` — parses the JSON string the server sent back into a JavaScript object
- Destructures `{ success, message, error }` from the result — these are the exact fields your backend always returns

---

### Step 5 — Handling All 3 Response Scenarios

| Scenario | What happens |
|---|---|
| `success: true` | Green toast → wait 1 second → navigate('/login') |
| `error` exists | Red toast with Joi validation error message |
| `success: false` | Red toast with server message (409 user exists etc.) |

`error?.details[0].message` — specifically for Joi errors. When Joi validation fails, the backend sends an `error` object with a `details` array containing the specific rule that failed. The `?.` is optional chaining — safely accesses the property without crashing if `details` is undefined.

---

### Step 6 — The JSX Form

| JSX Part | Purpose |
|---|---|
| `onChange={handleChange}` on every input | Connects each field to `handleChange` so typing updates state |
| `name='email'` attribute on inputs | This is what `e.target.name` reads — must match state keys exactly |
| `onSubmit={handleSignup}` on form | Runs `handleSignup` when button is clicked |
| `<Link to="/login">` | Navigates to login page without page reload |
| `<ToastContainer />` | Must be present in JSX for toast notifications to appear on screen |

---

### Complete Signup Flow

```
User fills name, email, password
          ↓
Every keystroke → handleChange → updates signupInfo state
          ↓
User clicks Signup button
          ↓
handleSignup runs → e.preventDefault()
          ↓
Client validation → are all fields filled?
          ↓ no  → handleError toast, STOP
          ↓ yes → continue
          ↓
POST /auth/signup with { name, email, password } in body
          ↓
Server responds with { success, message, error }
          ↓
success: true  → green toast → wait 1s → navigate('/login')
error exists   → red toast with Joi error message
success: false → red toast with server message (409 etc)
```

---

## `utils.js` — Reusable Helper Functions

### What is a utils file?

`utils` stands for **utilities** — a file that holds small reusable helper functions used across multiple components. Instead of writing the same toast code in every component, you write it once here and import it wherever needed.

---

### What it does

Wraps `react-toastify`'s toast functions into two simple functions with a fixed position — so you never repeat the config in every component.

| Function | Toast Type | Used When |
|---|---|---|
| `handleSuccess(msg)` | Green toast — top right | Signup success, login success |
| `handleError(msg)` | Red toast — top right | Validation fail, wrong password, server error |

---

### Why `export` on each function?

These are **named exports** — each function is exported individually so any component imports only what it needs:

- `import { handleError, handleSuccess } from '../utils'` — imports both
- `import { handleError } from '../utils'` — imports only what is needed

---

### Where it is used in your project

```
utils.js defines   →   handleSuccess, handleError

Signup.js uses     →   handleError  (validation fail, api fail)
                       handleSuccess (signup worked)

Login.js uses      →   handleError  (wrong credentials)
                       handleSuccess (login worked)
```

---

### Mental Model

```
utils.js       =   a toolbox
handleSuccess  =   green stamp tool
handleError    =   red stamp tool

Any component that needs to show a notification
just borrows the tool from the toolbox.
```

---

## Frontend — Login Component Flow

This file is very similar to Signup but has 3 important differences. Same patterns are noted briefly, differences are explained in full.

---

### Step 1 — State Setup

Same pattern as Signup but only 2 fields since login doesn't need a name:
`useState({ email: '', password: '' })`

---

### Step 2 — `handleChange`

Exactly the same as Signup — tracks every keystroke, uses spread operator, updates `loginInfo` state via `e.target.name` and `e.target.value`.

---

### Step 3 — `handleLogin` — Key Differences from Signup

**Same as Signup:** `e.preventDefault()`, client validation, fetch POST request, handles Joi errors and server errors the same way.

**Different — destructures 2 extra fields from the response:**

Login expects `jwtToken` and `name` back from the server because the backend sends them on successful login. Signup never returns these.

**Different — stores token and name to localStorage on success:**

- `localStorage.setItem('token', jwtToken)` — saves the JWT token in the browser. This token will be sent in the `authorization` header on every protected API call going forward.
- `localStorage.setItem('loggedInUser', name)` — saves the user's name so the Home page can display "Welcome Bhuvanesh" without making another API call.

**Different — redirects to `/home` not `/login`**

---

### Step 4 — Controlled Component — `value={loginInfo.email}`

```
<input value={loginInfo.email} onChange={handleChange} />
```

This makes the input a **controlled component** — React controls what is displayed in the input, not the browser. The input always shows exactly what is in state. If you programmatically clear the state, the input clears too. React is the single source of truth for the field's value.

---

### Complete Login Flow

```
User fills email and password
          ↓
Every keystroke → handleChange → updates loginInfo state
          ↓
User clicks Login button
          ↓
handleLogin runs → e.preventDefault()
          ↓
Client validation → are both fields filled?
          ↓ no  → handleError toast, STOP
          ↓ yes → continue
          ↓
POST /auth/login with { email, password } in body
          ↓
Server responds with { success, message, jwtToken, name, error }
          ↓
success: true  → green toast
               → localStorage.setItem('token', jwtToken)
               → localStorage.setItem('loggedInUser', name)
               → wait 1s → navigate('/home')
error exists   → red toast with Joi error message
success: false → red toast with server message (401 etc)
```

---

### Signup vs Login — Key Differences

| | Signup | Login |
|---|---|---|
| State fields | name, email, password | email, password |
| API endpoint | `/auth/signup` | `/auth/login` |
| On success | navigate('/login') | navigate('/home') |
| Stores to localStorage | Nothing | token + name |
| Extra response fields | None | jwtToken, name |
| Redirect destination | Login page | Home page |

---

## Frontend — Home, RefreshHandler & App.js

These 3 files together add 4 new features: the Home page, Logout, Private Route protection, and persistent login on page refresh.

---

### New Feature 1 — Home Page (`Home.js`)

**`useEffect` to load username:**

`useEffect` with an empty dependency array `[]` runs only once — when the component first mounts. It reads the name from localStorage and sets it into state so the page displays "Welcome Bhuvanesh!".

**`handleLogout`:**

Logout is entirely a frontend operation — the server is never contacted:
- `localStorage.removeItem('token')` — deletes the JWT token
- `localStorage.removeItem('loggedInUser')` — deletes the stored name
- Shows green toast "User Logged Out"
- After 1 second → `navigate('/login')`

Once the token is removed, the private route will block access to `/home` if the user tries to go back.

**`fetchProducts` — sending JWT token in headers:**

This is where the JWT token stored during login is actually used. It is read from localStorage and sent in the `Authorization` header:

`headers: { 'Authorization': localStorage.getItem('token') }`

Your backend Auth.js middleware reads `req.headers['authorization']`, verifies the token, and only then returns the products data.

**`useEffect` to fetch products:**

Second `useEffect` with `[]` — also runs once on mount, calls `fetchProducts` immediately when the Home page loads.

**Rendering products:**

`products && products?.map(...)` — the `&&` checks products is not empty before trying to map. The `?.` is optional chaining — safely calls `.map()` without crashing if products is undefined.

---

### Home Page Flow

```
User lands on /home
          ↓
useEffect runs → reads localStorage → setLoggedInUser(name)
useEffect runs → fetchProducts()
          ↓
GET /products with Authorization header containing JWT token
          ↓
Backend Auth.js verifies token
          ↓ invalid → 401
          ↓ valid   → returns products array
          ↓
setProducts(result) → products render on screen
          ↓
User clicks Logout
          ↓
localStorage cleared → toast → navigate('/login')
```

---

### New Feature 2 — Private Route (`App.js`)

```
const PrivateRoute = ({ element }) => {
    return isAuthenticated ? element : <Navigate to="/login" />
}
```

`PrivateRoute` is a wrapper component that checks `isAuthenticated` state:
- `true` → render the actual page (Home)
- `false` → redirect to `/login` immediately

It is used on the `/home` route:
`<Route path='/home' element={<PrivateRoute element={<Home/>}/>} />`

**Route structure in App.js:**

| Route | Component | Protected? |
|---|---|---|
| `/` | Redirects to `/login` | No |
| `/login` | Login component | No |
| `/signup` | Signup component | No |
| `/home` | Home via PrivateRoute | Yes |

---

### New Feature 3 — Persistent Login on Refresh (`RefreshHandler.js`)

This is the most important new addition. Without it, every time the user refreshes the page `isAuthenticated` resets to `false` and they get kicked back to `/login` even though their token is still in localStorage.

**`useLocation`** — gives you the current URL path the user is on.

**What RefreshHandler does:**

Every time the URL changes, it checks localStorage for a token:
- Token found → `setIsAuthenticated(true)` → user stays logged in
- If user is on `/`, `/login`, or `/signup` with a valid token → redirect to `/home` (they're already logged in, no need to see login page again)

**Why `{replace: false}` in navigate:**

Keeps the browser history so the user can press the back button. `replace: true` would overwrite the history entry.

**Why it returns `null`:**

RefreshHandler is an invisible component — it renders nothing on screen. It only runs logic. Returning `null` means "render nothing but still run the useEffect".

---

### RefreshHandler Flow

```
User refreshes page / URL changes
          ↓
RefreshHandler useEffect runs
          ↓
localStorage.getItem('token') exists?
          ↓ no  → isAuthenticated stays false → PrivateRoute blocks /home
          ↓ yes → setIsAuthenticated(true)
                → is user on /, /login, or /signup?
                      ↓ yes → navigate('/home') — already logged in
                      ↓ no  → stay on current page
```

---

### How All 3 Files Work Together

```
App.js            →   defines routes, holds isAuthenticated state
                      PrivateRoute protects /home

RefreshHandler    →   runs on every URL change
                      reads token from localStorage
                      keeps isAuthenticated in sync with localStorage

Home.js           →   displays username from localStorage
                      fetches products with JWT token in header
                      handles logout by clearing localStorage
```

---

### Complete Authentication Flow End to End

```
SIGNUP
User signs up → saved to DB → redirected to /login

LOGIN
User logs in → token + name stored in localStorage
→ isAuthenticated = true → navigate('/home')

HOME
RefreshHandler sees token → setIsAuthenticated(true)
Home loads → fetches products with token in header
Server verifies token → returns products

REFRESH PAGE
RefreshHandler runs → token in localStorage → setIsAuthenticated(true)
PrivateRoute allows /home → user stays on page

LOGOUT
localStorage cleared → isAuthenticated = false
PrivateRoute blocks /home → redirected to /login

TOKEN EXPIRES
Server returns 401 on any API call
Frontend should clear localStorage → redirect to /login
```

---

## Frontend — Home, RefreshHandler & App.js

### What is New in These 3 Files

These 3 files together add 4 new features that didn't exist in Login and Signup:
- Displaying the logged-in user's name
- Fetching and displaying products from the protected API
- Logout functionality
- Private routing + authentication persistence on page refresh

---

## `Home.js`

### 1. `useEffect` — runs code when component loads

`useEffect` is a React hook that runs a function **after the component renders**. The empty array `[]` as second argument means it runs only once — when the component first loads, not on every re-render.

Home uses two `useEffect` calls:

**First `useEffect` — loads the username:**
```
useEffect(() => {
    setLoggedInUser(localStorage.getItem('loggedInUSer'))
}, [])
```
On page load, reads the name stored in localStorage during login and puts it in state so it shows in `Welcome {loggedInUSer}!`.

**Second `useEffect` — fetches products:**
```
useEffect(() => {
    fetchProducts()
}, [])
```
On page load, immediately calls `fetchProducts()` to get the products list from the backend.

---

### 2. `fetchProducts` — authenticated API call

This is where the JWT token is actually used for the first time on the frontend:

- Reads token from localStorage: `localStorage.getItem('token')`
- Puts it in the `Authorization` header of the request
- Calls `GET /products` on the backend
- Backend middleware reads `req.headers['authorization']`, verifies the token
- If valid → returns products array
- `setProducts(result)` — saves products into state so they render on screen

---

### 3. `handleLogout`

```
localStorage.removeItem('token')
localStorage.removeItem('loggedInUser')
handleSuccess('User Logged Out')
setTimeout(() => navigate('/login'), 1000)
```

- Removes both token and name from localStorage
- Shows green toast
- Redirects to `/login` after 1 second
- Server is never notified — JWT is stateless, server has nothing to delete

---

### 4. Rendering Products

```
products && products?.map((item, index) => { ... })
```

- `products &&` — only renders if products is not empty (guard check)
- `products?.map()` — optional chaining, safely maps even if products is undefined
- Each product is rendered in a list with name and price

---

## `RefreshHandler.js`

### What Problem Does it Solve?

Without this, if a logged-in user **refreshes the page**, `isAuthenticated` resets to `false` (because React state resets on refresh) and the user gets kicked to `/login` even though their token is still valid in localStorage.

`RefreshHandler` fixes this by checking localStorage on every page load and route change.

---

### How it Works

- `useLocation()` — detects the current URL path
- `useEffect` runs every time the location changes
- Checks if a token exists in localStorage
- If token exists → sets `isAuthenticated` to `true` via `setIsAuthenticated`
- If user is on `/`, `/login`, or `/signup` while already having a token → redirects to `/home` (they are already logged in, no need to see login page)
- Returns `null` — renders nothing visible, it is an invisible background component

---

### Flow

```
Page loads or URL changes
          ↓
RefreshHandler useEffect runs
          ↓
localStorage has token?
          ↓ yes → setIsAuthenticated(true)
                  on /login or /signup? → redirect to /home
          ↓ no  → do nothing, let PrivateRoute handle it
```

---

## `App.js`

### What is New

**`isAuthenticated` state:**
```
const [isAuthenticated, setIsAuthenticated] = useState(false)
```
A single true/false flag that controls whether the user can access private routes. Starts as `false` on every page load — `RefreshHandler` sets it to `true` if a token exists.

**`PrivateRoute` component:**
```
const PrivateRoute = ({ element }) => {
    return isAuthenticated ? element : <Navigate to="/login" />
}
```
A guard component — if `isAuthenticated` is true, renders the requested page. If false, redirects to `/login`. Used like this:
```
<Route path='/home' element={<PrivateRoute element={<Home/>}/>} />
```

**`RefreshHandler` in JSX:**
```
<RefreshHandler setIsAuthenticated={setIsAuthenticated} />
```
Sits outside `<Routes>` so it runs on every route change. Passes `setIsAuthenticated` down as a prop so `RefreshHandler` can update the authentication state.

**Route definitions:**

| Route | Component | Protected? |
|---|---|---|
| `/` | Redirects to `/login` | No |
| `/login` | Login page | No |
| `/signup` | Signup page | No |
| `/home` | Home page via PrivateRoute | Yes |

---

### Complete Flow — All 3 Files Together

```
User opens app / refreshes page
          ↓
RefreshHandler checks localStorage for token
          ↓ token exists → isAuthenticated = true
          ↓ no token     → isAuthenticated = false
          ↓
User visits /home
          ↓
PrivateRoute checks isAuthenticated
          ↓ true  → render Home component
          ↓ false → redirect to /login

User on Home page
          ↓
useEffect loads username from localStorage
useEffect calls fetchProducts with token in header
          ↓
Products displayed on screen

User clicks Logout
          ↓
Token removed from localStorage
isAuthenticated becomes false on next route change
Redirected to /login
```

---

## Deploying to Vercel

The project has two separate deployments on Vercel — one for the backend and one for the frontend. Each has its own `vercel.json` configuration file.

---

### Why Two Separate Deployments?

Backend and frontend are completely separate projects with different tech stacks. Backend runs Node.js on a server. Frontend is a static React build served from a CDN. Vercel handles both but they need to be deployed independently.

```
auth-mern-app/
├── Backend/    → deploys as a Node.js serverless app
└── Frontend/   → deploys as a static React site
```

---

### Backend — `vercel.json`

```json
{
    "version": 2,
    "builds": [{ "src": "index.js", "use": "@vercel/node" }],
    "routes": [{ "src": "/(.*)", "dest": "index.js" }]
}
```

**Line by line:**

| Field | Purpose |
|---|---|
| `"version": 2` | Tells Vercel to use configuration version 2 (current standard) |
| `"builds"` | Tells Vercel how to build the project |
| `"src": "index.js"` | The entry point of your backend — where the Express server starts |
| `"use": "@vercel/node"` | Tells Vercel to treat this as a Node.js app |
| `"routes"` | Defines how incoming URLs are handled |
| `"src": "/(.*)"` | Matches every URL — `(.*)` means any path |
| `"dest": "index.js"` | Send every request to `index.js` — Express then handles routing |

Without `routes`, Vercel wouldn't know to send `/auth/login` or `/products` to your Express app. This config says "no matter what URL is hit, hand it to `index.js`".

---

### Frontend — `vercel.json`

```json
{
    "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

**Line by line:**

| Field | Purpose |
|---|---|
| `"rewrites"` | Redirects requests to a different destination without changing the URL |
| `"source": "/(.*)"` | Matches every URL the user visits |
| `"destination": "/index.html"` | Always serve `index.html` regardless of the URL |

**Why is this needed?**

React is a Single Page Application (SPA) — there is only ONE actual HTML file (`index.html`). React Router handles `/login`, `/signup`, `/home` entirely in the browser using JavaScript. These are not real server-side pages.

Without this config, if a user visits `yourapp.vercel.app/home` directly or refreshes the page, Vercel looks for an actual `/home` file on the server, finds nothing, and returns a 404 error.

With this config, every URL always serves `index.html` and React Router takes over from there.

```
User visits /home directly in browser
          ↓
Without vercel.json → Vercel looks for /home file → 404 NOT FOUND
          ↓
With vercel.json    → Vercel serves index.html → React Router
                      reads the URL → renders Home component ✅
```

---

### After Deploying — Update API URLs

Once both are deployed, your frontend API calls need to point to the live backend URL instead of `localhost`:

```
Before (local):
"http://localhost:8181/auth/login"
"http://localhost:8181/products"

After (production):
"https://your-backend.vercel.app/auth/login"
"https://your-backend.vercel.app/products"
```

Also add the frontend's Vercel URL to your backend's CORS config so cross-origin requests are allowed.

---

### Deployment Summary

| | Backend | Frontend |
|---|---|---|
| What it is | Node.js + Express | React SPA |
| Entry point | `index.js` | `index.html` |
| Key config | Routes all URLs to Express | Rewrites all URLs to index.html |
| Why needed | Vercel needs to know it's a Node app | Fixes 404 on page refresh in React Router |
