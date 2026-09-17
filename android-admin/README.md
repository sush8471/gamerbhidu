# GamerBhidu Admin — Android App

A native Android admin app for managing the [GamerBhidu](https://gamerbhidu.vercel.app) Steam digital games store.
Connects **directly to the same Supabase backend** as your website — any change you make here is instantly live on the website.

---

## ⚡ Tech Stack

| Layer | Technology |
|---|---|
| Language | Kotlin |
| UI | Jetpack Compose + Material 3 |
| Backend | Supabase (Auth, Postgrest, Storage, Realtime) |
| Networking | Ktor Client (Android) |
| Image Loading | Coil |
| Architecture | MVVM + StateFlow |

---

## 🛠️ Setup Instructions (One-Time)

### Step 1 — Open in Android Studio

1. Open **Android Studio**
2. Click **File → Open**
3. Navigate to `d:\Opencode\gamerbhidu-main\android-admin`
4. Click **OK** — Android Studio will detect the Gradle project automatically

---

### Step 2 — Add Your Supabase Credentials

Open [`app/build.gradle.kts`](app/build.gradle.kts) and find these two lines inside `defaultConfig`:

```kotlin
buildConfigField("String", "SUPABASE_URL", "\"YOUR_SUPABASE_URL\"")
buildConfigField("String", "SUPABASE_ANON_KEY", "\"YOUR_SUPABASE_ANON_KEY\"")
```

Replace with your actual values from the **Supabase Dashboard**:
1. Go to [supabase.com](https://supabase.com) → your project
2. **Project Settings → API**
3. Copy **Project URL** → paste as `SUPABASE_URL`
4. Copy **anon/public** key → paste as `SUPABASE_ANON_KEY`

Example:
```kotlin
buildConfigField("String", "SUPABASE_URL", "\"https://xyzabcdef.supabase.co\"")
buildConfigField("String", "SUPABASE_ANON_KEY", "\"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...\"")
```

---

### Step 3 — Sync Gradle

In Android Studio:
- Click **File → Sync Project with Gradle Files**  
- OR click the **elephant 🐘 Sync** icon in the toolbar
- Wait for all dependencies to download (~2-3 minutes first time)

---

### Step 4 — Run the App

**On your physical Android phone (recommended):**
1. On your phone: **Settings → Developer Options → Enable USB Debugging**
2. Connect phone via USB cable
3. Your device will appear in the toolbar device selector
4. Click the **▶ Run** button (green play icon)

**On Android Emulator:**
1. In Android Studio: **Tools → Device Manager → Create Device**
2. Pick any Pixel device, API 33+
3. Click Run ▶

---

## 📱 App Screens

| Screen | Features |
|---|---|
| **Login** | Email + Password auth (same credentials as website admin) |
| **Dashboard** | Live game counts — Total, Visible, Hidden, Upcoming |
| **Games Catalog** | Search, filter by genre/visibility/status, visibility toggle, delete |
| **Game Editor** | Add/Edit with Steam autofill, image upload, auto-discount calc |
| **Social Proofs** | View and delete Trusted By images |

---

## 🔄 How Real-Time Sync Works

Your website and this app share the **exact same Supabase database**.

- Add a game on the app → instantly visible on the website
- Toggle visibility on the app → live update on the website
- Delete a game on the app → gone from the website immediately
- Homepage sections (upcoming, recently-launched) are auto-synced on save

---

## 📁 Project Structure

```
android-admin/
├── app/
│   ├── build.gradle.kts          ← Dependencies + Supabase credentials
│   └── src/main/
│       ├── AndroidManifest.xml
│       └── java/com/gamerbhidu/admin/
│           ├── GamerBhiduAdminApp.kt     ← Supabase singleton init
│           ├── MainActivity.kt           ← Entry point
│           ├── data/
│           │   ├── model/Models.kt       ← Game, Combo, SocialProof types
│           │   └── repository/
│           │       └── AdminRepository.kt ← All Supabase operations
│           └── ui/
│               ├── theme/                ← Colors, Typography, Theme
│               ├── navigation/           ← Screen routes + NavHost
│               └── screens/
│                   ├── login/            ← Login screen + ViewModel
│                   ├── dashboard/        ← Dashboard screen + ViewModel
│                   ├── games/            ← Games list screen + ViewModel
│                   ├── editor/           ← Game editor screen + ViewModel
│                   └── proofs/           ← Social proofs screen + ViewModel
```

---

## 🔒 Security Notes

- The app uses **Supabase Auth** with the same admin account as your website
- Admin session tokens are stored in encrypted SharedPreferences (Android Keystore)
- Backup rules exclude all credential data from cloud/device transfers
- The app is locked to **portrait orientation** to prevent UI issues on tablets

---

## 🚀 Next Improvements (Future)

- [ ] Biometric fingerprint login (after initial sign-in)
- [ ] Supabase Realtime websocket listener (see changes made on website in real-time on the app too)
- [ ] Combos management screen
- [ ] Homepage sections drag-to-reorder
- [ ] Push notifications for new orders (if you add an orders table)
- [ ] Dark/Light theme toggle (currently always dark to match the website)
