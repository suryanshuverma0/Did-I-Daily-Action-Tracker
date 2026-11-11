# Rest Easy: complete guide from code to Google Play earnings

**Project:** Rest Easy: Did I Lock It? · **Package:** `com.suryanshu.resteasy` · **Expo SDK 58** (React Native 0.88, targets Android API 36)

Work through the parts **in order**. Each step says what to click or type and what you should see afterwards. The ⏱ steps involve waiting, so start them as early as you can.

| Part | What | Your time | Waiting |
|---|---|---|---|
| 1 | Install tools | 10 min | – |
| 2 | AdMob account and ad units | 20 min | – |
| 3 | Privacy policy website (GitHub Pages) | 15 min | 2 min |
| 4 | Connect project to Expo | 5 min | – |
| 5 | Test build on your phone | 20 min | ⏱ 15–25 min build |
| 6 | Production build (.aab) | 5 min | ⏱ 15–25 min build |
| 7 | Screenshots | 15 min | – |
| 8 | Play Console: create app and fill forms | 45 min | – |
| 9 | Closed test (12 testers × 14 days) | 30 min | ⏱ **14 days** |
| 10 | Apply for production | 10 min | ⏱ up to 7 days |
| 11 | Production release | 10 min | ⏱ 1–7 days review |
| 12 | After launch: AdMob linking and payments | 20 min | ⏱ 24 h |
| 13 | Shipping updates | – | – |
| 14 | Troubleshooting | – | – |

**Realistic total: about 3–4 weeks** from today to "live on Play Store". Almost all of that is Google's waiting periods.

---

# PART 1: Install the tools (once)

You don't need Android Studio or Java. Expo's cloud service (EAS) builds the app for you.

### 1.1 Check Node.js
Open **PowerShell** (Start menu → type `PowerShell` → Enter) and run:
```powershell
node -v
npm -v
```
✅ You should see `v22.x` (or 20+) and `10.x`. You already have these.

### 1.2 Create a free Expo account
1. Go to **https://expo.dev/signup**
2. Sign up with your email, verify it, and choose a username (e.g. `suryanshu`).

### 1.3 Install the EAS command-line tool
```powershell
npm install -g eas-cli
eas --version
```
✅ Prints something like `eas-cli/18.x.x`.

> If PowerShell says *"running scripts is disabled on this system"*, run this once and answer **Y**:
> `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`

### 1.4 Install project dependencies
```powershell
cd "D:\Mobile App\Did I\DidIApp"
npm install
```
✅ Ends with `added/changed … packages`. Warnings about "vulnerabilities" are normal for React Native projects and safe to ignore.

> **About `.npmrc`:** the project contains `.npmrc` with `legacy-peer-deps=true`. This is needed with SDK 58, because the date picker lists an optional Windows peer that conflicts with React Native 0.88. Don't delete it, or `npm install` and the cloud builds will fail with `ERESOLVE`.

---

# PART 2: AdMob (how you earn money)

### 2.1 Create the account
1. Go to **https://admob.google.com** and click **Get started**.
2. Sign in with the **same Google account** you use for Play Console. This makes linking easier later.
3. Choose your **country** (India) and **time zone**, and accept the terms.
4. If it asks for payment details now, you can fill them in or skip. Payment is only needed once you reach the payout threshold (Part 12).

### 2.2 Add the app
1. Left menu: **Apps → Add app**.
2. Platform: **Android**.
3. "Is the app listed on a supported app store?" → **No** (it isn't on Play yet; you'll link it later).
4. App name: **Rest Easy**.
5. "User metrics": leave enabled → **Add app**.
6. You'll see your **App ID**. Copy it into Notepad. It looks like:
   ```
   ca-app-pub-1234567890123456~9876543210
   ```
   Note the **tilde `~`**. That marks it as the *App ID*.

### 2.3 Create the banner ad unit
1. Click **Add ad unit** (or Apps → Rest Easy → Ad units → Add ad unit).
2. Choose **Banner**.
3. Name: `Banner - all screens` → **Create ad unit**.
4. Copy the **ad unit ID**. It looks like:
   ```
   ca-app-pub-1234567890123456/1111111111
   ```
   Note the **slash `/`**. That marks it as an *ad unit ID*.
5. Click **Done**.

### 2.4 Create the interstitial ad unit
1. **Add ad unit → Interstitial**.
2. Name: `Interstitial - transitions` → **Create ad unit**.
3. Copy this ID too (also contains `/`).

### 2.5 Create the consent message (GDPR)
Without this, users in Europe and the UK can't see any ads, so you'd earn nothing there.
1. Left menu: **Privacy & messaging**.
2. Under **European regulations** → **Create message**.
3. Apps: select **Rest Easy**.
4. Languages: English (add others if you want).
5. **Privacy policy URL:** `https://suryanshuverma0.github.io/Did-I-Daily-Action-Tracker/privacy-policy.html` (you'll create this page in Part 3).
6. Leave the default user choices ("Consent" and "Manage options") as they are.
7. Click **Publish**.
8. Optional but recommended: also go to **US state regulations → Create message**, select Rest Easy, and **Publish**.

The app already contains the code that shows this message (Google UMP) and the **Settings → Ad privacy choices** button that Google requires.

### 2.6 Put your IDs into the app

**File 1: `app.json`.** Find this block:
```json
[
  "react-native-google-mobile-ads",
  {
    "androidAppId": "ca-app-pub-3940256099942544~3347511713",
    "iosAppId": "ca-app-pub-3940256099942544~1458002511"
  }
],
```
Replace **only** the `androidAppId` value with **your App ID** (the one with `~`). Leave `iosAppId` as it is; you're not publishing on iOS.

**File 2: `constants/config.ts`.** Find:
```ts
export const ADMOB_UNITS = {
  banner: 'ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx',
  interstitial: 'ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx',
};
```
Replace with your two **ad unit IDs** (the ones with `/`):
```ts
export const ADMOB_UNITS = {
  banner: 'ca-app-pub-1234567890123456/1111111111',
  interstitial: 'ca-app-pub-1234567890123456/2222222222',
};
```

**File 3: `docs/app-ads.txt`.** Replace `pub-0000000000000000` with your publisher ID. That's the 16 digits after `ca-app-pub-` in any of your IDs, written as `pub-1234567890123456`:
```
google.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0
```

### 2.7 How the app protects you from invalid clicks
- In **development builds**, or while an ID still contains `xxxx`, the app automatically uses **Google's test ads** (they show a "Test Ad" label).
- In your **production build** with real IDs, real ads appear.
- ⚠️ **Never tap real ads in your own app, and never ask friends to tap them.** AdMob detects it and can permanently ban your account.
- To see test ads on your own phone in a production build: run the app, open **AdMob → Settings → Test devices → Add test device**, select Android, and enter your phone's **Advertising ID** (phone Settings → Google → Ads → "Your advertising ID").

### 2.8 How the ads behave (already built in)
| Ad | Where | Rules |
|---|---|---|
| Large anchored adaptive **banner** | Bottom of Today, History, and Settings | Hidden until consent allows ads; collapses if no ad loads |
| **Interstitial** (full screen) | After adding a *new* check, or when opening History | At most **once every 3 minutes**, never in the **first 2 minutes** after launch, never while logging |

To change the frequency, edit `INTERSTITIAL_MIN_INTERVAL_MS` and `INTERSTITIAL_LAUNCH_GRACE_MS` in `constants/config.ts`.

---

# PART 3: Privacy policy and app-ads.txt website (free, no backend)

Google Play **requires** a public privacy-policy URL, and AdMob wants an `app-ads.txt` file. Both are hosted free with **GitHub Pages**.

### 3.1 Privacy policy: ✅ already live
GitHub Pages is switched on for this repo (**Settings → Pages → main / docs**). Every file in the project's **`docs/`** folder is published at:

| Page | URL |
|---|---|
| Home | https://suryanshuverma0.github.io/Did-I-Daily-Action-Tracker/ |
| **Privacy policy** (use this in Play Console and AdMob) | **https://suryanshuverma0.github.io/Did-I-Daily-Action-Tracker/privacy-policy.html** |

To change the policy: edit `docs/privacy-policy.html`, update the "Last updated" date, then `git commit` and `git push`. The site updates within about a minute.

⚠️ **Don't rename the GitHub repo.** The URL contains the repo name, and Play will flag a broken privacy policy link.

### 3.2 app-ads.txt (do this after Part 2, once you have your `pub-` ID)
AdMob only checks `https://suryanshuverma0.github.io/app-ads.txt`, the **root** of your GitHub Pages domain. A project repo can't publish there, so this one file needs a special repo:
1. On GitHub: **+ → New repository**, named **exactly** `suryanshuverma0.github.io`, **Public** → Create.
2. **Add file → Create new file** → name it `app-ads.txt` → paste the line from `docs/app-ads.txt` with your real ID:
   ```
   google.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0
   ```
   → **Commit changes**.
3. **Settings → Pages** → Branch **main** / **(root)** → Save.
4. After 2 minutes, https://suryanshuverma0.github.io/app-ads.txt should show that line.

(If you tell me your `pub-` ID, I can do all four steps for you with the GitHub CLI.)

### 3.3 The "Website" you enter in Play Console
Use `https://suryanshuverma0.github.io/Did-I-Daily-Action-Tracker/`. AdMob reads the domain (`suryanshuverma0.github.io`) from it and finds `app-ads.txt` at the root.

---

# PART 4: Connect the project to your Expo account

In PowerShell, in the project folder:
```powershell
cd "D:\Mobile App\Did I\DidIApp"
eas login
```
Enter your Expo email or username and password. ✅ `Logged in as <username>`.

```powershell
eas init
```
- "Would you like to create a project for @username/rest-easy?" → **Y**

✅ It writes a `projectId` into `app.json` under `extra.eas`. Don't delete it.

---

# PART 5: Test build: install the app on your phone ⏱

### 5.1 Start the build
```powershell
npm run build:apk
```
(This runs `eas build -p android --profile preview`.)

Questions it asks the first time:
| Question | Answer |
|---|---|
| "Generate a new Android Keystore?" | **Y** |

The **keystore** is your app's signing identity. EAS stores it securely in your Expo account. Every future update must be signed with it, so **never delete your Expo project or account**. To back it up: `eas credentials` → Android → production → *Download credentials*. Keep that file private, and never put it on GitHub.

The build uploads your code and queues it in the cloud. Free accounts sometimes wait in a queue; the total is usually 15–25 minutes. You can close PowerShell; the build continues. Track it at **https://expo.dev → your project → Builds**.

### 5.2 Install on your Android phone
1. When the build finishes, open the build page on your **phone's browser** (or scan the QR code shown in PowerShell).
2. Tap **Install** to download the `.apk`.
3. Android will ask to **allow installs from this source** (Chrome). Allow it.
4. Open **Rest Easy**.

### 5.3 Test checklist
Go through every item:
- [ ] The app opens on the purple splash, then the Today screen with 4 example checks
- [ ] Tapping a card: phone vibrates, the card border turns green, it shows "Today at 9:41 PM · just now", and the "Logged … UNDO" bar appears
- [ ] **UNDO** removes that log
- [ ] **Holding** a card opens "Edit check"; change the name, icon, and colour → **Save changes** → the card updates
- [ ] **+** button → a suggestion chip fills in the name and icon → **Add check**
- [ ] Edit a check → turn on **Daily reminder** → allow notifications → set the time 2 minutes ahead → save → the notification arrives
- [ ] Tapping the notification opens the app
- [ ] **History** shows entries grouped as "Today / Yesterday"; filter chips work; holding an entry deletes it
- [ ] **Settings**: switch between 7 / 30 / 90 days / 1 year; **Clear all history** asks for confirmation; **Privacy policy** opens your GitHub page
- [ ] A **"Test Ad"** banner appears at the bottom of each screen (it may take a few seconds)
- [ ] Phone in **dark mode**: the app switches to dark colours
- [ ] Close the app completely and reopen it: your checks and history are still there

If something fails, see Part 14.

### 5.4 (Optional) Live development with instant reload
**Quick UI work → Expo Go:** `npx expo start`, then scan the QR code with the Expo Go app. Everything works **except ads**; the app detects that AdMob's native code is missing and simply hides them. Reminders work too; ignore the yellow "push notifications" warning, because the app only uses local notifications.

**Testing ads → development build** (Expo Go can't include AdMob's native code). For live coding with ads:
```powershell
eas build -p android --profile development
```
Install that APK once, then each time you code:
```powershell
npx expo start --dev-client
```
Scan the QR code with the installed dev app. Code changes appear instantly.

---

# PART 6: Production build (.aab) ⏱

Make sure Part 2.6 is done (real AdMob IDs). Then:
```powershell
npm run build:aab
```
(This runs `eas build -p android --profile production`.)

- It reuses the same keystore automatically.
- `versionCode` is **auto-incremented** by EAS (stored on Expo's servers), so you never edit it by hand.
- When done, open the build page on **expo.dev** and click **Download** to get the `.aab` file (Android App Bundle) onto your computer.

Google requires the **first** upload of a new app to be done by hand in Play Console, which you'll do in Part 9.

---

# PART 7: Screenshots

Play requires **at least 2** phone screenshots; **4–6** is ideal. Use the preview APK from Part 5.

1. Turn on **airplane mode**. The app works fully offline and the ad banner hides itself, so screenshots stay clean.
2. Set up realistic content: 4–5 checks, tap a few so they show "Today at …".
3. Take a screenshot (**Power + Volume Down**) of:
   1. **Today** screen with some cards checked green
   2. **The Undo bar** just after tapping a card
   3. **New check** screen with the reminder switched on and a time shown
   4. **History** with entries from today and yesterday
   5. **Today** screen in **dark mode**
4. Transfer them to your PC (Google Photos, USB, or email to yourself).

Requirements: PNG or JPG, each side 320–3840 px, aspect ratio no more than 2:1. Normal phone screenshots are fine.

**Optional, for better conversion:** in **Canva** (free), search the template "Google Play screenshot", put each screenshot in a phone frame, and add the captions from `STORE_LISTING.md`.

---

# PART 8: Play Console: create the app and complete every form

Open **https://play.google.com/console**.

## 8.1 Create the app
Click **Create app** and fill in:
| Field | Value |
|---|---|
| App name | `Rest Easy: Did I Lock It?` |
| Default language | English (United States) – en-US |
| App or game | **App** |
| Free or paid | **Free** (⚠️ a free app can never be changed to paid later) |
| Declarations | Tick both: *Developer Program Policies* and *US export laws* |

→ **Create app**.

## 8.2 Dashboard → "Set up your app" (App content)
The Dashboard shows a list of tasks. Click each one, answer, and **Save**.

### a) Privacy policy
`https://suryanshuverma0.github.io/Did-I-Daily-Action-Tracker/privacy-policy.html` → Save

### b) App access
**All functionality in my app is available without any access restrictions** → Save

### c) Ads
**Yes, my app contains ads** → Save

### d) Content rating
1. **Start questionnaire**. Email: your email. Category: **All Other App Types** → Next.
2. Answer **No** to every question (violence, fear, sexuality, gambling, drugs, language, crude humour, user-generated content and interaction, sharing location, digital purchases, web browsing, etc.).
3. **Save → Next → Submit**.

✅ Result: **Everyone / PEGI 3 / IARC 3+**.

### e) Target audience and content
1. Target age groups: tick **only "18 and over"**.
   (Selecting any under-13 group puts you in Google's *Families* policy, with stricter ad rules and certified ad networks only.)
2. "Could your store listing unintentionally appeal to children?" → **No** → Save.

### f) News apps
**No** → Save

### g) Data safety (most important form)
This app keeps all user-entered data **only on the phone**. Only the **AdMob SDK** collects data, and it sends that data to Google. Go to **Data safety → Start**:

**Step 1, Data collection and security:**
| Question | Answer |
|---|---|
| Does your app collect or share any of the required user data types? | **Yes** |
| Is all of the user data collected by your app encrypted in transit? | **Yes** |
| Which of the following methods of account creation does your app support? | **My app does not allow users to create an account** |
| Do you provide a way for users to request that their data is deleted? | **No** |

**Step 2, Data types:** tick these.
- Location → **Approximate location**
- App activity → **App interactions**
- App info and performance → **Crash logs**, **Diagnostics**
- Device or other IDs → **Device or other IDs**

**Step 3, Data usage and handling:** for **each** ticked type:
| Question | Answer |
|---|---|
| Collected | ✅ Yes |
| Shared | ✅ Yes (sent to Google for ads) |
| Is this data processed ephemerally? | **No** |
| Is this data required for your app, or can users choose whether it's collected? | **Data collection is required** |
| Why is this user data collected? | **Advertising or marketing**, **Analytics**, **Fraud prevention, security, and compliance** |
| Why is it shared? | Same three |

**Step 4:** Preview → **Submit**.

> These answers are my best reading of Google's AdMob guidance. Google updates that page, so compare once against it: https://developers.google.com/admob/android/privacy/play-data-disclosure

### h) Government apps
**No** → Save

### i) Financial features
**My app doesn't provide any financial features** → Save

### j) Health apps (if this task appears)
The app has a "Took my medicine" example and reminders, so tick **Medication and treatment management** → Save. This is just a declaration; your privacy policy already covers it.

### k) Advertising ID
1. "Does your app use advertising ID?" → **Yes**
2. Purposes: **Advertising or marketing**, **Analytics**, **Fraud prevention, security, and compliance** → Save

## 8.3 Store listing
Left menu → **Grow users → Store presence → Store listings → Default store listing** (or Main store listing).

Copy-paste from **`STORE_LISTING.md`**:
| Field | Value |
|---|---|
| App name | `Rest Easy: Did I Lock It?` |
| Short description | the 78-character line |
| Full description | the full text block |
| App icon | upload `store-assets\play-icon-512.png` |
| Feature graphic | upload `store-assets\feature-graphic.png` |
| Phone screenshots | upload your 4–6 screenshots (Part 7) |
| Tablet screenshots | optional; skip them |

→ **Save**.

## 8.4 Store settings
Left menu → **Store presence → Store settings**:
| Field | Value |
|---|---|
| App category | **Productivity** |
| Tags | Choose up to 5 relevant ones (e.g. Productivity, Habit tracker, Reminders, To-do list, Lifestyle) |
| Email | suryanshuverma42@gmail.com (shown publicly) |
| Phone | optional; leave empty |
| Website | `https://suryanshuverma0.github.io/Did-I-Daily-Action-Tracker/` (⚠️ **required**; AdMob uses its domain to find app-ads.txt) |

→ **Save**.

---

# PART 9: Closed test: 12 testers for 14 days ⏱

**Does this apply to you?** Yes, if your developer account is a **personal** account created **after 13 November 2023**. Google then blocks Production until you run a closed test with **at least 12 testers opted in for 14 days in a row**. (Organisation accounts and older personal accounts can skip to Part 11.)

### 9.1 Collect testers (start now!)
You need **12 minimum; invite 15–20**, because some people forget or uninstall. You need each person's **Gmail address**, the one their Android phone's Play Store uses. Friends, family, classmates, and colleagues all work.

> If you can't find enough people: the subreddit **r/AndroidClosedTesting** and "12 testers / 14 days" communities exchange testing for free. You test their apps and they test yours.

### 9.2 Create the closed testing track
1. Left menu: **Test and release → Testing → Closed testing**.
2. Use the default track **"Closed testing - Alpha"** → **Manage track**.
3. **Countries/regions** tab → **Add countries/regions** → select all (or at least the countries your testers are in) → Save.
4. **Testers** tab → **Create email list**:
   - List name: `Rest Easy testers`
   - Paste all the Gmail addresses, comma-separated → Enter → **Save changes**
   - Tick the list → **Save**.
   - Feedback URL or email: your email.

### 9.3 Upload the first release
1. **Releases** tab → **Create new release**.
2. *Play App Signing*: you'll see "Releases signed by Google Play". Accept or continue. (Google keeps the final app-signing key; your EAS keystore becomes the *upload key*. This is normal and secure.)
3. **App bundles → Upload** → choose the `.aab` from Part 6.
4. Release name: auto-filled (e.g. `1 (1.0.0)`).
5. Release notes:
   ```
   <en-US>
   First test version of Rest Easy. Please try adding checks, logging them and turning on a reminder. Send feedback from Settings → Send feedback.
   </en-US>
   ```
6. **Next → Save → Go to overview → Send changes for review** (on the "Publishing overview" page).

### 9.4 Wait for review
The first review usually takes **a few hours to 3 days**. You'll get an email. Play Console → **Publishing overview** shows the status.

### 9.5 Invite the testers
1. After approval: **Closed testing → Testers** tab → copy the **"Join on Android"** opt-in link.
2. Send it to all testers with a message like:

   > Hi! I've made my first Android app and Google requires 14 days of testing before launch. Could you help?
   > 1. Open this link on your Android phone (signed in with this Gmail): <LINK>
   > 2. Tap **Become a tester**
   > 3. Tap **Download it on Google Play** and install **Rest Easy**
   > 4. Please **keep it installed for 14 days** and open it every few days 🙏
   > Thank you!

3. Track the count: **Dashboard** shows the "*X testers opted in*" and day counters.

### 9.6 During the 14 days
- **Keep testers active.** Remind them on day 5 and day 10 to open the app.
- **Ship at least one update** (it shows Google you're iterating; see Part 13): bump `"version"` to `1.0.1` in `app.json` → `npm run build:aab` → Closed testing → Create new release → upload → send for review.
- **Write down feedback** you receive and what you changed. You'll need it for Part 10.
- If testers uninstall or leave, the count can drop below 12. Invite extra people early.

---

# PART 10: Apply for production access ⏱

When the Dashboard shows that the **14-day requirement is met**:
1. Dashboard → **Apply for production**.
2. Answer the questions honestly and specifically. Example answers:

| Question | Example answer |
|---|---|
| How did you recruit testers? | "Friends, family and classmates, invited through an email list." |
| How easy was it to recruit? | Pick what's true. |
| Describe how testers used your app | "They created their own checks such as locking the door and medicine, logged them daily, used reminders, and checked History." |
| Summarise the feedback you received | "Testers wanted clearer timestamps and an undo for accidental taps. One reminder didn't fire when notifications were blocked." |
| What changes did you make? | "Made the last-done time more visible, added a permission prompt with a link to settings, and fixed small layout issues. Shipped as 1.0.1." |
| Who is the app's intended audience? | "Adults who second-guess everyday tasks like locking doors, switching off the stove or taking medicine." |
| How does your app provide value? | "One-tap logging gives a reliable record, so users don't need to go back and check." |
| Expected installs in the first year | Pick a modest range (e.g. 10K–50K). |
| Is the app ready for production? | Yes |

3. Submit. Google answers by email, usually **within 7 days**. If they reject it, they say why; fix that, extend testing, and apply again.

---

# PART 11: Production release 🎉

1. Left menu: **Test and release → Production**.
2. **Countries/regions** tab → **Add countries/regions** → **select all** → Save. More countries means more ad impressions.
3. **Releases** tab → **Create new release**.
4. **Add from library** → pick your latest tested bundle (e.g. `2 (1.0.1)`). Or upload a new `.aab`.
5. Release notes:
   ```
   <en-US>
   Welcome to Rest Easy! Tap once when you lock the door, turn off the stove or take your pill — and check anytime. Stop second-guessing.
   </en-US>
   ```
6. **Next → Save → Publishing overview → Send changes for review**.
7. Review usually takes **1–7 days**. Once you get the "Your update is live" email, the app is public at:
   `https://play.google.com/store/apps/details?id=com.suryanshu.resteasy`

Search may take a few days to show the app. The direct link works immediately.

---

# PART 12: After launch: connect AdMob and get paid

### 12.1 Link AdMob to the Play listing (important: unlinked apps get limited ads)
1. AdMob → **Apps → View all apps → Rest Easy → App settings**.
2. **App store details → Add** → search `Rest Easy` or `com.suryanshu.resteasy` → select it → Add.
3. AdMob then reviews the app (*"App review: Getting ready"* → *"Ready"*), which takes a few days. Until then ads may be limited.

### 12.2 Verify app-ads.txt
1. AdMob → **Apps → app-ads.txt** tab.
2. After about 24 hours it should show **Verified ✅** for Rest Easy.
3. If it says "Not found": check that the Play listing's **Website** is set (3.3) and that `https://suryanshuverma0.github.io/app-ads.txt` opens.

### 12.3 Payments
1. AdMob → **Payments → Payment info**: name, address, and bank account (in India, also add the IFSC code).
2. Once your earnings reach the **verification threshold**, Google posts a **PIN letter** to your address. Enter that PIN in AdMob → Payments.
3. **Tax info** (AdMob → Payments → Settings → Manage settings → Tax info): as an Indian resident, add your **PAN**, and fill in the US tax form (**W-8BEN**). That avoids the higher US withholding on earnings from US viewers.
4. You get paid around the 21st of each month once your balance passes the **payout threshold** (about US$100 or the local equivalent).

### 12.4 What to expect (honest numbers)
Utility apps with banners typically earn a few US cents to a few tens of cents per daily active user per month, depending heavily on country. Earnings grow with **installs and daily usage**, so ratings and store optimization (below) matter more than adding more ads.

### 12.5 Growth tips (free store optimization)
- **Reply to every review** in the first months.
- Ask friends to search **"did I lock the door"** on Play and install from the search results. That's an early ranking signal for your main keyword.
- After 1–2 weeks: Play Console → **Statistics / Store performance → search terms** shows which words bring installs. Adjust the short description toward them.
- Add **translated listings** (Hindi, Spanish, Portuguese, German) under Store presence → Store listings → *Manage translations*.
- Keep your rating **above 4.3** before adding any new ad formats.

---

# PART 13: Shipping updates

Every update:
1. Make your code changes and test them (a dev build, or a preview APK with `npm run build:apk`).
2. In `app.json`, raise `"version"`: `1.0.0` → `1.0.1` (fixes) or `1.1.0` (features).
3. Build:
   ```powershell
   npm run build:aab
   ```
4. Play Console → **Production** (or Closed testing) → **Create new release** → upload the new `.aab` → release notes → **Send changes for review**.

### Optional: upload from the terminal (skip Play Console uploads)
1. Follow Expo's guide to create a Google **service account** key: https://docs.expo.dev/submit/android/
2. Save the key as `play-service-account.json` in the project folder (already git-ignored; **never** share it).
3. In `eas.json`, under `submit.production.android`, add:
   ```json
   "serviceAccountKeyPath": "./play-service-account.json"
   ```
4. Run:
   ```powershell
   eas submit -p android --latest
   ```
   The release goes to the **internal** track as a **draft** (see `eas.json`). Promote it in Play Console, or change `"track"` to `"production"` once you're confident.

### Keeping Expo up to date
Expo releases a new SDK about 3 times a year. To upgrade later:
```powershell
npm install expo@latest
npx expo install --fix
npx expo-doctor
npm run typecheck
```
Then build a preview APK and run the Part 5 checklist again before releasing.

---

# PART 14: Troubleshooting

| Problem | Cause | Fix |
|---|---|---|
| `npm install` fails with **ERESOLVE** | `.npmrc` missing | Make sure `.npmrc` contains `legacy-peer-deps=true` |
| `npx expo export` on your PC fails: **"spawn UNKNOWN"** / *"An Application Control policy has blocked this file"* | Windows **Smart App Control** blocks the new unsigned `hermesc.exe` | Doesn't affect you: EAS builds run on Linux in the cloud. For a local check use `npx expo export -p android --no-bytecode`. Leave Smart App Control on. On some Windows versions, once you turn it off it can't be turned back on without reinstalling Windows. |
| App **crashes immediately** on launch (production build) | Wrong `androidAppId` in `app.json` (an ad *unit* ID with `/` instead of the App ID with `~`) | Use the App ID with `~`, then rebuild |
| **No ads** show | New ad units take up to **1 hour (sometimes 24 h)** to serve; app not yet reviewed in AdMob; consent declined; no ad "fill" | Wait, check AdMob → Apps for warnings, and test on a registered test device (2.7). The app hides empty banners on purpose. |
| Ads show "Test Ad" in the Play version | IDs in `constants/config.ts` still contain `xxxx` | Put in the real IDs (2.6) and rebuild |
| Reminder notification never arrives | Notifications blocked, or battery saver | Phone Settings → Apps → Rest Easy → Notifications → On. Battery → Rest Easy → *Unrestricted*. |
| Expo Go shows `'RNGoogleMobileAdsModule' could not be found` | You're on an old copy of `lib/ads.ts` | The current code skips ads in Expo Go automatically. Pull the latest code, or use a dev build (5.4) |
| Play: "**Version code 1 has already been used**" | Uploaded an old bundle again | Run `npm run build:aab` again; EAS auto-increments the code |
| Play: "**Your Android App Bundle is signed with the wrong key**" | The keystore changed (e.g. you deleted the EAS credentials) | Restore it from your backup (5.1), or Play Console → App integrity → *Request upload key reset* |
| Play: "**Package name already exists**" | Someone else owns `com.suryanshu.resteasy` (unlikely) | Change `android.package` in `app.json` and `ANDROID_PACKAGE` in `constants/config.ts`, e.g. `com.suryanshu.resteasy.app` |
| Play rejects for **"Missing privacy policy"** or **"Data safety mismatch"** | URL not reachable, or form answers don't match the SDKs | Check 3.4; redo 8.2 g) and compare with Google's AdMob page |
| `eas build` says "**projectId mismatch**" or permission denied | `app.json` linked to another account's project | Delete `extra.eas.projectId` from `app.json` and run `eas init` again |
| PowerShell: "running scripts is disabled" | Execution policy | `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` |

---

## Final pre-release checklist
- [ ] Real AdMob **App ID** (`~`) in `app.json`
- [ ] Real **banner and interstitial** unit IDs (`/`) in `constants/config.ts`
- [ ] AdMob **GDPR message published**
- [ ] `app-ads.txt` with your real `pub-` ID is live on GitHub Pages
- [ ] Privacy policy URL opens
- [ ] `"version"` bumped in `app.json` (for updates)
- [ ] Preview APK tested on a real phone (Part 5 checklist)
- [ ] Store listing, icon, feature graphic, and screenshots uploaded
- [ ] All Dashboard "Set up your app" tasks show ✅
