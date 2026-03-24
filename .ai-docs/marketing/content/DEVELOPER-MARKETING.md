# Developer Marketing Guide

> Messaging specifically for developers. DX-first approach.

## Developer Persona

### Who They Are
- Role: Full-stack, backend, or platform engineers
- Experience: Mid to senior level
- Context: Building B2B SaaS products
- Pain: SDK fatigue, integration complexity, type inconsistency, 3am auth bugs

### What They Care About
1. Developer Experience (DX)
2. Type safety
3. Documentation quality
4. Time to first working code
5. Not reinventing the wheel
6. Code they can understand and debug

### What They Hate
- Vendor lock-in
- Magic/hidden behavior
- Poor error messages
- Outdated docs
- Complex configuration
- Per-seat pricing that punishes their team

---

## Core Developer Messages

### The Hook
"1,000+ use cases. 3 lines of code. Result<T> always."

### The Promise
"The infrastructure you'd build yourself, if you had 3 years and 500,000 lines of patience."

### The Proof
- Every use case returns Result<T> (no exceptions)
- Full TypeScript, full autocomplete
- { tenantId } = complete isolation
- 65% test coverage
- 13,777 TypeScript files

---

## DX-Focused Phrases

### Simplicity
| Phrase | Context |
|--------|---------|
| "Import. Execute. Ship." | Tagline |
| "3 lines, not 30." | Code comparison |
| "Autocomplete your way to production." | IDE experience |
| "The SDK that respects your time." | Value prop |

### Type Safety
| Phrase | Context |
|--------|---------|
| "Result<T>. Always. No exceptions. Literally." | Architecture |
| "Errors are values. Success is typed." | Philosophy |
| "Your IDE knows more than their documentation." | DX comparison |
| "TypeScript that actually types." | Quality |

### Relief
| Phrase | Context |
|--------|---------|
| "Never write another login flow." | Auth |
| "The 3am bug that's not your problem." | On-call |
| "Delete your auth code. Keep your sanity." | Migration |
| "Infrastructure that disappears. Products that shine." | Philosophy |

---

## Code Examples for Marketing

### The Basic Pattern
```typescript
import { makeLoginUseCase } from '@rottay/auth';

const login = makeLoginUseCase();
const result = await login.execute({ email, password }, { tenantId });

if (result.isSuccess) {
  // TypeScript knows the shape
}
```

### Multi-tenancy
```typescript
// That's it. Every query is scoped.
await useCase.execute(input, { tenantId });
```

### RBAC
```typescript
class CreateInvoice extends BaseUseCase {
  protected readonly requiredPermissions = ['invoices:create'];
  // Authorization is automatic
}
```

### Error Handling
```typescript
// No try/catch needed. Ever.
const result = await useCase.execute(input, context);

if (result.isFailure) {
  // result.error is typed
  switch (result.error.code) {
    case 'USER_NOT_FOUND': // TypeScript autocomplete
    case 'INVALID_CREDENTIALS':
  }
}
```

---

## Developer Content Strategy

### Blog Post Types
1. **Architecture deep dives** - "Why Result<T>", "How { tenantId } works"
2. **Comparisons with code** - "Auth0 vs Rottay: 30 lines vs 3"
3. **Tutorials** - "Add auth to your Next.js app in 5 minutes"
4. **War stories** - "How we handle 15 compliance frameworks"

### Video Types
1. **Live coding** - Build something with Rottay in real-time
2. **Code walkthroughs** - Tour of the SDK
3. **Before/after** - Refactoring from Auth0 to Rottay

### Social Content
- Code snippets that fit in a tweet
- "Thread: Why we never throw exceptions"
- Memes about SDK fatigue (tasteful)

---

## Developer Objections

### "I can build this myself"
Response: "You can. We did. It took 3 years and 500,000 lines. Your call."

### "What about vendor lock-in?"
Response: "We use PostgreSQL, TypeScript, and REST. The patterns are standard. result.isSuccess works anywhere."

### "Is it really that simple?"
Response: "Here's a CodeSandbox. Try it."

### "What if I need to customize?"
Response: "Extend BaseUseCase. Override what you need. We're a foundation, not a cage."

---

## Developer Community Strategy

### Where Developers Are
- Hacker News
- Reddit (r/typescript, r/webdev, r/SaaS, r/node)
- Twitter/X (Tech Twitter)
- Discord servers
- Dev.to / Hashnode
- GitHub discussions

### Content Tone
- Technical, not marketing-speak
- Show code, not slides
- Admit trade-offs
- Respect their intelligence

### Engagement Rules
- Answer technical questions with depth
- Share architecture decisions openly
- Accept criticism gracefully
- Never be salesy in technical discussions

---

## Developer Landing Page Structure

### Hero
Headline: "The Backend SDK That Doesn't Suck"
Subhead: "1,000+ use cases. TypeScript. Result<T>. No exceptions."
CTA: "See the code" (not "Start free trial")

### Section 1: The Pattern
Show the 3-line code example. That's it.

### Section 2: What's Included
Module list with use case counts. Link to docs.

### Section 3: The DX
- Full TypeScript
- Autocomplete everything
- Errors are values
- No configuration hell

### Section 4: vs. The Alternative
Side-by-side: Auth0 code vs Rottay code

### Section 5: Get Started
npm install command. Link to quickstart.

---

## Developer Email Sequences

### After Signup
1. Welcome + quickstart link
2. "Build your first auth flow" tutorial
3. "Questions? Here's our Discord"
4. "What are you building?" (engagement)

### After First Integration
1. "Nice! Here's what else you can do"
2. Advanced patterns guide
3. "Feedback?" survey

---

## Metrics That Matter to Developers

Don't show:
- Revenue numbers
- Customer logos
- Enterprise features

Do show:
- Time to first auth flow: 5 minutes
- Lines of code: 3 vs 30
- Test coverage: 65%
- TypeScript files: 13,777
- npm install size: X MB
- Bundle impact: X KB

---

## Developer Testimonial Themes

Look for quotes about:
- "Finally, auth that makes sense"
- "I deleted 2,000 lines of code"
- "The TypeScript experience I wanted"
- "Result<T> changed how I think about errors"
- "Spent 5 minutes instead of 5 days"

---

## Anti-Patterns (What NOT to Do)

- Don't use "revolutionary" or "game-changing"
- Don't hide the code behind a signup
- Don't require a sales call to see pricing
- Don't use stock photos of "developers"
- Don't claim it's "easy" - claim it's "simple"
- Don't compare features - compare code
- Don't oversell - let the DX speak
