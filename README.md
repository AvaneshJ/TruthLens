Say less 😄 — **one block, clean, final boss README**. Copy → paste → push → enjoy the “who wrote this?” respect.

````markdown
# TruthLens

**AI-powered news verification platform** that combats misinformation by auditing claims and media against trusted sources, detecting bias, and revealing the underlying truth.

---

## 📸 Preview

![TruthLens UI](./public/photo.jpeg)

---

## About

TruthLens leverages AI to verify news claims and media content with contextual intelligence. It cross-references information against a curated "Golden List" of trusted sources, analyzes sentiment bias, and presents balanced perspectives to help users make informed decisions.

Rather than simple fact-checking, TruthLens provides **structured truth analysis with source-backed reasoning**.

---

### How It Works

1. **Enter a Claim** - Type a news claim or paste a screenshot  
2. **AI Verification** - The system analyzes your input against trusted sources  
3. **Get Results** - View verdict, certainty score, bias analysis, and supporting sources  
4. **Save History** - Logged-in users can store and revisit past verifications  

---

## Features

### Core Features

- **News Verification** - Cross-check claims with reliable sources  
- **Media Verification** - Analyze images and screenshots for manipulation  
- **Bias Detection** - Identify sentiment and narrative bias  
- **Source Analysis** - Evaluate credibility and reliability of sources  
- **Alternative Perspectives** - Compare consensus vs differing viewpoints  

---

### User Features

- **User Authentication** - Secure signup, login, and session handling  
- **Search History**
  - Logged-in users: Stored permanently in database  
  - Guest users: Stored temporarily in localStorage  
- **Demo Mode** - Explore features without AI API integration  

---

### UI/UX

- **Dark/Light Mode** - Seamless theme switching  
- **Responsive Design** - Optimized for desktop, tablet, and mobile  
- **Smooth Animations** - Clean transitions and interactions  
- **Modern Interface** - Minimal and intuitive design  

---

## Tech Stack

| Layer    | Technology                         |
| -------- | ---------------------------------- |
| Frontend | Next.js 16, React 19, TypeScript   |
| Styling  | Tailwind CSS                       |
| Backend  | Next.js API Routes                 |
| Database | PostgreSQL with Prisma ORM         |
| Auth     | NextAuth.js (Credentials Provider) |
| Icons    | Lucide React                       |
| Charts   | Recharts                           |

---

## Getting Started

### Prerequisites

- Node.js 18+ installed  
- A PostgreSQL database (local or cloud)  

---

### 1. Clone the Repository

```bash
git clone <repository-url>
cd truthlens
````

---

### 2. Install Dependencies

```bash
npm install
```

---

### 3. Set Up Database

Create a free PostgreSQL database on [https://neon.tech](https://neon.tech):

1. Sign up with GitHub
2. Create a new project
3. Copy the connection string

Update your `.env` file:

```env
DATABASE_URL="postgresql://your-username:your-password@your-host/database?sslmode=require"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"
```

Generate a secret key:

```bash
openssl rand -base64 32
```

---

### 4. Initialize Database

```bash
npx prisma db push
npx prisma generate
```

---

### 5. Run the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
truthlens/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/route.ts
│   │   │   └── register/route.ts
│   │   └── history/route.ts
│   ├── components/
│   │   ├── Providers.tsx
│   │   ├── BiasMeter.tsx
│   │   ├── VerificationCharts.tsx
│   │   ├── TrendChart.tsx
│   │   ├── ExampleQueryCards.tsx
│   ├── dashboard/
│   │   └── page.tsx
│   ├── history/
│   │   └── page.tsx
│   ├── login/
│   │   └── page.tsx
│   ├── signup/
│   │   └── page.tsx
│   ├── page.tsx
│   ├── layout.tsx
│   └── globals.css
├── lib/
│   ├── prisma.ts
│   └── auth.ts
├── prisma/
│   └── schema.prisma
└── .env
```

---

## Pages

| Route        | Description                        |
| ------------ | ---------------------------------- |
| `/`          | Landing page with features and CTA |
| `/dashboard` | Main verification interface        |
| `/login`     | User login page                    |
| `/signup`    | User registration page             |
| `/history`   | View saved search history          |

---

## API Endpoints

### Authentication

| Endpoint                  | Method    | Description       |
| ------------------------- | --------- | ----------------- |
| `/api/auth/[...nextauth]` | GET, POST | NextAuth handlers |
| `/api/auth/register`      | POST      | Create new user   |

### History

| Endpoint       | Method | Description               |
| -------------- | ------ | ------------------------- |
| `/api/history` | GET    | Get user's search history |
| `/api/history` | POST   | Save search to history    |
| `/api/history` | DELETE | Delete a search           |

---

## Deploying to Vercel

### 1. Push to GitHub

```bash
git add .
git commit -m "update readme"
git push origin main
```

---

### 2. Import to Vercel

1. Go to [https://vercel.com](https://vercel.com)
2. Import your repository
3. Add environment variables:

   * DATABASE_URL
   * NEXTAUTH_SECRET
   * NEXTAUTH_URL

---

### 3. Deploy

Vercel will automatically build and deploy your app.

---

### 4. Initialize Database

After first deployment:

```bash
npx prisma db push
```

---

## Demo Mode

The dashboard includes **Demo Cards** for testing without AI API:

* Verified Claim
* Misleading Claim
* Fake News

Click any demo card to preview system output and UI behavior.

---

## Environment Variables

| Variable        | Description                  | Required |
| --------------- | ---------------------------- | -------- |
| DATABASE_URL    | PostgreSQL connection string | Yes      |
| NEXTAUTH_SECRET | Secret for NextAuth          | Yes      |
| NEXTAUTH_URL    | App URL (dev or production)  | Yes      |

---

## Contributing

Contributions are welcome. Feel free to open issues or submit pull requests.

---

## License

MIT



