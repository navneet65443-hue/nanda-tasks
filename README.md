# Nanda Tasks — Android app (free cloud build)

This builds a **real Android app (.apk)** of the Nanda Tasks planner, with **native
notifications** that fire even when the app is fully closed — no server needed.

You don't need to install anything on your computer. GitHub builds the APK for you
**for free**. Follow these steps once.

---

## Step 1 — Make a free GitHub account
Go to https://github.com and sign up (free). Skip if you already have one.

## Step 2 — Create a new repository
1. Click the **+** at the top-right → **New repository**.
2. Repository name: `nanda-tasks` (any name is fine).
3. Choose **Private** (recommended) or Public.
4. Click **Create repository**.

## Step 3 — Upload these files
1. On the new repo page, click **uploading an existing file** (the link in the middle).
2. **Drag in EVERYTHING from this folder** — the `www` folder, `resources` folder,
   the `.github` folder, `package.json`, and `capacitor.config.json`.
   - Tip: easiest is to drag the files and folders together. The `.github` folder
     must keep its name (it starts with a dot) — if your computer hides it, upload
     its contents into a folder you name `.github/workflows`.
3. Scroll down, click **Commit changes**.

## Step 4 — Let GitHub build it
1. Click the **Actions** tab at the top of the repo.
2. You'll see **"Build Android APK"** running (a yellow dot). It takes about 3–5 minutes.
3. When it turns into a **green tick**, click into that run.
4. Scroll to the bottom — under **Artifacts** there's **`nanda-tasks-apk`**.
   Click it to download a zip. Inside is **`app-debug.apk`**.

   (If it shows a **red X** instead, open the run, copy the red error text, and send
   it to me — I'll tell you the exact fix. First builds sometimes need one tweak.)

## Step 5 — Install on an Android phone
1. Send `app-debug.apk` to the phone (WhatsApp to yourself, email, or USB).
2. Tap it to install. Android will ask to allow **"Install unknown apps"** — allow it
   once for the app you're installing from (e.g. Files or WhatsApp).
3. Open **Nanda Tasks**. When it asks to allow notifications, tap **Allow**.

That's it — it's now a real app on the home screen, and task reminders will fire
even when it's closed.

---

## Updating the app later
When I send you a new version, just re-upload the changed files in **Step 3**
(GitHub will ask to replace them), and the **Actions** tab builds a fresh APK
automatically. Re-install it on the phones the same way.

## Notes
- This is a **debug** APK — perfect for installing on your own staff phones.
  (A Play Store release needs an extra signing step we can do later if you ever want it.)
- The app icon is the default for now; once the build works we can swap in the
  Nanda logo as the icon.
