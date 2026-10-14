# TeX to Docs

Paste LaTeX on the left, see it rendered on the right, and send it to Google Docs with one click. Equations arrive as **native, editable Google Docs equations**, not images.

Everything runs in your browser. There is no server and no database: the site signs you in with Google, builds a Word file with real equations, and uploads it to your Drive, where Google converts it into a Google Doc.

## What it supports

- Inline math: `$...$` and `\(...\)`
- Display math: `$$...$$`, `\[...\]`, and `equation`, `align`, `gather` and `multline` (with or without `*`)
- `\section`, `\subsection`, `\subsubsection` (these become Google Docs headings)
- `itemize` and `enumerate` lists
- `\textbf`, `\textit`, `\emph`, `\underline`, `\texttt`
- `\title` and `\author` when you paste a full document with `\begin{document}`
- `%` comments are ignored; the preamble (`\documentclass`, `\usepackage`) is skipped

An equation with an error is underlined in red in the preview; hover it to see the error message. If you send anyway, it goes into the doc as red text so you can find it.

Shortcuts: **Ctrl/Cmd + S** sends to Google Docs. Your text and doc name are saved in this browser.

The first send creates a new Google Doc. After that, the button says **Update Google Doc** and overwrites the same doc each time. Click **New doc next time** to start a fresh doc on the next send.

> Updating replaces the doc's whole contents with what's in the editor, so make edits in the editor, not in the Google Doc.

---

## Setup

You need two things: a Google OAuth client ID (free, about 10 minutes) and a Vercel deployment.

### 1. Create the Google OAuth client

1. Go to <https://console.cloud.google.com/> and create a project (for example, "TeX to Docs").
2. Open **APIs & Services › Library**, search for **Google Drive API**, and click **Enable**.
3. Open **Google Auth Platform** (also listed as **OAuth consent screen**) and click **Get started**:
   - App name: `TeX to Docs`; support email: your email.
   - Audience: **External**.
   - Contact email: your email. Agree and click **Create**.
4. Under **Audience › Test users**, click **Add users** and add your own Gmail address. Leave the app in **Testing**; that's all you need for personal use, and it avoids Google's review process.
5. Under **Data Access**, click **Add or remove scopes** and add `https://www.googleapis.com/auth/drive.file`. This scope only lets the site see files it created itself, not the rest of your Drive.
6. Under **Clients**, click **Create client**:
   - Application type: **Web application**
   - Authorized JavaScript origins: add `http://localhost:3000` now. You'll add your Vercel URL in step 3 below.
   - No redirect URIs are needed.
7. Copy the **Client ID** (it ends in `.apps.googleusercontent.com`). It isn't a secret, but there's no need to share it.

### 2. Deploy to Vercel

**Option A: through GitHub (recommended)**

1. Create a new GitHub repository, click **uploading an existing file**, select all the files in this folder and drag them in.
2. In Vercel, click **Add New › Project** and import the repository. Keep the framework preset as **Other**; the included `vercel.json` already sets the build command and output folder.
3. Under **Environment Variables**, add `GOOGLE_CLIENT_ID` with the client ID from step 1.
4. Click **Deploy**.

**Option B: from your terminal**

```bash
npm install
npx vercel                  # follow the prompts
npx vercel env add GOOGLE_CLIENT_ID
npx vercel --prod
```

### 3. Allow your Vercel URL in Google

Back in Google Cloud, open **Clients**, open your web client, and add your production URL (for example `https://tex-to-docs.vercel.app`) under **Authorized JavaScript origins**. Save. It can take a few minutes to take effect.

Open the site, click **Send to Google Docs**, choose your account, and allow access. Because the app is in Testing mode, Google shows a "Google hasn't verified this app" screen; click **Continue**. This is expected for personal apps.

---

## Running it locally

```bash
npm install
GOOGLE_CLIENT_ID=your-id.apps.googleusercontent.com npm run dev
```

Then open <http://localhost:3000>.

## Troubleshooting

- **"redirect_uri_mismatch" or "origin not allowed"**: the exact URL you opened (including `https://` and no trailing slash) isn't in **Authorized JavaScript origins**.
- **"access_denied"**: your Google account isn't in the **Test users** list.
- **The button opens a setup dialog**: `GOOGLE_CLIENT_ID` wasn't set when Vercel built the site. Add it, then redeploy.
- **Sign-in window doesn't appear**: allow pop-ups for the site.
- **An equation looks different in Google Docs than in the preview**: the preview uses KaTeX, while Google Docs draws its own equations. Most math matches. Multi-line alignments (`align`) arrive as an equation laid out in a grid, and a few rare commands may not have a Google Docs equivalent. **Download .docx** lets you check the file in Word.

## How it works

1. `src/convert.js` parses the LaTeX into paragraphs, headings, lists and equations.
2. Each equation is rendered to MathML with KaTeX, then converted to Office Math (OMML), the equation format Word uses.
3. A small `.docx` file is assembled in the browser with JSZip.
4. The site uploads it to Google Drive and asks Drive to convert it to a Google Doc. Drive turns the Office Math into Google Docs equations.

Project layout (every file sits at the top level, so you can drag them all into GitHub at once):

```
index.html      the page
style.css       the styles
app.js          the editor, LaTeX converter, Google sign-in and upload (pre-built)
build.mjs       copies the site into public/ and writes config.js from GOOGLE_CLIENT_ID
vercel.json     build settings for Vercel
package.json    tells Vercel how to run the build
```
