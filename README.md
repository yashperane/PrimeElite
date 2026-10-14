# PRIME ELITE

PRIME ELITE is a production-ready, full-stack MERN multi-book reading and publishing platform designed specifically for authors publishing long-form books with multiple chapters. It provides a mobile-first reading experience with deep Unicode and Marathi (Devanagari) typography support, paired with an admin suite featuring an append-only revision history and snapshot restoration system.

---

## 1. Features

### Reader Experience (Mobile-First)
- **Home**: Grid of book cards showcasing dynamic Lucide cover icons, customizable background palettes, chapter counts, and descriptions.
- **Book Overview**: Chapter table of contents, estimated reading time per chapter, and a "Continue Reading" button linked to local progress.
- **Distraction-Free Reading**: Clean layout with top reading progress bar, floating header, and previous/next chapter navigation.
- **Local Progress Persistence**: Automatic per-book bookmarking of last-read chapter and scroll position in `localStorage`.
- **Customizable Reader Typography**:
  - Themes: Light, Dark, Sepia.
  - Devanagari Fonts: Noto Sans Devanagari, Mukta, Noto Serif Devanagari.
  - Interactive sliders for font size (px/rem) and line height (defaulting to 1.9 for optimal Devanagari readability).
- **Rich Markdown Support**:
  - Headings, lists, code blocks, images, and mobile-friendly horizontally scrollable tables.
  - GitHub-style callout blocks: `> [!TIP]`, `> [!EXAMPLE]`, `> [!WARNING]`, and `> [!NOTE]` rendered as custom cards with Lucide icons (Lightbulb, BookOpenCheck, TriangleAlert, Info).
- **Search**: Cross-book text search across published chapters with highlighted query matches and context snippets.
- **Progressive Web App (PWA)**: Offline chapter caching via service worker (`sw.js`) and web app manifest (`manifest.json`).

### Admin Management (`/admin`)
- **Dashboard**: Book list with drag-and-drop and touch reordering, live status toggling (draft vs. published), and soft-delete to Trash.
- **Icon & Color Picker**: Curated set of Lucide icons and color swatches for book covers.
- **Chapter Manager**: Drag-and-drop chapter ordering (works seamlessly on desktop and touch devices), bulk markdown import, export, and manual snapshot triggers.
- **Bulk Markdown Import**: Paste markdown or upload `.md` files; automatically splits content into chapters at every `# ` top-level heading. Automatically takes a full safety snapshot prior to import.
- **Chapter Editor**:
  - Markdown editor with quick toolbar (Bold, Italic, Headings, Lists, Quotes, Tables, Links, Images).
  - One-tap buttons for inserting `TIP`, `EXAMPLE`, `WARNING`, and `NOTE` callout blocks.
  - Side-by-side live preview on desktop and tab switcher on mobile.
  - Word counter and auto-calculated reading time.
  - Auto-save debouncing every 30 seconds plus manual save with "unsaved changes" warning.
- **Revision History & Diff Drawer**:
  - Complete, append-only history of every manual save, restore, import, and autosave (debounced to 5-minute intervals when content changes).
  - Line-by-line diff viewer comparing any revision to current text (green additions, red removals).
  - One-click revision restore (creates a new revision entry; never erases history).
- **Book History**:
  - **Timeline Tab**: Full chronological activity log of all book and chapter events, filterable by action type.
  - **Versions Tab**: List of full book snapshots (manual and auto-generated). Supports instant rollback/restore (takes a snapshot of current state first) and whole-book download (`.json` or `.md`).
  - **Changes Tab**: Historical log of book metadata changes (title, author, icon, color, status).
- **Trash & Safe Permanent Deletion**:
  - Soft-delete sends books and chapters to Trash.
  - One-click restore from trash.
  - Permanent deletion requires typing the exact title to confirm; a final snapshot is taken and historical audit documents are preserved.

---

## 2. Tech Stack

- **Frontend**: React 18, Vite, React Router, Tailwind CSS, Axios, Lucide React, React Markdown (`remark-gfm`, `rehype-sanitize`), Diff.
- **Backend**: Node.js, Express (ES modules), Mongoose.
- **Security**: Helmet, CORS whitelist, express-rate-limit, bcryptjs, httpOnly cookies, Zod schema validation.
- **Icons & Emoji Policy**: Exclusively uses `lucide-react`. Zero emoji across all components, seed data, and generated content.

---

## 3. Project Structure

```
PrimeElite/
├── package.json               # Root monorepo script runner
├── server/
│   ├── package.json
│   ├── .env.example
│   └── src/
│       ├── config/            # db.js, env.js, cloudinary.js
│       ├── models/            # Book, Chapter, ChapterRevision, BookRevision, BookSnapshot, ActivityLog, Admin
│       ├── middleware/        # auth.js, validate.js, rateLimiter.js, errorHandler.js
│       ├── controllers/       # auth, book, chapter, history, trash, public, upload
│       ├── routes/            # auth, books, chapters, trash, public
│       ├── utils/             # diffHelper, readingTime, markdownSplitter, exporter
│       ├── seed.js            # Sample Marathi book and admin seed script
│       └── index.js           # Server entry point
└── client/
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── index.html
    ├── public/                # icon.svg, manifest.json, sw.js
    └── src/
        ├── api/               # Axios client instance
        ├── context/           # AuthContext, ReaderSettingsContext, ToastContext
        ├── components/
        │   ├── common/        # Navbar, Footer, Modal, Drawer, Toast, DiffViewer, ConfirmModal, Skeleton, EmptyState, LucideIcon
        │   ├── reader/        # BookCard, CalloutBox, MarkdownRenderer, ReadingProgressBar, ChapterNav, ReaderSettingsModal
        │   └── admin/         # BookFormModal, IconAndColorPicker, ChapterEditorToolbar, BulkImportModal, VersionSnapshotModal
        ├── pages/
        │   ├── reader/        # HomePage, BookDetailPage, ChapterReaderPage, SearchPage
        │   └── admin/         # AdminLoginPage, AdminDashboardPage, AdminBookManagerPage, AdminChapterEditorPage, AdminHistoryPage, AdminTrashPage
        ├── App.jsx
        └── main.jsx
```

---

## 4. Local Setup & Running

### Prerequisites
- Node.js (v18 or higher)
- A running MongoDB instance (Local MongoDB or MongoDB Atlas connection string)

### 1. Server Configuration
Navigate to `server/` and create your `.env` file:
```bash
cd server
copy .env.example .env
```
Fill in your configuration:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/prime-elite
JWT_SECRET=super_secret_jwt_key_at_least_32_characters_long
ADMIN_EMAIL=admin@primeelite.local
ADMIN_PASSWORD=Admin@PrimeElite2026
CLIENT_URL=http://localhost:5173
```

### 2. Client Configuration
Navigate to `client/` and create your `.env` file:
```bash
cd ../client
copy .env.example .env
```
Ensure `VITE_API_URL` points to your backend:
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Seed Database
Seed the database with the default Admin user and a sample Marathi book containing chapters and TIP/EXAMPLE/WARNING/NOTE callouts:
```bash
npm run seed
```
*(Or from the `server` directory: `node src/seed.js`)*

### 4. Run Development Servers
From the root directory:
```bash
# Terminal 1 - Backend Server (Port 5000)
npm run dev:server

# Terminal 2 - Frontend Client (Port 5173)
npm run dev:client
```

Visit `http://localhost:5173` to explore the reader platform or `http://localhost:5173/admin` to access the admin portal.

---

## 5. How to Add a Book and Chapters

1. Navigate to `/admin/login` and log in with your credentials (`admin@primeelite.local` / `Admin@PrimeElite2026`).
2. Click **"नवीन पुस्तक" (New Book)** on the dashboard.
3. Enter the book title, optional custom slug, author, description, pick a Lucide cover icon and background color, and click **"पुस्तक तयार करा"**.
4. Click **"अध्याय व्यवस्थापन" (Manage Chapters)** on the book card.
5. You can now:
   - Click **"नवीन अध्याय" (New Chapter)** to open the live markdown editor.
   - Use the toolbar to insert formatting and one-tap callouts (`TIP`, `EXAMPLE`, `WARNING`, `NOTE`).
   - Click **"आयात (Import)"** to upload or paste a whole Markdown file. It will automatically split into chapters at `# ` headings.
   - Reorder chapters by dragging the handle or using mobile up/down buttons.

---

## 6. History, Snapshots & Restore Workflow

- **Auto-save & Debounce**: When editing chapters, draft revisions are auto-saved. To prevent database bloat, an auto-save creates a revision only if content actually changed and at least 5 minutes have elapsed since the previous auto-save revision.
- **Manual Saves**: Clicking "Save" always records a revision with source `manual-save`.
- **Revision Diff & Restore**: In the chapter editor, open the History drawer to review all revisions. Clicking any entry highlights differences against current text (green additions, red deletions). Clicking "Restore" creates a fresh revision restoring that content.
- **Full Book Snapshots**:
  - Saved manually at any time via **"आवृत्ती साठवा" (Save Version)** with a custom label.
  - Automatically triggered before any destructive action (bulk import, restoring a snapshot, or permanent deletion).
  - Restoring a snapshot creates an automatic safety snapshot of the current state before rolling back.

---

## 7. Deployment Guide (Free Tier)

### 1. MongoDB Atlas (Free Tier)
1. Create a free M0 cluster at [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Under **Network Access**, add `0.0.0.0/0` (Allow Access from Anywhere).
3. Under **Database Access**, create a user with read/write privileges.
4. Copy your connection string into `MONGODB_URI`.
> **Note on Storage**: Atlas M0 includes 512 MB of free storage. Revisions and snapshots store plain text, meaning thousands of edits consume only a few megabytes. Use the **JSON Export** button periodically to download offline backups.

### 2. Backend on Render
1. Create a new **Web Service** on [Render](https://render.com) linked to your repository.
2. Root Directory: `server`
3. Build Command: `npm install`
4. Start Command: `npm start`
5. Environment Variables:
   - `MONGODB_URI`: Atlas connection string
   - `JWT_SECRET`: Random 32+ character string
   - `ADMIN_EMAIL`: Admin email
   - `ADMIN_PASSWORD`: Strong password
   - `CLIENT_URL`: Your deployed frontend URL (e.g. `https://prime-elite.vercel.app`)
   - `NODE_ENV`: `production`
6. Render free instances sleep after 15 minutes of inactivity. Use the `/api/health` endpoint for periodic keep-alive pings (via UptimeRobot or CronJob).

### 3. Frontend on Vercel or Netlify
1. Connect your repository to [Vercel](https://vercel.com) or [Netlify](https://netlify.com).
2. Root Directory: `client`
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Environment Variable:
   - `VITE_API_URL`: Your Render backend URL + `/api` (e.g. `https://prime-elite-api.onrender.com/api`)
6. Ensure SPA rewrite rules are enabled (Vercel routes all paths to `/index.html` by default, or add a `vercel.json` rewrite).

### 4. Cross-Domain Cookie Configuration
When frontend and backend are hosted on different domains, cookies require `sameSite=none` and `secure=true`. This is configured automatically in `server/src/controllers/authController.js` when `NODE_ENV=production`.

---

## 8. Assumptions Made
1. **Admin Single-User Model**: Designed for a single owner/author. The admin account is initialized via environment variables upon seeding.
2. **Marathi & Unicode First**: Full Devanagari typography support with fonts loaded via `display=swap`. English and any Unicode language are also fully supported.
3. **No-Emoji Standard**: All icons throughout the user interface, alerts, badges, and toasts strictly utilize `lucide-react` SVG components.
4. **Cloudinary Optional**: If Cloudinary credentials are not supplied, the editor allows inserting direct image URLs without requiring external cloud accounts.
#   P r i m e E l i t e  
 