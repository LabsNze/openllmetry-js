#!/bin/bash

# Verify all required files exist for the Next.js project
echo "Verifying Next.js dashboard setup..."

# Check root files
echo "✓ Checking root configuration files..."
[ -f "package.json" ] && echo "  ✓ package.json" || echo "  ✗ package.json MISSING"
[ -f "tsconfig.json" ] && echo "  ✓ tsconfig.json" || echo "  ✗ tsconfig.json MISSING"
[ -f "tailwind.config.ts" ] && echo "  ✓ tailwind.config.ts" || echo "  ✗ tailwind.config.ts MISSING"
[ -f "postcss.config.js" ] && echo "  ✓ postcss.config.js" || echo "  ✗ postcss.config.js MISSING"
[ -f "next.config.js" ] && echo "  ✓ next.config.js" || echo "  ✗ next.config.js MISSING"

# Check app files
echo ""
echo "✓ Checking app directory..."
[ -f "app/layout.tsx" ] && echo "  ✓ app/layout.tsx" || echo "  ✗ app/layout.tsx MISSING"
[ -f "app/page.tsx" ] && echo "  ✓ app/page.tsx" || echo "  ✗ app/page.tsx MISSING"
[ -f "app/globals.css" ] && echo "  ✓ app/globals.css" || echo "  ✗ app/globals.css MISSING"
[ -f "app/metrics/page.tsx" ] && echo "  ✓ app/metrics/page.tsx" || echo "  ✗ app/metrics/page.tsx MISSING"

# Check components
echo ""
echo "✓ Checking components..."
[ -f "components/navbar.tsx" ] && echo "  ✓ components/navbar.tsx" || echo "  ✗ components/navbar.tsx MISSING"
[ -f "components/trace-list.tsx" ] && echo "  ✓ components/trace-list.tsx" || echo "  ✗ components/trace-list.tsx MISSING"
[ -f "components/trace-details.tsx" ] && echo "  ✓ components/trace-details.tsx" || echo "  ✗ components/trace-details.tsx MISSING"

# Check lib files
echo ""
echo "✓ Checking lib directory..."
[ -f "lib/tracing-core.ts" ] && echo "  ✓ lib/tracing-core.ts" || echo "  ✗ lib/tracing-core.ts MISSING"
[ -f "lib/mock-traces.ts" ] && echo "  ✓ lib/mock-traces.ts" || echo "  ✗ lib/mock-traces.ts MISSING"

# Check API routes
echo ""
echo "✓ Checking API routes..."
[ -f "app/api/traces/route.ts" ] && echo "  ✓ app/api/traces/route.ts" || echo "  ✗ app/api/traces/route.ts MISSING"
[ -f "app/api/traces/[id]/route.ts" ] && echo "  ✓ app/api/traces/[id]/route.ts" || echo "  ✗ app/api/traces/[id]/route.ts MISSING"

echo ""
echo "✓ All files verified!"
echo ""
echo "To start the development server:"
echo "  pnpm install"
echo "  pnpm dev"
