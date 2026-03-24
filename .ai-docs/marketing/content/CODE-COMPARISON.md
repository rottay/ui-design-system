# Code Comparison: Rottay vs. Competitors

> See the difference. Feel the simplicity.

---

## Authentication

### Auth0 vs Rottay

#### Auth0 (45 lines)

```typescript
// auth0.config.ts
import { initAuth0 } from '@auth0/nextjs-auth0';

export const auth0 = initAuth0({
  domain: process.env.AUTH0_DOMAIN!,
  clientId: process.env.AUTH0_CLIENT_ID!,
  clientSecret: process.env.AUTH0_CLIENT_SECRET!,
  baseURL: process.env.AUTH0_BASE_URL!,
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}`,
  secret: process.env.AUTH0_SECRET!,
});

// middleware.ts
import { withMiddlewareAuthRequired } from '@auth0/nextjs-auth0/edge';

export default withMiddlewareAuthRequired();

export const config = { matcher: ['/dashboard/:path*'] };

// pages/api/auth/[...auth0].ts
import { handleAuth, handleLogin, handleCallback } from '@auth0/nextjs-auth0';

export default handleAuth({
  login: handleLogin({
    authorizationParams: { audience: process.env.AUTH0_AUDIENCE },
  }),
  callback: handleCallback({
    afterCallback: async (req, res, session) => {
      // Custom logic here
      return session;
    },
  }),
});

// components/login-button.tsx
import { useUser } from '@auth0/nextjs-auth0/client';

export function LoginButton() {
  const { user, error, isLoading } = useUser();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error.message}</div>;

  return user
    ? <a href="/api/auth/logout">Logout</a>
    : <a href="/api/auth/login">Login</a>;
}
```

#### Rottay (5 lines)

```typescript
import { makeLoginUseCase } from '@rottay/auth';

const login = makeLoginUseCase();
const result = await login.execute({ email, password }, { tenantId });
// result.isOk() ? result.value.session : result.error
```

| Metric | Auth0 | Rottay |
|--------|-------|--------|
| Lines of code | 45+ | 5 |
| Files needed | 4 | 1 |
| External dashboard | Required | None |
| Monthly cost | $23-240+ | Included |

**Lines saved: 89%**

---

### Clerk vs Rottay

#### Clerk (35 lines)

```typescript
// middleware.ts
import { authMiddleware } from '@clerk/nextjs';

export default authMiddleware({
  publicRoutes: ['/', '/sign-in', '/sign-up'],
  ignoredRoutes: ['/api/webhook'],
});

export const config = { matcher: ['/((?!.*\\..*|_next).*)', '/'] };

// app/layout.tsx
import { ClerkProvider } from '@clerk/nextjs';

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html><body>{children}</body></html>
    </ClerkProvider>
  );
}

// app/dashboard/page.tsx
import { auth, currentUser } from '@clerk/nextjs';

export default async function Dashboard() {
  const { userId } = auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const user = await currentUser();

  return <div>Welcome, {user?.firstName}</div>;
}

// components/user-button.tsx
import { UserButton, SignInButton, SignedIn, SignedOut } from '@clerk/nextjs';

export function Header() {
  return (
    <header>
      <SignedIn><UserButton /></SignedIn>
      <SignedOut><SignInButton /></SignedOut>
    </header>
  );
}
```

#### Rottay (5 lines)

```typescript
import { makeLoginUseCase, makeGetSessionUseCase } from '@rottay/auth';

const session = makeGetSessionUseCase();
const result = await session.execute({ token }, { tenantId });
// Authenticated. Multi-tenant. Done.
```

| Metric | Clerk | Rottay |
|--------|-------|--------|
| Lines of code | 35+ | 5 |
| Provider wrapper | Required | None |
| Vendor lock-in | High | None |
| Data ownership | Clerk's servers | Your database |

**Lines saved: 86%**

---

### Firebase Auth vs Rottay

#### Firebase Auth (50 lines)

```typescript
// firebase.config.ts
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  // ... more config
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// hooks/use-auth.ts
import { useState, useEffect } from 'react';
import { auth } from '@/firebase.config';
import { User, onAuthStateChanged } from 'firebase/auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return { user, loading };
}

// components/login-form.tsx
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/firebase.config';

async function handleLogin(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    // Handle success
  } catch (error) {
    // Handle error - Firebase errors are cryptic
    if (error.code === 'auth/user-not-found') { /* ... */ }
    if (error.code === 'auth/wrong-password') { /* ... */ }
    // ... many more error codes
  }
}

// SMS verification - additional cost!
import { signInWithPhoneNumber, RecaptchaVerifier } from 'firebase/auth';
// $0.06 per SMS. Adds up fast.
```

#### Rottay (6 lines)

```typescript
import { makeLoginUseCase, makeSendMFACodeUseCase } from '@rottay/auth';

const login = makeLoginUseCase();
const result = await login.execute({ email, password }, { tenantId });

const mfa = makeSendMFACodeUseCase();
await mfa.execute({ userId: result.value.userId, channel: 'sms' }, { tenantId });
```

| Metric | Firebase | Rottay |
|--------|----------|--------|
| Lines of code | 50+ | 6 |
| SMS cost | $0.06/SMS | Included |
| Error handling | Cryptic codes | Result type |
| Multi-tenancy | DIY | Built-in |

**Lines saved: 88% | SMS savings: 100%**

---

## Compliance

### Vanta vs Rottay

#### Vanta

```
Step 1: Sign up for Vanta
        Cost: $7,500 - $50,000/year

Step 2: Connect your integrations
        Time: 2-3 weeks of configuration

Step 3: Wait for automated scans
        Time: Ongoing monitoring

Step 4: Hire auditor for certification
        Cost: $10,000 - $50,000 additional

Step 5: Implement the actual controls yourself
        Time: 3-6 months of engineering work

Step 6: Maintain compliance documentation
        Time: Ongoing manual updates

Total: $17,500 - $100,000+ and 4-6 months
       Vanta monitors. You still build everything.
```

#### Rottay (12 lines)

```typescript
import {
  makeProcessDSARUseCase,
  makeGenerateAuditReportUseCase,
  makeEnforceRetentionPolicyUseCase
} from '@rottay/compliance';

// Handle data subject access request
const dsar = makeProcessDSARUseCase();
await dsar.execute({ userId, requestType: 'access' }, { tenantId });

// Generate audit report
const audit = makeGenerateAuditReportUseCase();
await audit.execute({ period: 'Q4-2024', framework: 'SOC2' }, { tenantId });

// Enforce data retention
const retention = makeEnforceRetentionPolicyUseCase();
await retention.execute({ policyId: 'gdpr-default' }, { tenantId });
```

| Metric | Vanta | Rottay |
|--------|-------|--------|
| Annual cost | $7,500 - $50,000 | Included |
| Implementation time | 4-6 months | Immediate |
| Controls included | Monitoring only | Built-in |
| DSAR automation | Manual process | One function call |

**Compliance is code, not a dashboard.**

---

### OneTrust vs Rottay

#### OneTrust

```
Enterprise pricing: $50,000 - $500,000/year
Implementation: 6-12 months with consultants
Maintenance: Dedicated compliance team required

Features you get:
- Cookie consent banners
- Privacy policy generator
- Vendor risk assessments
- Manual DSAR workflows

Features you still need to build:
- Actual data deletion logic
- Consent enforcement in your app
- Audit trail implementation
- Data export functionality
```

#### Rottay (8 lines)

```typescript
import { makeRecordConsentUseCase, makeExportUserDataUseCase } from '@rottay/compliance';

// Record consent with full audit trail
const consent = makeRecordConsentUseCase();
await consent.execute({
  userId,
  consentType: 'marketing',
  granted: true
}, { tenantId });

// Export all user data (GDPR Article 20)
const export = makeExportUserDataUseCase();
const data = await export.execute({ userId, format: 'json' }, { tenantId });
```

**Enterprise compliance. Developer simplicity.**

---

## Feature Flags

### LaunchDarkly vs Rottay

#### LaunchDarkly (28 lines)

```typescript
// lib/launchdarkly.ts
import * as LaunchDarkly from 'launchdarkly-node-server-sdk';

const client = LaunchDarkly.init(process.env.LAUNCHDARKLY_SDK_KEY!);

await client.waitForInitialization();

// hooks/use-feature-flag.ts
import { useFlags, useLDClient } from 'launchdarkly-react-client-sdk';

export function useFeatureFlag(key: string) {
  const flags = useFlags();
  return flags[key];
}

// app/layout.tsx - Provider required
import { LDProvider } from 'launchdarkly-react-client-sdk';

export default function Layout({ children }) {
  return (
    <LDProvider clientSideID={process.env.NEXT_PUBLIC_LD_CLIENT_ID!}>
      {children}
    </LDProvider>
  );
}

// usage
const showNewFeature = useFeatureFlag('new-checkout-flow');

// Cost: $8.33/seat/month minimum
// 1000 MAU = $100/month
// 10000 MAU = $500/month
```

#### Rottay (4 lines)

```typescript
import { makeGetFeatureFlagUseCase } from '@rottay/feature-flags';

const flag = makeGetFeatureFlagUseCase();
const result = await flag.execute({ key: 'new-checkout-flow' }, { tenantId, userId });
// result.value.enabled - boolean with full context
```

| Metric | LaunchDarkly | Rottay |
|--------|--------------|--------|
| Lines of code | 28+ | 4 |
| Provider wrapper | Required | None |
| Per-seat pricing | $8.33+/seat/mo | Included |
| MAU limits | Pay per MAU | Unlimited |

**Lines saved: 86%**

---

### Statsig vs Rottay

#### Statsig (22 lines)

```typescript
// lib/statsig.ts
import Statsig from 'statsig-node';

await Statsig.initialize(process.env.STATSIG_SECRET_KEY!);

// middleware.ts
import Statsig from 'statsig-node';

export async function checkFeature(userId: string, feature: string) {
  const user = { userID: userId };
  return Statsig.checkGate(user, feature);
}

// components/feature-gate.tsx
import { useGate } from 'statsig-react';

export function FeatureGate({ feature, children }) {
  const { value, isLoading } = useGate(feature);

  if (isLoading) return null;
  if (!value) return null;

  return children;
}
```

#### Rottay (4 lines)

```typescript
import { makeCheckFeatureGateUseCase } from '@rottay/feature-flags';

const gate = makeCheckFeatureGateUseCase();
const { value } = await gate.execute({ gate: 'premium-features' }, { tenantId, userId });
```

**Same pattern. Always.**

---

## Multi-Tenancy

### Custom Implementation vs Rottay

#### Custom Implementation (120+ lines across multiple files)

```typescript
// middleware/tenant.ts
import { NextRequest, NextResponse } from 'next/server';

export async function tenantMiddleware(req: NextRequest) {
  const hostname = req.headers.get('host');
  const subdomain = hostname?.split('.')[0];

  // Look up tenant
  const tenant = await db.tenant.findUnique({
    where: { subdomain }
  });

  if (!tenant) {
    return NextResponse.redirect('/not-found');
  }

  // Inject tenant into headers
  const response = NextResponse.next();
  response.headers.set('X-Tenant-ID', tenant.id);
  return response;
}

// lib/db.ts - Query interceptor
import { PrismaClient } from '@prisma/client';

function createTenantClient(tenantId: string) {
  const client = new PrismaClient();

  // Intercept all queries
  client.$use(async (params, next) => {
    // Add tenantId to all WHERE clauses
    if (params.args?.where) {
      params.args.where.tenantId = tenantId;
    }
    // Add tenantId to all CREATE data
    if (params.args?.data) {
      params.args.data.tenantId = tenantId;
    }
    return next(params);
  });

  return client;
}

// hooks/use-tenant.ts
import { createContext, useContext } from 'react';

const TenantContext = createContext<string | null>(null);

export function useTenant() {
  const tenantId = useContext(TenantContext);
  if (!tenantId) throw new Error('No tenant context');
  return tenantId;
}

// api/route.ts - Every API route
export async function GET(req: Request) {
  const tenantId = req.headers.get('X-Tenant-ID');
  if (!tenantId) {
    return Response.json({ error: 'No tenant' }, { status: 401 });
  }

  // Manual tenant filtering on every query
  const data = await db.user.findMany({
    where: { tenantId }
  });

  return Response.json(data);
}

// services/user.ts - Every service method
class UserService {
  constructor(private tenantId: string) {}

  async getUsers() {
    return db.user.findMany({
      where: { tenantId: this.tenantId }
    });
  }

  async createUser(data: CreateUserInput) {
    return db.user.create({
      data: { ...data, tenantId: this.tenantId }
    });
  }

  // Repeat for every method...
}

// And you still need:
// - Audit logging per tenant
// - Rate limiting per tenant
// - Feature flags per tenant
// - Billing per tenant
// - 100+ more lines...
```

#### Rottay (1 line per operation)

```typescript
// Every use case is automatically tenant-isolated
await useCase.execute(input, { tenantId });

// That's it. Really.

// Examples:
await createUser.execute({ email, name }, { tenantId });
await getUsers.execute({}, { tenantId });
await updateSettings.execute({ theme: 'dark' }, { tenantId });

// Audit logging: automatic
// Data isolation: automatic
// Rate limiting: automatic
// Feature flags: tenant-aware
```

| Metric | Custom | Rottay |
|--------|--------|--------|
| Lines of code | 120+ | 1 per operation |
| Files needed | 5-8 | 0 |
| Data leak risk | High | Zero |
| Maintenance burden | Ongoing | None |

**Lines saved: 99%**

---

## Permissions

### Permit.io vs Rottay

#### Permit.io (35 lines)

```typescript
// lib/permit.ts
import { Permit } from 'permitio';

const permit = new Permit({
  pdp: process.env.PERMIT_PDP_URL,
  token: process.env.PERMIT_API_KEY,
});

// middleware/authorize.ts
export async function authorize(
  user: string,
  action: string,
  resource: string
) {
  const permitted = await permit.check(user, action, resource);
  if (!permitted) {
    throw new Error('Forbidden');
  }
}

// Sync users to Permit
await permit.api.users.sync({
  key: user.id,
  email: user.email,
  attributes: { role: user.role }
});

// Sync resources to Permit
await permit.api.resources.create({
  key: 'document',
  name: 'Document',
  actions: { read: {}, write: {}, delete: {} }
});

// Every API call
export async function GET(req: Request) {
  await authorize(userId, 'read', `document:${docId}`);
  // ... rest of handler
}
```

#### Rottay (6 lines)

```typescript
import { makeCheckPermissionUseCase } from '@rottay/permissions';
import { RequirePermission } from '@rottay/permissions/decorators';

// Decorator pattern
@RequirePermission('document:read')
async function getDocument(id: string, ctx: Context) {
  return await documentRepo.findById(id, ctx);
}

// Or explicit check
const check = makeCheckPermissionUseCase();
await check.execute({ action: 'document:read', resourceId }, { tenantId, userId });
```

| Metric | Permit.io | Rottay |
|--------|-----------|--------|
| Lines of code | 35+ | 6 |
| External sync | Required | None |
| Dashboard dependency | Yes | Optional |
| Pricing | Per MAU | Included |

**Lines saved: 83%**

---

## Notifications

### Twilio + SendGrid + Firebase vs Rottay

#### The Multi-SDK Nightmare (60+ lines)

```typescript
// lib/twilio.ts
import twilio from 'twilio';

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

async function sendSMS(to: string, body: string) {
  return twilioClient.messages.create({
    to,
    from: process.env.TWILIO_PHONE_NUMBER,
    body,
  });
}

// lib/sendgrid.ts
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

async function sendEmail(to: string, subject: string, html: string) {
  return sgMail.send({
    to,
    from: process.env.FROM_EMAIL!,
    subject,
    html,
  });
}

// lib/firebase-messaging.ts
import admin from 'firebase-admin';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

async function sendPush(token: string, title: string, body: string) {
  return admin.messaging().send({
    token,
    notification: { title, body },
  });
}

// services/notification.ts - Unified? Not really.
class NotificationService {
  async notify(userId: string, message: string, channels: string[]) {
    const user = await getUser(userId);

    const promises = [];

    if (channels.includes('sms') && user.phone) {
      promises.push(sendSMS(user.phone, message));
    }
    if (channels.includes('email') && user.email) {
      promises.push(sendEmail(user.email, 'Notification', message));
    }
    if (channels.includes('push') && user.fcmToken) {
      promises.push(sendPush(user.fcmToken, 'Notification', message));
    }

    await Promise.allSettled(promises);
  }
}

// 3 SDKs. 3 accounts. 3 bills. 60+ lines. No unified tracking.
```

#### Rottay (5 lines)

```typescript
import { makeSendNotificationUseCase } from '@rottay/notifications';

const notify = makeSendNotificationUseCase();
await notify.execute({
  userId,
  template: 'order-shipped',
  channels: ['sms', 'email', 'push'],
  data: { orderId, trackingNumber }
}, { tenantId });
```

| Metric | Multi-SDK | Rottay |
|--------|-----------|--------|
| Lines of code | 60+ | 5 |
| SDKs to manage | 3 | 0 |
| Accounts to manage | 3 | 1 |
| Unified delivery tracking | No | Yes |
| Template management | DIY | Built-in |

**Lines saved: 92%**

---

## Audit Logging

### Datadog + Custom vs Rottay

#### Datadog + Custom Implementation (45 lines)

```typescript
// lib/datadog.ts
import tracer from 'dd-trace';

tracer.init({
  service: 'my-app',
  env: process.env.NODE_ENV,
});

// lib/audit.ts
import { datadogLogs } from '@datadog/browser-logs';

datadogLogs.init({
  clientToken: process.env.DD_CLIENT_TOKEN!,
  site: 'datadoghq.com',
  service: 'my-app',
});

// Every action needs manual logging
async function updateUser(userId: string, data: UpdateData) {
  const before = await db.user.findUnique({ where: { id: userId } });

  const result = await db.user.update({
    where: { id: userId },
    data,
  });

  // Manual audit log
  datadogLogs.logger.info('user.updated', {
    userId,
    performedBy: currentUser.id,
    before: JSON.stringify(before),
    after: JSON.stringify(result),
    timestamp: new Date().toISOString(),
    ip: request.ip,
    userAgent: request.headers['user-agent'],
  });

  return result;
}

// Repeat for EVERY operation...
// Cost: $15/host/month + $0.10/GB logs
```

#### Rottay (0 extra lines)

```typescript
import { makeUpdateUserUseCase } from '@rottay/identity';

const updateUser = makeUpdateUserUseCase();
await updateUser.execute({ userId, data }, { tenantId });

// Audit log created automatically:
// - Who did it (from context)
// - What changed (automatic diff)
// - When (timestamp)
// - Where (IP, user agent from context)
// - Immutable. Queryable. Compliant.
```

| Metric | Datadog | Rottay |
|--------|---------|--------|
| Extra code per operation | 10-15 lines | 0 |
| Monthly cost | $15+/host + logs | Included |
| Automatic diff tracking | No | Yes |
| Compliance-ready format | No | Yes |

**Lines saved: 100% per operation**

---

## The Pattern

Every Rottay use case follows the same pattern. Learn it once, use it everywhere.

```typescript
// Authentication
const login = makeLoginUseCase();
const result = await login.execute({ email, password }, { tenantId });

// Identity
const createUser = makeCreateUserUseCase();
const result = await createUser.execute({ email, name }, { tenantId });

// Permissions
const checkPermission = makeCheckPermissionUseCase();
const result = await checkPermission.execute({ action, resource }, { tenantId, userId });

// Tenancy
const createTenant = makeCreateTenantUseCase();
const result = await createTenant.execute({ name, plan }, { tenantId });

// Compliance
const processDSAR = makeProcessDSARUseCase();
const result = await processDSAR.execute({ userId, requestType }, { tenantId });

// Feature Flags
const getFlag = makeGetFeatureFlagUseCase();
const result = await getFlag.execute({ key }, { tenantId, userId });

// Notifications
const notify = makeSendNotificationUseCase();
const result = await notify.execute({ userId, template, channels }, { tenantId });
```

### The Consistency Advantage

```
make[Action]UseCase()     -> Factory creates the use case
.execute(input, context)  -> Run with input and tenant context
Result<T>                 -> Type-safe success or error

Same pattern.
Every module.
Every time.
```

---

## Total Impact

| Category | Competitors | Rottay | Savings |
|----------|-------------|--------|---------|
| Authentication | 35-50 lines | 5 lines | 85-90% |
| Compliance | Manual + $50K+ | Code | 100% + $50K |
| Feature Flags | 25-30 lines | 4 lines | 85% |
| Multi-Tenancy | 120+ lines | 1 line/op | 99% |
| Permissions | 35+ lines | 6 lines | 83% |
| Notifications | 60+ lines | 5 lines | 92% |
| Audit Logging | 15 lines/op | 0 lines | 100% |

### Annual Cost Comparison (10K MAU SaaS)

| Service | Annual Cost |
|---------|-------------|
| Auth0 Business | $2,760+ |
| LaunchDarkly Pro | $6,000+ |
| Vanta | $7,500+ |
| OneTrust | $50,000+ |
| Datadog | $5,000+ |
| Twilio + SendGrid | $2,000+ |
| **Total** | **$73,260+** |

| Rottay Platform | Included |
|-----------------|----------|
| All of the above | $0 extra |

---

## One Pattern to Rule Them All

```typescript
import { make[Something]UseCase } from '@rottay/[module]';

const useCase = make[Something]UseCase();
const result = await useCase.execute(input, { tenantId });

if (result.isOk()) {
  // Success: result.value
} else {
  // Error: result.error
}
```

**That's it. That's the entire API.**

---

> "The best code is no code at all. The second best is code that writes itself."
>
> Rottay gives you the second best. Consistently. Everywhere.
