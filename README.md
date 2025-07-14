# Wallet Authentication Template

A simplified template for **wallet-based authentication** using Convex Auth with standard SIWE (Sign-In With Ethereum).

## 🚀 Quick Start

```bash
# Install dependencies
bun install

# Run setup script
bun run setup

# Generate JWT keys for ConvexAuth
bun run generatekeys
# Copy the output and paste it into your Convex dashboard Environment Variables

# Configure .env.local with your values
# Then start development
bun dev
```

## 🔧 Tech Stack

- **Backend**: [Convex](https://convex.dev/) + [Convex Auth](https://labs.convex.dev/auth)
- **Frontend**: React + Vite + Tailwind CSS
- **Wallet**: [Tanto Widget](https://docs.skymavis.com/ronin/wallet/tutorials/tanto-widget) or [Reown AppKit](https://docs.reown.com/appkit)
- **Authentication**: Standard SIWE (EIP-4361)

## ✅ Features

- **Standard SIWE Authentication** - EIP-4361 compliant
- **Role-Based Access Control** - Extensible USER/ADMIN system
- **Built-in Security** - SIWE library handles all validation
- **Template-Friendly** - Clean, minimal codebase

## 🔐 How It Works

1. **Connect Wallet** → **Generate SIWE Message** → **Sign Message** → **Verify & Create Session**

Security handled by SIWE library: nonce generation, timestamp validation, signature verification, replay protection.

## 📁 Key Files

```
convex/
├── auth.ts              # ConvexAuth + SIWE provider
├── siweAuth.ts          # SIWE message generation & verification
├── lib/
│   ├── permissions.ts   # Role-based access control
│   └── admin.ts         # User management utilities
└── schema.ts            # Database schema

src/
├── components/          # Wallet connection UI
└── App.tsx             # Main auth flow
```

## 🛠️ Commands

```bash
bun dev          # Start development
bun build        # Build for production
bun lint         # Run linting
```

## 🔗 Resources

- [Convex Docs](https://docs.convex.dev/) - Complete documentation
- [SIWE Specification](https://eips.ethereum.org/EIPS/eip-4361) - EIP-4361 standard
- [Tanto Widget](https://docs.skymavis.com/ronin/wallet/tutorials/tanto-widget) - Tanto Widget SDK
- [Convex Discord](https://convex.dev/community) - Get help
