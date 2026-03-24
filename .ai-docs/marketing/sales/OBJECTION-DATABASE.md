# Sales Objection Database

> Comprehensive objection handling beyond battlecards. Includes detailed responses, proof points, conversation examples, and follow-up questions.
> Last updated: January 2026

---

## Price Objections

### "Too expensive"

| Component | Content |
|-----------|---------|
| **Response** | "I understand budget is a concern. Let's look at the total picture. What are you currently paying across auth, compliance, feature flags, and permissions? Most companies are spending $27,880/year minimum on those four alone - before engineering time." |
| **Proof Points** | - Auth0: $9,600/year (Professional, 50K MAU)<br>- Vanta: $10,000/year + $10K-$50K audit fees<br>- LaunchDarkly: $2,400/year (10 seats)<br>- Permit.io: $1,800/year<br>- Custom multi-tenancy: 4-8 weeks engineering<br>- **Total: $27,880/year + engineering** |
| **Follow-up Questions** | - "What's your current spend across infrastructure vendors?"<br>- "How much engineering time is going into integration and maintenance?"<br>- "What's the cost of a 3-month delay to ship while building this yourself?" |
| **Conversation Example** | Prospect: "This is more than we budgeted."<br><br>You: "What was the budget based on?"<br><br>Prospect: "We were looking at Auth0 at $240/month."<br><br>You: "That's $2,880/year for auth alone. Now add compliance - you'll need Vanta at $7,500/year minimum. Feature flags - LaunchDarkly at $200/month. That's already $10,000+ and you still need permissions, multi-tenancy, notifications. The budget comparison isn't auth vs Rottay - it's your total infrastructure stack vs Rottay." |

---

### "Auth0 is cheaper"

| Component | Content |
|-----------|---------|
| **Response** | "At what scale? Auth0's pricing accelerates quickly. Let me show you the math." |
| **Proof Points** | - 10K MAU: Auth0 = $240/month<br>- 50K MAU: Auth0 = $800+/month<br>- 100K MAU: Auth0 = Custom (typically $48K+/year)<br>- Plus: SSO connections extra, impossible travel detection extra, attack protection extra<br>- 34% of developers cite Auth0 pricing as their top concern |
| **Follow-up Questions** | - "What's your current MAU? What do you project in 12 months?"<br>- "Do you need enterprise SSO? Auth0 charges per connection."<br>- "Have you calculated what happens if you go viral or have a traffic spike?" |
| **Conversation Example** | Prospect: "Auth0 is only $240/month."<br><br>You: "At how many MAU?"<br><br>Prospect: "We're at 10K now."<br><br>You: "Where will you be in a year?"<br><br>Prospect: "Probably 50K if things go well."<br><br>You: "At 50K, Auth0 Professional is $800/month - that's $9,600/year. And that's just authentication. You still need compliance, feature flags, permissions, multi-tenancy. We include all of that. The question isn't 'is Auth0 cheaper for auth' - it's 'what's your total infrastructure cost.'" |

---

### "We can build it ourselves"

| Component | Content |
|-----------|---------|
| **Response** | "You absolutely can. Let me share what that typically involves so you can make an informed build vs buy decision." |
| **Proof Points** | - Our codebase: 500K+ lines, 13,777 TypeScript files<br>- Test coverage: 65% (9,013 test files)<br>- Development time: 3 years<br>- Team: Multiple senior engineers<br>- Engineering cost: $150-200/hour x 400-720 hours = $60K-$144K for integration alone<br>- Ongoing maintenance: 2-3 FTEs |
| **Follow-up Questions** | - "What's your team's capacity for infrastructure work vs product features?"<br>- "How long would it take to build multi-tenant auth with all the edge cases?"<br>- "What's the opportunity cost of not shipping product features for 6-12 months?" |
| **Conversation Example** | Prospect: "Our team can build this."<br><br>You: "They definitely can. Your engineers are smart. The question is: should they? We've spent 3 years building 500K lines of code with 65% test coverage. That's approximately $3M in development cost and 2-3 FTEs for ongoing maintenance. Is auth, compliance, and multi-tenancy your competitive advantage, or is your product?"<br><br>Prospect: "Fair point. But we want control."<br><br>You: "Totally understand. That's why we use standard patterns - PostgreSQL, TypeScript, REST APIs. Your data is always yours. We're not a black box. You get control without building from scratch." |

---

### "We need to see ROI first"

| Component | Content |
|-----------|---------|
| **Response** | "Absolutely. Let's calculate your ROI together using your actual numbers." |
| **Proof Points** | - Integration time savings: 10-18 weeks (assembling) vs 1-2 weeks (Rottay)<br>- Engineering cost: $60K-$108K saved on integration<br>- Vendor consolidation: 6 vendors to 1<br>- Support overhead: 6 queues to 1<br>- Security surface: 6 vendors with your data to 1 |
| **Follow-up Questions** | - "What's your engineering hourly rate? Let's calculate integration savings."<br>- "How many hours per month does your team spend on vendor coordination?"<br>- "What's the cost of a security incident from vendor sprawl?" |
| **Conversation Example** | Prospect: "We need to justify this to finance."<br><br>You: "Let's build the business case together. What's your average engineering cost per hour?"<br><br>Prospect: "About $150 fully loaded."<br><br>You: "Typical integration for 6 vendors is 400-720 hours. That's $60K-$108K. Rottay integration is 40-80 hours - $6K-$12K. You save $54K-$96K on integration alone. Add annual vendor costs of $28K+ that consolidate into one platform. That's your year-one business case." |

---

## Technical Objections

### "We're locked into AWS"

| Component | Content |
|-----------|---------|
| **Response** | "We work great with AWS. And any other cloud. Our platform is cloud-agnostic by design." |
| **Proof Points** | - PostgreSQL: Runs on any cloud<br>- Deployment: AWS, GCP, Azure, or self-hosted<br>- No proprietary services required<br>- Private Cloud option: Your AWS account, we manage |
| **Follow-up Questions** | - "Is the concern about infrastructure location or about vendor compatibility?"<br>- "Would deploying in your AWS account address the concern?" |
| **Conversation Example** | Prospect: "We're an AWS shop. Everything runs there."<br><br>You: "Perfect. Rottay can deploy in your AWS account. We call it Private Cloud - your infrastructure, our management. PostgreSQL runs on RDS, everything stays in your VPC. You get the benefits of AWS investment plus our platform." |

---

### "Worried about vendor lock-in"

| Component | Content |
|-----------|---------|
| **Response** | "Smart concern. Here's how we address it: standard patterns everywhere, your data always exportable." |
| **Proof Points** | - Database: Standard PostgreSQL (not proprietary)<br>- Language: TypeScript (industry standard)<br>- Patterns: Result<T>, use cases (common patterns)<br>- APIs: REST (standard)<br>- Data export: Any time, standard formats<br>- No proprietary query languages |
| **Follow-up Questions** | - "What specific lock-in concerns you? Data portability? Code patterns? Infrastructure?"<br>- "How does this compare to your current Auth0/Clerk lock-in?" |
| **Conversation Example** | Prospect: "What if we need to leave Rottay?"<br><br>You: "You can. Your data is in standard PostgreSQL - export anytime. Our patterns are standard TypeScript use cases - no magic. Compare that to Auth0's Universal Login customization or Clerk's component library. With those, your auth UI is locked to their patterns. With us, you own the implementation patterns." |

---

### "Need more customization"

| Component | Content |
|-----------|---------|
| **Response** | "Our use case pattern is designed for extensibility. You can customize anything while keeping the platform benefits." |
| **Proof Points** | - Base use case pattern: Extend any use case<br>- Decorator pattern: Add custom logic<br>- Override capabilities: Replace default behavior<br>- Custom use cases: Build on our base classes<br>- No black boxes: Transparent implementation |
| **Follow-up Questions** | - "What specific customization do you need?"<br>- "Is it a new use case, or modifying existing behavior?" |
| **Conversation Example** | Prospect: "We have specific auth requirements for our industry."<br><br>You: "Tell me more about what's specific."<br><br>Prospect: "We need custom MFA flows with hardware tokens."<br><br>You: "Our MFA use cases support TOTP, SMS, email, and we have extension points for custom methods. You'd extend `makeMFAVerificationUseCase` with your hardware token logic. Same pattern, your custom flow. Want me to show you how that works in code?" |

---

### "Our architecture is different"

| Component | Content |
|-----------|---------|
| **Response** | "We integrate with various architectures. Tell me about yours and I'll show you how Rottay fits." |
| **Proof Points** | - Monolith: Single SDK integration<br>- Microservices: SDK per service, shared context<br>- Serverless: Works with Lambda, Cloud Functions<br>- Event-driven: Use cases emit events<br>- GraphQL: Use cases work behind resolvers |
| **Follow-up Questions** | - "What's your current architecture pattern?"<br>- "Where would auth/compliance/tenancy fit in your system?" |
| **Conversation Example** | Prospect: "We're a microservices architecture."<br><br>You: "Common pattern. Each service that needs auth, permissions, or tenancy includes our SDK. The `{ tenantId }` context propagates across services - typically in headers or message metadata. Each service validates independently, same source of truth. We have customers running 20+ services on the platform." |

---

## Timing Objections

### "Not the right time"

| Component | Content |
|-----------|---------|
| **Response** | "I understand. Can you help me understand what would make it the right time? I want to make sure we're aligned on timing." |
| **Proof Points** | - Auth0 price increases: Announced regularly<br>- Azure AD B2C: Sunset May 2025 - deadline approaching<br>- AWS Cognito: 3x price increase December 2025<br>- Compliance requirements: Often have deadlines<br>- Cost of waiting: Each month of delay is another month of vendor fees |
| **Follow-up Questions** | - "What's driving your timeline?"<br>- "Is there a compliance deadline or enterprise deal that creates urgency?"<br>- "What happens if you wait 6 months?" |
| **Conversation Example** | Prospect: "We're not ready to make a change right now."<br><br>You: "I get it. What would need to be true for it to be the right time?"<br><br>Prospect: "We're mid-project on our core product."<br><br>You: "Makes sense. Here's a thought: we can run a POC alongside your current work. Two weeks, minimal engineering time. When your project wraps, you'll have real data on whether Rottay works for you. No commitment, just information for when timing is right." |

---

### "Already mid-project"

| Component | Content |
|-----------|---------|
| **Response** | "We work with teams mid-project all the time. Gradual adoption is our recommended approach anyway." |
| **Proof Points** | - Parallel running: Keep current systems live<br>- Module-by-module: Start with auth, add compliance later<br>- Feature flag migration: Gradual user rollout<br>- No big bang required: Incremental adoption |
| **Follow-up Questions** | - "When does your current project finish?"<br>- "What infrastructure decisions are you making as part of this project?"<br>- "Would it help to have Rottay as an option when the project completes?" |
| **Conversation Example** | Prospect: "We're in the middle of a major release."<br><br>You: "What's your timeline?"<br><br>Prospect: "About 8 weeks."<br><br>You: "Perfect. Let's do a technical evaluation now - maybe 2-3 hours of your time. By the time your release ships, you'll know whether Rottay is right for your next phase. No disruption to current work, you're just collecting information." |

---

### "Need to evaluate more options"

| Component | Content |
|-----------|---------|
| **Response** | "Absolutely. Thorough evaluation is smart. What options are you considering? I can help you think through the comparison." |
| **Proof Points** | - Competitive analysis available<br>- POC offer: 2-week trial in your environment<br>- No pressure sales: We want informed decisions<br>- Comparison guides: Auth0, Vanta, LaunchDarkly documented |
| **Follow-up Questions** | - "What other solutions are you evaluating?"<br>- "What are your evaluation criteria?"<br>- "Would a POC help you evaluate faster?" |
| **Conversation Example** | Prospect: "We want to look at a few options."<br><br>You: "Smart approach. Who else are you considering?"<br><br>Prospect: "We're looking at Auth0 plus Vanta."<br><br>You: "Good options to evaluate. Here's a suggestion: do a POC with us alongside your Auth0/Vanta evaluation. Two weeks, same evaluation criteria. You'll have apples-to-apples comparison data. We're confident in the outcome, which is why we make the POC easy." |

---

## Trust Objections

### "Never heard of you"

| Component | Content |
|-----------|---------|
| **Response** | "We're not the biggest name in the market - yet. Here's what we have: production-proven software with real customers." |
| **Proof Points** | - 500K+ lines of code<br>- 65% test coverage (9,013 test files)<br>- 3 years of development<br>- Production deployments across multiple verticals<br>- 77 NPM packages<br>- 1,023+ use cases |
| **Follow-up Questions** | - "What would help you feel confident in our reliability?"<br>- "Would talking to a reference customer help?"<br>- "What due diligence would you need to do?" |
| **Conversation Example** | Prospect: "We've never heard of Rottay."<br><br>You: "Fair. We're not Auth0 with their marketing budget. But here's what we have: 500K lines of production code, 65% test coverage, 3 years of development. Multiple customers running in production across fintech, healthtech, and B2B SaaS. Would it help to talk to one of our customers? I can arrange a reference call." |

---

### "Too new"

| Component | Content |
|-----------|---------|
| **Response** | "We've been building for 3 years. The question isn't age - it's whether the software works. Let me show you the proof." |
| **Proof Points** | - Development: 3 years of focused work<br>- Codebase: 500K+ lines, not a weekend project<br>- Testing: 65% coverage, 9,013 test files<br>- Production: Real customers, real traffic<br>- Iteration: Refined through actual usage |
| **Follow-up Questions** | - "What would demonstrate sufficient maturity?"<br>- "Would a technical deep dive help you assess the codebase quality?"<br>- "What about a POC to test in your environment?" |
| **Conversation Example** | Prospect: "This seems like a young product."<br><br>You: "The company is focused on this product for 3 years. 500K lines of code, 65% test coverage. Compare that to Auth0's early days or any startup you've evaluated. The question is: does it work for your use case? A two-week POC will prove that out. If it doesn't work, you've lost two weeks. If it does, you've found your platform." |

---

### "What if you go away?"

| Component | Content |
|-----------|---------|
| **Response** | "Valid concern. Here's how we protect you: standard tech, data portability, and for enterprise - escrow options." |
| **Proof Points** | - Standard database: PostgreSQL, export anytime<br>- Standard patterns: TypeScript, no proprietary languages<br>- Data ownership: Your data, your database<br>- Code escrow: Available for Enterprise (source code in escrow)<br>- No black box: You can see how it works |
| **Follow-up Questions** | - "What would make you comfortable with the continuity risk?"<br>- "Is code escrow something you'd want?"<br>- "How do you handle this risk with your other vendors?" |
| **Conversation Example** | Prospect: "What happens if Rottay shuts down?"<br><br>You: "Important question. Three things protect you: First, your data is in standard PostgreSQL - export it anytime. Second, our patterns are standard TypeScript - no proprietary languages. Third, for Enterprise customers, we offer code escrow - if we cease operations, you get source code. How do you handle this with Auth0 or Vanta? They don't offer escrow." |

---

## Competitor Objections

### "We already use Auth0"

| Component | Content |
|-----------|---------|
| **Response** | "Auth0 is a solid auth product. The question is whether auth alone is enough, or whether you need the broader platform." |
| **Proof Points** | - Auth0 limitations: 4 outages in 2024, pricing concerns, auth-only<br>- Migration path: We have Auth0 migration scripts<br>- Session continuity: Preserve existing sessions during migration<br>- Parallel running: No big bang cutover required |
| **Follow-up Questions** | - "How has your Auth0 bill changed over the last year?"<br>- "Have you experienced any Auth0 outages?"<br>- "What do you use for compliance, feature flags, multi-tenancy?" |
| **Conversation Example** | Prospect: "We're already on Auth0."<br><br>You: "Makes sense. How's it working for you?"<br><br>Prospect: "It's fine, but expensive."<br><br>You: "You're not alone - 34% of developers cite Auth0 pricing as their top concern. Here's the thing: you're paying $X for auth alone. What are you using for compliance? Feature flags? Permissions? Multi-tenancy? By the time you add those, you're at $28K+/year across vendors. We include all of it. Want to see what migration looks like?" |

---

### "Vanta handles our compliance"

| Component | Content |
|-----------|---------|
| **Response** | "Vanta is a compliance tracking tool. We're a compliance implementation platform. They're actually complementary." |
| **Proof Points** | - Vanta: Tracks 5 frameworks, requires you to build controls<br>- Rottay: Implements 15 frameworks, controls built into code<br>- Together: Vanta tracks, Rottay implements, fewer gaps<br>- Cost: Vanta $7,500-$30K + audit fees ($10K-$50K), we include audit support |
| **Follow-up Questions** | - "How much engineering time goes into building the controls Vanta tracks?"<br>- "Do you need compliance beyond SOC 2 and ISO? KYC, AML, gaming?"<br>- "What are your total compliance costs including audit fees?" |
| **Conversation Example** | Prospect: "We use Vanta for compliance."<br><br>You: "Great tool for tracking. Question: who implements the controls Vanta tracks?"<br><br>Prospect: "Our engineering team."<br><br>You: "Exactly. Vanta shows you what's compliant and what's not. Your team builds the compliant code. Our 138 compliance use cases ARE the compliant code. You use them, Vanta tracks them, fewer gaps to remediate. We actually make Vanta's job easier." |

---

### "LaunchDarkly works fine for feature flags"

| Component | Content |
|-----------|---------|
| **Response** | "LaunchDarkly is great at feature flags. The question is whether feature flags should be a separate $1K+/month line item." |
| **Proof Points** | - LaunchDarkly: $10-$20/seat, 50 seats = $500-$1,000/month<br>- Rottay: Feature flags included, no seat pricing<br>- Bonus: Rottay flags are tenant-aware by default<br>- Consolidation: One less vendor, one less SDK |
| **Follow-up Questions** | - "How many seats do you have on LaunchDarkly?"<br>- "Do you need tenant-aware feature flags?"<br>- "What's your total across LaunchDarkly plus other infrastructure vendors?" |
| **Conversation Example** | Prospect: "We already have LaunchDarkly."<br><br>You: "How many seats?"<br><br>Prospect: "About 30."<br><br>You: "So $300-$600/month, $3,600-$7,200/year. For feature flags alone. Our feature flags are included with the platform - no seat pricing. Plus they're tenant-aware out of the box, which LaunchDarkly requires custom work to achieve. It's not about replacing LaunchDarkly; it's about whether feature flags should be a separate vendor." |

---

### "Why not just use [Competitor X]?"

**General Framework:**

| Step | Action |
|------|--------|
| 1 | Acknowledge the competitor's strength |
| 2 | Identify what they don't do |
| 3 | Calculate total cost including gaps |
| 4 | Present unified platform value |

**Example:**

Prospect: "Why not just use Clerk?"

You: "Clerk is excellent for quick auth integration - great DX, beautiful components. Here's the gap: Clerk handles auth. You still need:
- Compliance (add Vanta: $7,500/year)
- Feature flags (add LaunchDarkly: $2,400/year)
- Permissions (add Permit.io: $1,800/year)
- Multi-tenancy (build yourself: weeks of engineering)

Plus, Clerk's B2B pricing compounds: $0.02/MAU + $0.02/org. At 50K users and 100 orgs, that's $2K/month just for auth.

We include auth plus all those other categories. One platform, one SDK, one price."

---

## Implementation Objections

### "This seems complex to integrate"

| Component | Content |
|-----------|---------|
| **Response** | "The integration is actually simpler than what you're probably used to. One SDK, one pattern for everything." |
| **Proof Points** | - Integration time: 1-2 weeks vs 8-12 weeks (6 vendors)<br>- Single SDK: One package to install<br>- Consistent pattern: `makeXUseCase().execute(input, context)`<br>- Same pattern everywhere: Auth, compliance, flags, permissions |
| **Follow-up Questions** | - "What's been your experience integrating auth solutions before?"<br>- "Would a code walkthrough help show the simplicity?"<br>- "Want to see a POC in your codebase?" |
| **Conversation Example** | Prospect: "This looks like a lot to integrate."<br><br>You: "I understand that concern. Let me show you the actual code. [Pull up editor]<br><br>Auth: 3 lines. Compliance: 3 lines. Feature flags: 2 lines. Every use case follows the same pattern. Compare that to integrating Auth0 (45 lines across 4 files) plus Vanta (dashboard config) plus LaunchDarkly (28 lines plus provider). Our integration is simpler because it's one SDK with one consistent pattern." |

---

### "We don't have bandwidth for migration"

| Component | Content |
|-----------|---------|
| **Response** | "Migration doesn't have to be a big project. We support gradual adoption - module by module, no big bang required." |
| **Proof Points** | - Parallel running: Keep existing systems live<br>- Module-by-module: Start with one capability<br>- Feature flag rollout: Migrate users gradually<br>- Timeline: 1-2 weeks per module<br>- Support: Migration assistance available |
| **Follow-up Questions** | - "What's your current priority?"<br>- "Which capability would you want to migrate first?"<br>- "When does your team have capacity?" |
| **Conversation Example** | Prospect: "We can't take on a migration project right now."<br><br>You: "Makes sense. Here's what we typically recommend: don't migrate everything at once. Start with one module - usually auth. Two weeks, minimal disruption. Run in parallel with your current solution. When you're confident, cut over. Then add compliance, feature flags, etc. over time. Same SDK, no new integrations needed for each module." |

---

### "Our team isn't familiar with these patterns"

| Component | Content |
|-----------|---------|
| **Response** | "The patterns are intentionally simple. If your team knows TypeScript, they'll be productive in a day." |
| **Proof Points** | - Pattern: `make[Something]UseCase()` + `.execute()`<br>- Result<T>: Simple success/error handling<br>- No magic: Just functions and types<br>- Documentation: Comprehensive guides<br>- Support: Direct engineering access |
| **Follow-up Questions** | - "What tech stack is your team most comfortable with?"<br>- "Would a technical workshop help?"<br>- "Want me to walk your team through the patterns?" |
| **Conversation Example** | Prospect: "This is different from what our team is used to."<br><br>You: "The learning curve is minimal. Watch: [Show code]<br><br>Every use case: `const useCase = make[Something]UseCase()`. Execute it: `await useCase.execute(input, { tenantId })`. Handle result: `if (result.isOk()) { ... }`. That's the entire API. Same pattern, every module. Your team will be productive in a day. We also offer a technical workshop to get everyone up to speed." |

---

## Escalation Responses

### When you need to escalate

| Situation | Action |
|-----------|--------|
| **Deep technical concerns** | "Let me bring in our solutions engineer for a technical deep dive." |
| **Executive buy-in needed** | "Would it help to have our founder/CEO join the conversation?" |
| **Legal/security review** | "We have pre-filled security questionnaires and can provide SOC 2 reports under NDA." |
| **Custom pricing** | "Let me work with our team on a custom proposal that addresses your specific situation." |
| **Reference request** | "I can arrange a call with a customer in a similar industry/stage." |

---

## Red Flags (When to Disengage)

| Signal | Response |
|--------|----------|
| **No budget whatsoever** | "Sounds like timing isn't right. Let's reconnect when budget opens up." |
| **No technical decision-maker involved** | "To evaluate properly, we should include your technical lead. Can we schedule that?" |
| **Already committed to competitor** | "Sounds like you've made a decision. Keep us in mind if things change." |
| **Unrealistic timeline expectations** | "That timeline is aggressive. Let's discuss what's realistic." |
| **Just price shopping** | "I want to make sure we're a good fit beyond price. What are your key requirements?" |

---

## Related Documents

| Document | Description |
|----------|-------------|
| [DEMO-SCRIPTS.md](./DEMO-SCRIPTS.md) | Live demo scripts |
| [FAQ.md](./FAQ.md) | Common questions |
| [../BATTLECARDS.md](../BATTLECARDS.md) | Competitor battlecards |
| [../TCO-CALCULATOR.md](../TCO-CALCULATOR.md) | Cost comparisons |
| [../COMPETITIVE-ANALYSIS.md](../COMPETITIVE-ANALYSIS.md) | Full competitor research |
