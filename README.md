## Setting Up the Frontend

This project uses **Create React App (CRA)** to scaffold the React frontend.

### What is Create React App?

CRA is an official React tool that sets up a ready-to-use React project for you in one command. It comes pre-configured with:
- **Webpack** — bundles all your JS/CSS files for the browser
- **Babel** — converts modern JavaScript & JSX into browser-compatible code
- **Dev Server** — runs your app locally with live reload on file save

No manual configuration needed — you can start writing React code immediately.

### Create the App

```bash
npx create-react-app my-app
```

### Start the Dev Server

```bash
cd my-app
npm start
```

App runs at **http://localhost:3000**

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

---

### The Fix — run these commands one by one

**Step 1: Remove the nested `.git` folder from frontend**

```bash
cd frontend
rm -rf .git
```

On Windows PowerShell specifically:

```powershell
Remove-Item -Recurse -Force frontend\.git
```

**Step 2: Go back to root and remove frontend from git's index**

```bash
cd ..
git rm --cached frontend
```

**Step 3: Now add everything fresh**

```bash
git add .
git commit -m "fix: remove nested git repo from frontend"
git push
```

---

### Why does CRA do this?

CRA automatically runs `git init` in the new project folder because it assumes you're starting a standalone frontend project. It doesn't know you already have a parent git repo. Vite does the same thing by the way — this problem would have happened with either tool.

### How to avoid this next time

After running `npx create-react-app frontend`, immediately delete the `.git` folder inside it before doing your first `git add .` in the parent folder.

---

## Backend Dependencies

### Install Command

```bash
npm i express jsonwebtoken bcrypt body-parser dotenv mongoose joi cors
```

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
