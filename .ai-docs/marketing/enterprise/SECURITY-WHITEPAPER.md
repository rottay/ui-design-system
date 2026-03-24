# Rottay Security Whitepaper

Technical security documentation for enterprise buyers.

---

## Executive Summary

Rottay is a B2B SaaS infrastructure platform built with security as a foundational principle. Our platform provides authentication, authorization, multi-tenancy, and compliance capabilities that meet enterprise security requirements out of the box.

**Security Highlights:**
- SOC 2 Type II compliant infrastructure
- End-to-end encryption (AES-256 at rest, TLS 1.3 in transit)
- Multi-tenant architecture with strict data isolation
- 15 compliance frameworks implemented (not just tracked)
- 24/7 monitoring with automated threat detection
- Annual third-party penetration testing

This whitepaper provides detailed technical information for security teams, compliance officers, and enterprise buyers evaluating Rottay.

---

## Platform Security

### Infrastructure

**Cloud Providers**
- Primary: AWS (Amazon Web Services)
- Secondary: GCP (Google Cloud Platform) for specific workloads
- All infrastructure runs on SOC 2, ISO 27001, and FedRAMP certified platforms

**Data Center Locations**
- US-East (Primary)
- US-West (Failover)
- EU-West (GDPR compliance)
- Additional regions available for enterprise customers

**Network Architecture**
- Private VPC with segmented subnets
- No direct internet access to application servers
- Bastion hosts for administrative access
- Network ACLs and security groups at every layer
- Internal traffic encrypted with mTLS

**DDoS Protection**
- AWS Shield Advanced for layer 3/4 protection
- Cloudflare for layer 7 protection
- Automatic traffic scrubbing
- Rate limiting at edge and application layers

**WAF Implementation**
- AWS WAF with custom rulesets
- OWASP Top 10 protection
- Bot detection and mitigation
- Geo-blocking capabilities
- Real-time rule updates

### Data Security

**Encryption at Rest**
- Algorithm: AES-256-GCM
- All databases encrypted
- All backups encrypted
- All file storage encrypted
- Encryption verified through automated compliance checks

**Encryption in Transit**
- TLS 1.3 for all external connections
- TLS 1.2 minimum (1.0/1.1 disabled)
- Perfect forward secrecy enabled
- Strong cipher suites only
- HSTS enforced with preloading

**Key Management**
- AWS KMS for key storage
- Automatic key rotation (annual)
- Separate keys per tenant (enterprise tier)
- Key access logging
- Hardware Security Modules (HSMs) for critical keys

**Data Classification**
- Automatic PII detection and tagging
- PHI identification for healthcare customers
- PCI data isolation for payment processing
- Classification-based access controls
- Retention policies per data class

**Data Loss Prevention**
- Built-in DLP rules
- Sensitive data masking in logs
- Export controls and approvals
- Anomaly detection for data exfiltration
- Watermarking for document tracking

### Access Control

**RBAC Architecture**
- Hierarchical role-based access control
- 1,000+ granular permissions available
- Custom role creation
- Permission inheritance
- Time-based access controls

**Multi-Tenancy Isolation**
- Logical isolation at database level
- Every query filtered by `tenantId`
- Cross-tenant access impossible by design
- Separate encryption keys (enterprise)
- Tenant-specific audit logs

**Admin Access Controls**
- Principle of least privilege
- Just-in-time access provisioning
- Multi-person approval for sensitive actions
- Break-glass procedures documented
- All admin actions logged

**Audit Logging**
- Comprehensive audit trail
- Immutable log storage
- 90-day online retention (default)
- 7-year archive retention
- Log integrity verification

**Session Management**
- Configurable session timeouts
- Concurrent session limits
- Session revocation capability
- Geographic session restrictions
- Device fingerprinting

### Authentication Security

**Password Hashing**
- Primary: Argon2id (recommended)
- Alternative: bcrypt (legacy support)
- Minimum 12 character passwords
- Breach database checking (HaveIBeenPwned)
- Password strength requirements

**MFA Options**
- TOTP (authenticator apps)
- SMS (with security warnings)
- Email verification
- Passkeys/WebAuthn (FIDO2)
- Hardware keys (YubiKey, etc.)
- Push notifications

**Passkey/WebAuthn Support**
- Full FIDO2 compliance
- Resident credentials
- Cross-device authentication
- Platform authenticator support
- Security key roaming

**Impossible Travel Detection**
- Geographic velocity checking
- Automatic session challenge
- Risk-based authentication
- Configurable sensitivity
- Alert notifications

**Brute Force Protection**
- Progressive delays
- Account lockout (configurable)
- IP-based rate limiting
- CAPTCHA challenges
- Honeypot detection

**Session Security**
- Secure, HttpOnly, SameSite cookies
- Token rotation on privilege changes
- Binding to device/IP (optional)
- Automatic timeout
- Graceful session handling

---

## Application Security

### Secure Development

**SDLC Practices**
- Security requirements in planning
- Threat modeling for new features
- Security-focused code reviews
- Pre-commit security hooks
- Security sign-off for releases

**Code Review Process**
- Mandatory peer review
- Security-focused review checklist
- Automated PR scanning
- Senior review for sensitive changes
- Documentation requirements

**Static Analysis (SAST)**
- Semgrep for custom rules
- CodeQL for deep analysis
- SonarQube for quality metrics
- Pre-commit scanning
- CI/CD integration

**Dynamic Analysis (DAST)**
- Automated vulnerability scanning
- OWASP ZAP integration
- Weekly scheduled scans
- Pre-release security testing
- Continuous monitoring

**Dependency Scanning**
- Dependabot for updates
- Snyk for vulnerability detection
- License compliance checking
- Private registry scanning
- Automatic PR creation

**Test Coverage**
- 65% overall test coverage
- 85%+ coverage for security-critical code
- Integration test suite
- End-to-end security tests
- Chaos engineering practices

### Architecture Security

**Result<T> Pattern**
- Predictable error handling
- No uncaught exceptions
- Type-safe error propagation
- Security errors properly categorized
- Audit-friendly error tracking

**Input Validation**
- Zod schema validation
- Type-safe validation
- Whitelist-based validation
- Size limits enforced
- Encoding normalization

**Output Encoding**
- Context-aware encoding
- HTML entity encoding
- JavaScript escaping
- URL encoding
- JSON sanitization

**SQL Injection Prevention**
- Parameterized queries only
- ORM-based data access
- No raw SQL execution
- Query logging and analysis
- Prepared statement caching

**XSS Prevention**
- Content Security Policy
- Trusted Types enforcement
- React auto-escaping
- Sanitization libraries
- DOM manipulation restrictions

**CSRF Protection**
- SameSite cookie attribute
- CSRF tokens for forms
- Origin validation
- Referrer checking
- Double-submit cookies

### API Security

**Authentication Methods**
- JWT with short expiration
- API keys for service accounts
- OAuth 2.0 / OIDC
- mTLS for service-to-service
- Session tokens for web

**Rate Limiting**
- Per-endpoint limits
- Per-user limits
- Per-tenant limits
- Sliding window algorithm
- Graceful degradation

**API Key Management**
- Scoped permissions
- Rotation capabilities
- Expiration dates
- Usage analytics
- Revocation logging

**Request Validation**
- Schema validation
- Size limits
- Content-type enforcement
- Request signing (optional)
- Idempotency keys

**Response Sanitization**
- Field-level filtering
- Sensitive data redaction
- Error message sanitization
- Stack trace removal
- Debug info exclusion

---

## Compliance

### Certifications

| Certification | Status | Details |
|---------------|--------|---------|
| SOC 2 Type II | Active | Annual audit by [Auditor Name] |
| ISO 27001 | In Progress | Expected Q2 2026 |
| HIPAA | Available | BAA available for healthcare customers |
| PCI-DSS | Level 4 | Self-assessment questionnaire |
| GDPR | Compliant | EU data processing agreement available |

### Frameworks Supported

Rottay implements (not just tracks) 15 compliance frameworks:

| Framework | Description |
|-----------|-------------|
| SOC 2 | Service Organization Controls for security, availability, confidentiality |
| ISO 27001 | International information security management standard |
| HIPAA | Health Insurance Portability and Accountability Act |
| PCI-DSS | Payment Card Industry Data Security Standard |
| GDPR | General Data Protection Regulation (EU) |
| CCPA | California Consumer Privacy Act |
| NIST 800-53 | Federal information systems security controls |
| NIST CSF | Cybersecurity Framework for critical infrastructure |
| CIS Controls | Center for Internet Security best practices |
| FedRAMP | Federal Risk and Authorization Management Program |
| HITRUST | Healthcare industry trust framework |
| COBIT | Control Objectives for IT governance |
| FISMA | Federal Information Security Management Act |
| GLBA | Gramm-Leach-Bliley Act for financial services |
| FERPA | Family Educational Rights and Privacy Act |

### Audit Support

**Audit Trail Capabilities**
- Complete action history
- User attribution
- Timestamp with timezone
- Before/after values
- Correlation IDs

**Evidence Collection**
- Automated evidence gathering
- Continuous compliance monitoring
- Screenshot capture
- Configuration snapshots
- Access review reports

**Report Generation**
- On-demand compliance reports
- Scheduled report delivery
- Custom report templates
- Executive summaries
- Technical detail reports

**Third-Party Audit Support**
- Auditor portal access
- Read-only evidence views
- Direct auditor communication
- Historical data access
- Remediation tracking

---

## Operational Security

### Monitoring

**24/7 Monitoring**
- Security Operations Center coverage
- Automated alert triage
- Escalation procedures
- On-call engineering rotation
- Customer notification process

**Alerting**
- Real-time security alerts
- Threshold-based alerts
- Anomaly detection
- Correlation engine
- PagerDuty integration

**Incident Response**
- Documented IR procedures
- Regular IR drills
- Post-incident reviews
- Customer communication SLA
- Forensic capabilities

**SLA Commitments**
- 99.9% uptime guarantee
- 15-minute response (critical)
- 1-hour response (high)
- 4-hour response (medium)
- 24-hour response (low)

### Business Continuity

**Backup Strategy**
- Automated daily backups
- Point-in-time recovery (30 days)
- Cross-region replication
- Encryption at rest
- Monthly backup testing

**Disaster Recovery**
- Documented DR procedures
- Quarterly DR testing
- Automated failover
- Manual failover procedures
- Communication templates

**RTO/RPO Targets**
| Tier | RTO | RPO |
|------|-----|-----|
| Critical | 1 hour | 15 minutes |
| High | 4 hours | 1 hour |
| Standard | 24 hours | 4 hours |

**Geographic Redundancy**
- Multi-AZ deployment
- Cross-region replication
- Active-passive failover
- Global load balancing
- Data sovereignty options

### Vendor Management

**Third-Party Security**
- Vendor security assessments
- Contractual security requirements
- Annual vendor reviews
- Security questionnaires
- Termination procedures

**Subprocessor List**
Available upon request. Includes:
- Cloud infrastructure providers
- Monitoring services
- Email delivery services
- Payment processors
- Analytics providers

**Vendor Assessment**
- SOC 2 requirement (minimum)
- Security questionnaire
- Penetration test review
- Data handling review
- Contract security clauses

---

## Security Questionnaire Quick Answers

### Common Questions

| Question | Answer |
|----------|--------|
| Do you encrypt data at rest? | Yes, AES-256-GCM |
| Do you encrypt data in transit? | Yes, TLS 1.3 (minimum 1.2) |
| Do you have SOC 2? | Yes, Type II |
| Do you support SSO? | Yes, SAML 2.0 + OIDC |
| Do you have MFA? | Yes, TOTP, SMS, Email, Passkeys, Hardware Keys |
| Where is data stored? | US-East, US-West, EU-West (customer choice) |
| Do you have a DPA? | Yes, GDPR-compliant DPA available |
| Do you have a BAA? | Yes, HIPAA BAA available |
| Penetration testing? | Annual, by third-party, reports available under NDA |
| Bug bounty program? | Yes, via HackerOne |
| Do you support IP allowlisting? | Yes, at tenant and API key level |
| Can we bring our own encryption keys? | Yes, enterprise tier (BYOK) |
| Do you log admin access? | Yes, all admin actions logged with attribution |
| How long are logs retained? | 90 days online, 7 years archived |
| Do you have a security team? | Yes, dedicated security engineering team |
| What's your vulnerability disclosure process? | security@rottay.com, 90-day disclosure |

---

## Contact

**Security Team**
- Email: security@rottay.com
- Response time: 24 hours (business days)

**Vulnerability Disclosure**
- Email: security@rottay.com
- PGP key available on request
- Bug bounty: https://hackerone.com/rottay

**Compliance Inquiries**
- Email: compliance@rottay.com
- DPA/BAA requests
- Audit evidence requests
- Subprocessor inquiries

**Enterprise Security Reviews**
- Contact your account executive
- Security architecture review available
- Custom security requirements discussion
- On-site security briefings (upon request)

---

*Last Updated: January 2026*
*Version: 1.0*
