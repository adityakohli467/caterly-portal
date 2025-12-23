# Caterly Storefront

Customer-facing e-commerce website for Caterly catering & food ordering platform built with Next.js 14.

## 🚀 Features

- **Product Catalog**: Browse products by category
- **Shopping Cart**: Add/remove items, adjust quantities
- **Checkout**: Complete orders with delivery details
- **User Authentication**: Customer login and registration
- **Order History**: View past orders and reorder
- **Responsive Design**: Mobile-first design
- **Modern UI**: Beautiful Tailwind CSS styling
- **Type-Safe**: Full TypeScript support

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- Running backend API

## 🛠️ Installation

```bash
npm install
cp .env.local.example .env.local
# Update NEXT_PUBLIC_API_URL in .env.local
```

## 🏃 Running

```bash
npm run dev  # Development on http://localhost:3000
npm run build && npm start  # Production
```

## 📁 Structure

```
storefront/
├── src/
│   ├── app/             # Pages & routing
│   ├── components/      # React components
│   ├── lib/             # Utilities & API client
│   └── store/           # State management
└── public/              # Static assets
```

## 🔧 Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:9000
NEXT_PUBLIC_APP_NAME=Caterly
```

## 🚀 Deployment

Deploy to Vercel:
```bash
vercel
```

## 📄 License

Proprietary - Caterly Platform

