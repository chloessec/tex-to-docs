# LaTeX to Docs

Paste LaTeX on the left, see it rendered on the right, and send it to Google Docs with one click. Equations arrive as **native, editable Google Docs equations**, not images.

Everything runs in your browser. There is no server and no database: the site signs you in with Google, builds a Word file with real equations, and uploads it to your Drive, where Google converts it into a Google Doc.

## What it supports

- Inline math: `$...$` and `\(...\)`; display math: `$$...$$`, `\[...\]`, `equation`, `align`, `gather`, `multline` (with or without `*`)
- `\section`, `\subsection`, `\subsubsection` (these become Google Docs headings), and `\title`/`\author`/`\maketitle`
- `itemize`, `enumerate` and `description` lists, including nested lists and custom labels such as `[label=\alph*.]`, `[label=(\roman*)]` or `\item[Q1.]`
- Your own shortcuts: `\newcommand`, `\renewcommand`, `\def`, `\DeclareMathOperator`
- `center`, `flushleft`, `flushright`
- Answer space and layout: `\vspace{2in}`, `\newpage`, `\hspace`, and writing blanks such as `\underline{\hspace{2.5in}}`
- Text styles: `\textbf`, `\textit`, `\emph`, `\underline`, `\texttt`, `\textcolor`, and `{\Large\bfseries ...}`-style size and font switches
- The font size from `\documentclass[12pt]{article}`
- `%` comments are ignored; the rest of the preamble (`\usepackage`, `\setlength`, ...) is skipped
- Simple `tabular` tables come through as one line per row (not as a real table yet)

An equation with an error is underlined in red in the preview; hover it to see the error message. If you send anyway, it goes into the doc as red text so you can find it.

Shortcuts: **Ctrl/Cmd + S** sends to Google Docs. Your text and doc name are saved in this browser.

The first send creates a new Google Doc. After that, the button says **Update Google Doc** and overwrites the same doc each time. Click **New doc next time** to start a fresh doc on the next send.

> Updating replaces the doc's whole contents with what's in the editor, so make edits in the editor, not in the Google Doc.

---

## How I made it

I wanted a quick way to get math from LaTeX into Google Docs without retyping every equation in the Docs equation editor, so I built this as a small site that runs entirely in the browser.

### Connecting it to Google

I created a project in the Google Cloud Console and turned on the **Google Drive API**. Then I set up the OAuth consent screen as an **External** app and left it in **Testing** mode, with my own Gmail as the only test user. That's all a personal tool needs, and it skips Google's app review.

For permissions, I chose the `drive.file` scope. It only lets the site see files it created itself, not the rest of my Drive. Last, I made a **Web application** OAuth client, with `http://localhost:3000` and my Vercel URL as the allowed JavaScript origins.

### Turning equations into real Google Docs equations

The tricky part was getting equations to show up as editable equations instead of images. Google Docs has no direct way to accept LaTeX, but it does convert Word's equation format (Office Math) when it imports a `.docx` file. So the site renders each equation with KaTeX, converts it to Office Math, builds a Word file in the browser, and uploads it to Drive with a request to convert it to a Google Doc. The steps are under [How it works](#how-it-works) below.

### Deploying

I uploaded the files to GitHub and imported the repository into Vercel. The `GOOGLE_CLIENT_ID` environment variable holds my client ID, and `build.mjs` writes it into `config.js` at build time. That's why every file sits at the top level: the whole folder can be dragged into GitHub in one go.

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
logo-*.png      the LaTeX and Google Docs logos in the header
build.mjs       copies the site into public/ and writes config.js from GOOGLE_CLIENT_ID
vercel.json     build settings for Vercel
package.json    tells Vercel how to run the build
```
