"""Preloaded Showcase Conversations for Instant Testing and Demos

Five diverse conversations covering code, math/physics, creative writing,
database design, and everyday lifestyle — each designed to stress-test
different PDF rendering features (code blocks, LaTeX, tables, lists, prose).
"""

from typing import Any, Dict, List

SAMPLE_CHATS: List[Dict[str, Any]] = [
    # ───────────────── 1. WEB DEVELOPMENT (Code + Tables) ─────────────────
    {
        "share_id": "sample-express-api",
        "title": "Build a REST API with Express.js & TypeScript",
        "model": "gpt-4o",
        "updated_at": 1727100000.0,
        "category": "Web Development",
        "messages": [
            {
                "id": "m1",
                "role": "user",
                "author": "User",
                "created_at": 1727100000.0,
                "content": "I want to build a production-ready REST API with Express.js and TypeScript for a task management app. It needs JWT auth, input validation, and proper error handling. Show me the project structure and the core files.",
                "thought": None,
                "assets": []
            },
            {
                "id": "m2",
                "role": "assistant",
                "author": "ChatGPT",
                "created_at": 1727100020.0,
                "content": """Here's a production-grade Express + TypeScript REST API setup for your task management app.

### Project Structure

```
task-api/
├── src/
│   ├── config/
│   │   └── env.ts
│   ├── middleware/
│   │   ├── auth.ts
│   │   ├── validate.ts
│   │   └── errorHandler.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   └── tasks.routes.ts
│   ├── models/
│   │   └── task.model.ts
│   ├── services/
│   │   └── task.service.ts
│   └── app.ts
├── tsconfig.json
└── package.json
```

### Core Authentication Middleware

```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

interface JwtPayload {
  userId: string;
  email: string;
  role: 'admin' | 'user';
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required',
    });
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired token',
    });
  }
};
```

### Task Routes with Validation

```typescript
import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import * as taskService from '../services/task.service';

const router = Router();

const createTaskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  dueDate: z.string().datetime().optional(),
});

router.post(
  '/',
  authenticate,
  validate(createTaskSchema),
  async (req, res) => {
    const task = await taskService.create(req.user.userId, req.body);
    res.status(201).json({ success: true, data: task });
  }
);

router.get('/', authenticate, async (req, res) => {
  const tasks = await taskService.findAll(req.user.userId);
  res.json({ success: true, data: tasks });
});

export default router;
```

### HTTP Status Codes Reference

| Status | Meaning | When to Use |
| :--- | :--- | :--- |
| `200` | OK | Successful GET, PUT, PATCH |
| `201` | Created | Successful POST creating a resource |
| `204` | No Content | Successful DELETE |
| `400` | Bad Request | Validation errors, malformed input |
| `401` | Unauthorized | Missing or invalid JWT token |
| `403` | Forbidden | Valid token but insufficient permissions |
| `404` | Not Found | Resource doesn't exist |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Internal Server Error | Unhandled exceptions |

> **Pro tip**: Always wrap async route handlers in a try-catch or use `express-async-errors` to prevent unhandled promise rejections from crashing your server.
""",
                "thought": "Designed a clean layered architecture (routes → services → models) with TypeScript for type safety. Included Zod validation for runtime input checking and JWT middleware for stateless auth.",
                "assets": []
            },
            {
                "id": "m3",
                "role": "user",
                "author": "User",
                "created_at": 1727100100.0,
                "content": "Now show me the global error handler middleware and how to set up rate limiting.",
                "thought": None,
                "assets": []
            },
            {
                "id": "m4",
                "role": "assistant",
                "author": "ChatGPT",
                "created_at": 1727100130.0,
                "content": """### Global Error Handler

```typescript
import { Request, Response, NextFunction } from 'express';

class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = 'statusCode' in err ? err.statusCode : 500;
  const message = err.message || 'Internal Server Error';

  // Log full error in development, sanitized in production
  if (process.env.NODE_ENV !== 'production') {
    console.error('\\n🔴 Error:', err);
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};
```

### Rate Limiting with `express-rate-limit`

```typescript
import rateLimit from 'express-rate-limit';

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15-minute window
  max: 100,                     // 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests. Please try again later.',
  },
});

// Stricter limiter for auth endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    error: 'Too many login attempts. Please wait 15 minutes.',
  },
});
```

Apply them in your `app.ts`:

```typescript
import express from 'express';
import { apiLimiter, authLimiter } from './middleware/rateLimit';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth.routes';
import taskRoutes from './routes/tasks.routes';

const app = express();

app.use(express.json({ limit: '10kb' }));
app.use('/api', apiLimiter);
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/tasks', taskRoutes);
app.use(errorHandler);

export default app;
```
""",
                "thought": None,
                "assets": []
            }
        ]
    },
    # ───────────────── 2. PHYSICS & MATH (LaTeX) ─────────────────
    {
        "share_id": "sample-quantum-entanglement",
        "title": "Quantum Entanglement & Bell's Theorem Explained",
        "model": "o1-preview",
        "updated_at": 1727150000.0,
        "category": "Physics & Mathematics",
        "messages": [
            {
                "id": "m1",
                "role": "user",
                "author": "User",
                "created_at": 1727150000.0,
                "content": "Explain quantum entanglement mathematically. Include the Bell state, the density matrix for a maximally entangled pair, and show how Bell's inequality is violated. Use proper LaTeX notation.",
                "thought": None,
                "assets": []
            },
            {
                "id": "m2",
                "role": "assistant",
                "author": "ChatGPT",
                "created_at": 1727150045.0,
                "content": """## Quantum Entanglement: Mathematical Framework

### 1. Bell States

The four **Bell states** (maximally entangled two-qubit states) are:

$$|\\Phi^+\\rangle = \\frac{1}{\\sqrt{2}}(|00\\rangle + |11\\rangle)$$

$$|\\Phi^-\\rangle = \\frac{1}{\\sqrt{2}}(|00\\rangle - |11\\rangle)$$

$$|\\Psi^+\\rangle = \\frac{1}{\\sqrt{2}}(|01\\rangle + |10\\rangle)$$

$$|\\Psi^-\\rangle = \\frac{1}{\\sqrt{2}}(|01\\rangle - |10\\rangle)$$

These states cannot be factored into a tensor product of individual qubit states — that's the essence of entanglement.

---

### 2. Density Matrix

For the singlet state $|\\Psi^-\\rangle$, the density matrix is:

$$\\rho = |\\Psi^-\\rangle\\langle\\Psi^-| = \\frac{1}{2}\\begin{pmatrix} 0 & 0 & 0 & 0 \\\\ 0 & 1 & -1 & 0 \\\\ 0 & -1 & 1 & 0 \\\\ 0 & 0 & 0 & 0 \\end{pmatrix}$$

The reduced density matrix for subsystem A (tracing out B):

$$\\rho_A = \\text{Tr}_B(\\rho) = \\frac{1}{2}\\begin{pmatrix} 1 & 0 \\\\ 0 & 1 \\end{pmatrix} = \\frac{I}{2}$$

This maximally mixed state indicates that locally, each qubit appears completely random — all correlations are non-local.

---

### 3. Bell's Inequality (CHSH Form)

For measurement settings $\\vec{a}, \\vec{a}'$ (Alice) and $\\vec{b}, \\vec{b}'$ (Bob), define:

$$S = E(\\vec{a}, \\vec{b}) - E(\\vec{a}, \\vec{b}') + E(\\vec{a}', \\vec{b}) + E(\\vec{a}', \\vec{b}')$$

**Classical bound** (local hidden variable theories):

$$|S| \\leq 2$$

**Quantum mechanics prediction** using optimal measurement angles ($\\pi/8$ apart):

$$S_{QM} = 2\\sqrt{2} \\approx 2.828$$

This violates the classical bound by a factor of $\\sqrt{2}$, known as **Tsirelson's bound**. The quantum correlation function is:

$$E(\\vec{a}, \\vec{b}) = -\\vec{a} \\cdot \\vec{b} = -\\cos\\theta_{ab}$$

> **Key insight**: The violation of Bell's inequality proves that quantum mechanics cannot be explained by any local hidden variable theory — nature is fundamentally non-local.
""",
                "thought": "Structured the explanation from basic Bell states through density matrices to Bell's inequality violation. Used proper bra-ket notation and matrix representations to give a rigorous mathematical treatment while keeping the narrative accessible.",
                "assets": []
            }
        ]
    },
    # ───────────────── 3. CREATIVE WRITING (Long prose) ─────────────────
    {
        "share_id": "sample-creative-writing",
        "title": "Short Story: The Last Lighthouse Keeper",
        "model": "gpt-4o",
        "updated_at": 1727200000.0,
        "category": "Creative Writing",
        "messages": [
            {
                "id": "m1",
                "role": "user",
                "author": "User",
                "created_at": 1727200000.0,
                "content": "Write a short literary fiction piece (about 600 words) called 'The Last Lighthouse Keeper'. Set it on a remote coast in autumn. The tone should be melancholic but hopeful. Include vivid sensory details.",
                "thought": None,
                "assets": []
            },
            {
                "id": "m2",
                "role": "assistant",
                "author": "ChatGPT",
                "created_at": 1727200040.0,
                "content": """## The Last Lighthouse Keeper

The fog rolled in like a held breath finally released, swallowing the coastline in soft gray wool. Elara Voss stood at the gallery rail of the Thornwick Light, 147 feet above the rocks, and watched the world dissolve below her. The October wind carried the mineral smell of churned seawater and something else — the faint, sweet decay of leaves from the birch grove behind the keeper's cottage. Autumn was eating the landscape alive.

She had been the keeper for thirty-one years. She would be the last.

The decommission letter sat on her kitchen table, pinned under a coffee mug that read *World's Okayest Lighthouse Keeper* — a gift from her daughter, who lived in Portland now and called on Sundays, sometimes. The Maritime Authority's language was polite, bureaucratic, bloodless: *"Due to the complete transition to GPS-guided autonomous navigation systems, the Thornwick Lighthouse will cease manned operations effective November 30th."*

Thirty-one years reduced to a paragraph.

---

She remembered her first night in the tower. Twenty-three years old, rain hammering the windows like small fists, the Fresnel lens throwing its beam across the churning Atlantic in slow, patient revolutions. Every eight seconds, a pulse of white light. She had counted them obsessively that first week, unable to sleep, convinced that if she dozed off the light would fail and some vessel would crack open on the shoals below.

It never failed. Not once in thirty-one years.

The ships had. The *Mary Calloway*, a fishing trawler that went down in the nor'easter of '04 despite the light, despite everything. She'd watched the Coast Guard helicopters circle the water for three days. They found the hull wedged between two granite ridges like a broken tooth. No survivors. She didn't sleep for a week after that, either, but for different reasons.

---

Now the fog thickened, and Elara descended the spiral staircase, her hand trailing the cold iron rail worn smooth by generations of keepers before her. The tower smelled of machine oil and damp stone and, faintly, of the lavender she kept in a jar on the second landing because the stairwell felt too severe without something living in it.

In the kitchen, she made tea. Earl Grey, strong, no sugar. Through the window, the birch trees moved like dancers uncertain of the choreography, their remaining leaves — gold and rust and the pale yellow of old paper — shaking loose in handfuls.

Her phone buzzed. A text from her daughter: *"Mom, have you thought about Portland? Guest room's ready whenever."*

Elara set the phone down. She looked at the decommission letter, then at the window, then at the fog.

She thought about what it meant to be needed by the sea. To stand between water and stone and hold a light steady. To know that your purpose was older than electricity, older than GPS, older than anything with a battery or a satellite link. The sea didn't care about automation. The sea just wanted to know someone was watching.

She picked up the phone.

*"I'll think about it. Come visit before November? The birches are beautiful this year."*

She pressed send, then climbed back up the tower. The lens was already turning, its beam cutting through the fog in slow, faithful arcs. Eight seconds of light. Eight seconds of dark. Eight seconds of light.

Elara Voss stood at the gallery rail, the wind pulling at her coat, and watched the beam reach out across the water toward something she couldn't see but trusted was there.

The fog would lift. It always did.
""",
                "thought": "Crafted a literary fiction piece with strong sensory imagery (fog, birch leaves, mineral seawater), a melancholic-but-hopeful arc, and a central metaphor of the lighthouse as purpose. Used section breaks and specific details (the Fresnel lens, eight-second intervals, the Mary Calloway) to ground the story in realism.",
                "assets": []
            }
        ]
    },
    # ───────────────── 4. DATABASE DESIGN (SQL + Tables) ─────────────────
    {
        "share_id": "sample-database-schema",
        "title": "PostgreSQL Schema Design for E-Commerce Platform",
        "model": "gpt-4o",
        "updated_at": 1727250000.0,
        "category": "Database Engineering",
        "messages": [
            {
                "id": "m1",
                "role": "user",
                "author": "User",
                "created_at": 1727250000.0,
                "content": "Design a PostgreSQL schema for a modern e-commerce platform. It needs to support: products with variants (size, color), a shopping cart, orders with line items, and user addresses. Include proper indexes and constraints.",
                "thought": None,
                "assets": []
            },
            {
                "id": "m2",
                "role": "assistant",
                "author": "ChatGPT",
                "created_at": 1727250035.0,
                "content": """## E-Commerce Database Schema (PostgreSQL)

### Entity Overview

| Entity | Purpose | Key Relations |
| :--- | :--- | :--- |
| `users` | Customer accounts | Has many addresses, orders, carts |
| `products` | Base product catalog | Has many variants |
| `product_variants` | Size/color/SKU combinations | Belongs to product |
| `cart_items` | Active shopping cart | References user + variant |
| `orders` | Completed purchases | Has many line items |
| `order_items` | Individual items in an order | References order + variant |
| `addresses` | Shipping/billing addresses | Belongs to user |

---

### Schema DDL

```sql
-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ━━━━━━━━━━━━━━━━━━━━━ Users ━━━━━━━━━━━━━━━━━━━━━
CREATE TABLE users (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email       VARCHAR(255) NOT NULL UNIQUE,
    name        VARCHAR(200) NOT NULL,
    password    VARCHAR(255) NOT NULL,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);

-- ━━━━━━━━━━━━━━━━━━━━━ Products ━━━━━━━━━━━━━━━━━━━
CREATE TABLE products (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        VARCHAR(300) NOT NULL,
    slug        VARCHAR(300) NOT NULL UNIQUE,
    description TEXT,
    base_price  NUMERIC(10, 2) NOT NULL CHECK (base_price >= 0),
    category    VARCHAR(100),
    is_active   BOOLEAN NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_category ON products(category);

-- ━━━━━━━━━━━━━━━━━━━━━ Variants ━━━━━━━━━━━━━━━━━━━
CREATE TABLE product_variants (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    sku         VARCHAR(50) NOT NULL UNIQUE,
    size        VARCHAR(20),
    color       VARCHAR(50),
    price_delta NUMERIC(10, 2) NOT NULL DEFAULT 0,
    stock       INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    UNIQUE (product_id, size, color)
);

CREATE INDEX idx_variants_product ON product_variants(product_id);
CREATE INDEX idx_variants_sku ON product_variants(sku);

-- ━━━━━━━━━━━━━━━━━━━━━ Addresses ━━━━━━━━━━━━━━━━━━
CREATE TABLE addresses (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    label       VARCHAR(50) DEFAULT 'Home',
    line1       VARCHAR(300) NOT NULL,
    line2       VARCHAR(300),
    city        VARCHAR(100) NOT NULL,
    state       VARCHAR(100),
    postal_code VARCHAR(20) NOT NULL,
    country     CHAR(2) NOT NULL DEFAULT 'US',
    is_default  BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX idx_addresses_user ON addresses(user_id);

-- ━━━━━━━━━━━━━━━━━━━━━ Orders ━━━━━━━━━━━━━━━━━━━━━
CREATE TABLE orders (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id),
    status          VARCHAR(30) NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','confirmed','shipped','delivered','cancelled')),
    shipping_id     UUID REFERENCES addresses(id),
    subtotal        NUMERIC(12, 2) NOT NULL,
    tax             NUMERIC(12, 2) NOT NULL DEFAULT 0,
    total           NUMERIC(12, 2) NOT NULL,
    placed_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);

-- ━━━━━━━━━━━━━━━━━━━━━ Order Items ━━━━━━━━━━━━━━━━
CREATE TABLE order_items (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    variant_id  UUID NOT NULL REFERENCES product_variants(id),
    quantity    INTEGER NOT NULL CHECK (quantity > 0),
    unit_price  NUMERIC(10, 2) NOT NULL
);

CREATE INDEX idx_order_items_order ON order_items(order_id);

-- ━━━━━━━━━━━━━━━━━━━━━ Cart ━━━━━━━━━━━━━━━━━━━━━━━
CREATE TABLE cart_items (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    variant_id  UUID NOT NULL REFERENCES product_variants(id),
    quantity    INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    added_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, variant_id)
);

CREATE INDEX idx_cart_user ON cart_items(user_id);
```

### Key Design Decisions

1. **UUIDs over serial IDs** — prevents enumeration attacks and simplifies distributed systems
2. **`product_variants` as a separate table** — allows a single product to have many SKU combinations without denormalization
3. **`price_delta` on variants** — the final price is `base_price + price_delta`, keeping the base product price as the source of truth
4. **`CHECK` constraints** — database-level enforcement that stock ≥ 0, quantity > 0, and status is a known enum
5. **`ON DELETE CASCADE`** — when a user is deleted, their addresses and cart items are automatically cleaned up
6. **Composite unique constraint** on `(product_id, size, color)` — prevents duplicate variant combinations

> **Next steps**: Add a `payments` table with Stripe integration, a `reviews` table with rating constraints, and consider partitioning the `orders` table by `placed_at` for time-series queries at scale.
""",
                "thought": None,
                "assets": []
            }
        ]
    },
    # ───────────────── 5. LIFESTYLE (Lists + Simple Formatting) ─────────────
    {
        "share_id": "sample-meal-prep",
        "title": "Weekly Meal Prep Plan — High Protein Budget-Friendly",
        "model": "gpt-4o",
        "updated_at": 1727300000.0,
        "category": "Health & Lifestyle",
        "messages": [
            {
                "id": "m1",
                "role": "user",
                "author": "User",
                "created_at": 1727300000.0,
                "content": "Create a weekly meal prep plan for someone who lifts weights 4x/week, needs about 2,500 calories and 180g protein daily, and has a $75/week grocery budget. I batch cook on Sundays.",
                "thought": None,
                "assets": []
            },
            {
                "id": "m2",
                "role": "assistant",
                "author": "ChatGPT",
                "created_at": 1727300025.0,
                "content": """## Weekly Meal Prep Plan — 2,500 cal / 180g protein

### Daily Macro Targets

| Macro | Target | Per Meal (4 meals) |
| :--- | :--- | :--- |
| **Calories** | 2,500 kcal | ~625 kcal |
| **Protein** | 180g | ~45g |
| **Carbs** | 280g | ~70g |
| **Fat** | 75g | ~19g |

---

### Sunday Batch Cook Gameplan

Prep these 5 components — they mix-and-match all week:

#### 1. Protein Base: Chicken Thighs (5 lbs)
- Season with garlic powder, paprika, salt, black pepper, and a drizzle of olive oil
- Bake at 400°F for 35 minutes on sheet pans
- Portion into 10 containers (~6oz each = 42g protein)

#### 2. Grain Base: Jasmine Rice (4 cups dry)
- Rice cooker or Instant Pot, 1:1.25 water ratio
- Makes ~10 cups cooked → portion into containers

#### 3. Vegetable Rotation
- **Mon/Wed/Fri**: Roasted broccoli + bell peppers (toss with olive oil, roast at 425°F 20 min)
- **Tue/Thu**: Steamed green beans + shredded carrots
- **Sat/Sun**: Fresh spinach salad with cherry tomatoes

#### 4. Breakfast Prep: Overnight Oats (5 jars)
- Per jar: ½ cup oats, 1 scoop whey protein, 1 tbsp peanut butter, ¾ cup milk, chia seeds
- Shake, refrigerate — grab-and-go mornings

#### 5. Snack Prep
- Hard-boil 14 eggs (2/day)
- Pre-portion trail mix bags: almonds + dried cranberries + dark chocolate chips

---

### Daily Eating Schedule

| Time | Meal | What | Protein |
| :--- | :--- | :--- | :--- |
| 7:00 AM | **Breakfast** | Overnight oats + 2 hard-boiled eggs | 45g |
| 12:00 PM | **Lunch** | Chicken + rice + roasted veggies | 47g |
| 4:00 PM | **Snack** | Trail mix + Greek yogurt (200g) | 28g |
| 7:30 PM | **Dinner** | Chicken + rice + veggies + olive oil drizzle | 47g |
| 9:30 PM | **Before bed** | Casein shake or cottage cheese (1 cup) | 25g |
|  | **Daily Total** | | **~192g** |

---

### Grocery List (~$72)

| Item | Amount | Est. Cost |
| :--- | :--- | :--- |
| Chicken thighs (bone-in) | 5 lbs | $12.50 |
| Jasmine rice | 5 lb bag | $4.50 |
| Whey protein (per week share) | ~7 scoops | $8.00 |
| Eggs (18-count) | 1 carton | $3.50 |
| Old-fashioned oats | 42 oz | $3.00 |
| Peanut butter | 16 oz jar | $2.50 |
| Whole milk | 1 gallon | $3.50 |
| Greek yogurt | 32 oz tub | $5.00 |
| Broccoli crowns | 2 lbs | $3.50 |
| Bell peppers | 4 count | $4.00 |
| Green beans | 1 lb | $2.00 |
| Carrots | 2 lb bag | $1.50 |
| Spinach | 10 oz bag | $3.00 |
| Cherry tomatoes | 1 pint | $3.00 |
| Almonds | 8 oz | $4.50 |
| Dried cranberries | 6 oz | $2.50 |
| Dark chocolate chips | 6 oz | $2.50 |
| Chia seeds | 4 oz | $2.50 |
| Olive oil + seasonings | pantry | $1.00 |
| | **Total** | **~$72** |

> **Tip**: Buy chicken thighs bone-in/skin-on — they're 40% cheaper than boneless and more flavorful. Debone after cooking (it's easy when they're warm) or eat on the bone.
""",
                "thought": None,
                "assets": []
            },
            {
                "id": "m3",
                "role": "user",
                "author": "User",
                "created_at": 1727300120.0,
                "content": "What if I get bored of chicken? Give me two swap options that hit similar macros and stay within budget.",
                "thought": None,
                "assets": []
            },
            {
                "id": "m4",
                "role": "assistant",
                "author": "ChatGPT",
                "created_at": 1727300150.0,
                "content": """### Budget Protein Swaps

| Swap | Protein/6oz | Cost/lb | Prep Method | Flavor Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Ground turkey (93/7)** | 38g | ~$3.50 | Brown with taco seasoning, portion into rice bowls | Versatile, absorbs any seasoning |
| **Canned tuna (albacore)** | 40g per can | ~$2.00/can | Drain, mix with Greek yogurt + mustard + diced celery | Zero-cook option, great on rice cakes |

Both keep you within the $75 budget. I'd suggest rotating: **3 days chicken, 2 days turkey, 2 days tuna** to prevent palate fatigue without adding meal prep complexity.

For the turkey: brown 2.5 lbs on Sunday alongside the chicken. Season one batch with taco spices (cumin, chili, garlic) and the other with Italian herbs (oregano, basil, crushed red pepper). Two completely different flavor profiles from the same protein.
""",
                "thought": None,
                "assets": []
            }
        ]
    }
]
