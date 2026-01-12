🚀 React Native Posts App — Assessment Project

A simple React Native app built using Expo, featuring:

Fetching posts from an API

Search with instant filtering

Search persistence using AsyncStorage

Offline detection using NetInfo

Toast notifications

Pull-to-refresh

Error handling (offline, network, server errors)

This project fulfills all requirements of the React Native Intern Combined Assessment.

📸 Features Overview
✔ 1. Fetch Posts

Fetches posts from:
https://jsonplaceholder.typicode.com/posts

Displays a clean list with title + body.

✔ 2. Search

Real-time search with debouncing (300ms).

Case-insensitive filtering.

Empty search shows all posts.

✔ 3. Save Search (AsyncStorage)

Typed search is saved automatically.

When the app restarts:

Search box auto-fills

Filter is applied instantly

✔ 4. Error Handling

Handles all error cases:

Condition	App Behavior
No Internet	Offline screen + Retry button + Toast
Server Error (4xx/5xx)	Error screen + Retry
Network Error	Error screen + Retry
No results	“No posts found.”
✔ 5. Pull To Refresh

Built-in pull-to-refresh support.

Works correctly even in offline mode.

🛠️ Tech Stack

React Native (Expo)

NativeWind (Tailwind CSS for RN)

AsyncStorage

NetInfo

React Native Toast Message

📦 Installation & Setup

1️⃣ Clone the project

git clone <repo-url>
cd <folder>


2️⃣ Install dependencies

npm install


3️⃣ Start the project

npx expo start

4️⃣ Run on device

Scan the QR code using Expo Go

Or press a to open Android emulator

Or press w to open Web version

🧪 Testing Guide
✔ Fetch & UI

App loads posts

Cards display title + body

✔ Search

Type text → list filters instantly

Case-insensitive

No results → shows empty message

✔ Search Persistence

Type search

Close Expo Go

Reopen → search auto-filled

✔ Offline Mode

Turn OFF Wi-Fi + Data

App shows offline screen

Retry works when online again

✔ Pull-to-refresh

Pull down → posts reload

Works even offline

✔ Error Handling

Server error → shows server error UI

Network error → shows network error UI

All errors show Toast + Retry

📁 Folder Structure

/app
  └── index.tsx
  └── PostsScreen.tsx
/components
  └── (optional future components)
/assets
tailwind.config.js
package.json
README.md

👨‍💻 Author

Neeraj P C
React Native Developer Intern (Assessment Project)