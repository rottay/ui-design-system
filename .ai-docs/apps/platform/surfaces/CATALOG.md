# Platform Surface Catalog

> All surface files in `app-platform/src/surfaces/`. Each module uses DS Surface architecture
> (ListSurface, DetailSurface, DashboardSurface) imported from `@rottay/design-system`.

## Surface Modules

### admin/ (4 files)
| File | DS Components Used |
|------|-------------------|
| `ai-pricing-overview.tsx` | DashboardSurface, StatDef, Card, Flex, Text |
| `ai-pricing-config.tsx` | Card, Form, Input, Select, Button, Stack |
| `ai-pricing-packages.tsx` | ListSurface, Card, Table, Tag, Button |
| `ai-pricing-rates.tsx` | Card, Table, Form, Input, Button |

### admin-units/ (2 files)
| File | DS Components Used |
|------|-------------------|
| `list.tsx` | ListSurface, Card, Table, Tag, Button |
| `detail.tsx` | DetailSurface, Card, Flex, Text, Stack |

### companies/ (5 files + 1 impl)
| File | DS Components Used |
|------|-------------------|
| `list.tsx` | ListSurface, Card, Table, Tag, Button, Modal, Input |
| `list-config.tsx` | createListSurfaceConfig |
| `create.tsx` | Card, Typography, Space, Button, Form, Input, Select, Switch, Alert, Spinner, Grid, GridItem, Box, Flex |
| `edit.tsx` | (delegates to _company-edit-impl) |
| `_company-edit-impl.tsx` | Card, Typography, Space, Button, Form, Input, Select, Switch, Tabs, Upload, Alert, Divider, Avatar, Grid, GridItem, Box |
| `detail.tsx` | Card, Box, Flex, Stack, Text, Button, Table, Tag, Spinner, Popconfirm, message, Avatar, Empty, Divider, Grid, GridItem |

### compliance/ (10 files)
| File | DS Components Used |
|------|-------------------|
| `overview.tsx` | DashboardSurface, Card, Flex, Text, Stack, StatDef |
| `audit-list.tsx` | ListSurface |
| `audit-list-config.tsx` | createListSurfaceConfig |
| `audit-detail.tsx` | DetailSurface, Card, Flex, Text, Stack, Tag |
| `consent-list.tsx` | ListSurface |
| `consent-list-config.tsx` | createListSurfaceConfig |
| `gdpr-list.tsx` | ListSurface |
| `gdpr-list-config.tsx` | createListSurfaceConfig |
| `kyc-aml-list.tsx` | ListSurface |
| `kyc-aml-list-config.tsx` | createListSurfaceConfig |
| `breaches.tsx` | Card, Flex, Text, Stack, Table, Tag, Button |
| `retention.tsx` | Card, Flex, Text, Stack, Table |
| `my-data.tsx` | Card, Flex, Text, Stack, Button |

### dashboard/ (2 files + 1 config)
| File | DS Components Used |
|------|-------------------|
| `screen.tsx` | DashboardSurface, PatternStatsGrid, StatDef, SurfaceAction |
| `config.ts` | (configuration only) |

### feature-analytics/ (1 file)
| File | DS Components Used |
|------|-------------------|
| `overview.tsx` | DashboardSurface, Card, Flex, Text |

### feature-flags/ (6 files)
| File | DS Components Used |
|------|-------------------|
| `list.tsx` | ListSurface |
| `create.tsx` | Card, Form, Input, Select, Switch, Button |
| `detail.tsx` | DetailSurface, Card, Flex, Text, Tag |
| `edit.tsx` | Card, Form, Input, Select, Switch, Button |
| `rules.tsx` | Card, Table, Form, Button, Tag |
| `usage.tsx` | Card, Flex, Text, Table |

### impersonation/ (2 files)
| File | DS Components Used |
|------|-------------------|
| `overview.tsx` | Card, Flex, Text, Stack, Button, Table |
| `impersonating.tsx` | Card, Box, Flex, Stack, Text, Button, Alert, Avatar, Tag, Divider, Grid, GridItem |

### legal/ (2 files)
| File | DS Components Used |
|------|-------------------|
| `terms.tsx` | Box, Text, Heading, Stack |
| `privacy.tsx` | Box, Text, Heading, Stack |

### navigation/ (12 files)
| File | DS Components Used |
|------|-------------------|
| `overview.tsx` | DashboardSurface, Card, Flex, Text |
| `menus-list.tsx` | ListSurface |
| `menu-detail.tsx` | DetailSurface |
| `menu-edit.tsx` | Card, Form, Input, Button |
| `menu-create.tsx` | Card, Form, Input, Button |
| `routes-list.tsx` | ListSurface |
| `route-detail.tsx` | DetailSurface |
| `route-edit.tsx` | Card, Form, Input, Button |
| `route-create.tsx` | Card, Form, Input, Button |
| `policies-list.tsx` | ListSurface |
| `policy-detail.tsx` | DetailSurface |
| `policy-edit.tsx` | Card, Form, Input, Button |
| `policy-create.tsx` | Card, Form, Input, Button |

### notifications/ (12 files)
| File | DS Components Used |
|------|-------------------|
| `overview.tsx` | DashboardSurface, Card, Flex, Text, Stack |
| `inbox.tsx` | Card, Flex, Text, Stack, Button, Badge |
| `send.tsx` | Card, Form, Input, Select, Button, Textarea |
| `analytics.tsx` | Card, Flex, Text, Table |
| `webhooks.tsx` | Card, Table, Button, Tag |
| `providers.tsx` | Box, Flex, Text, Stack, Grid, Card, Badge, Button, Modal, Input |
| `templates-list.tsx` | ListSurface |
| `templates-list-config.tsx` | createListSurfaceConfig |
| `templates-detail.tsx` | DetailSurface |
| `templates-edit.tsx` | Card, Form, Input, Button |
| `templates-create.tsx` | Card, Form, Input, Button |

### payments/ (2 files)
| File | DS Components Used |
|------|-------------------|
| `overview.tsx` | DashboardSurface, Card, Flex, Text, Table |
| `refunds.tsx` | Card, Table, Button, Tag |

### permissions/ (6 files)
| File | DS Components Used |
|------|-------------------|
| `list.tsx` | ListSurface |
| `list-config.tsx` | createListSurfaceConfig |
| `create.tsx` | Card, Form, Input, Select, Button |
| `detail.tsx` | DetailSurface, Card, Flex, Text |
| `edit.tsx` | Card, Form, Input, Select, Button |
| `policies.tsx` | Card, Table, Button, Tag |

### profile/ (12 files)
| File | DS Components Used |
|------|-------------------|
| `view.tsx` | Card, Flex, Text, Stack, Avatar, Button |
| `edit.tsx` | Card, Form, Input, Button, Avatar |
| `sessions.tsx` | Card, Table, Button, Tag |
| `security.tsx` | Card, Flex, Text, Stack, Button |
| `security-password.tsx` | Card, Form, Input, Button |
| `security-mfa.tsx` | Card, Flex, Text, Button |
| `security-passkeys.tsx` | Card, Table, Button |
| `security-devices.tsx` | Card, Table, Button, Tag |
| `security-sessions.tsx` | Card, Table, Button |
| `security-activity.tsx` | Card, Table, Tag |
| `privacy-export.tsx` | Card, Flex, Text, Button |
| `privacy-delete.tsx` | Card, Flex, Text, Button, Alert |

### roles/ (6 files)
| File | DS Components Used |
|------|-------------------|
| `list.tsx` | ListSurface |
| `list-config.tsx` | createListSurfaceConfig |
| `create.tsx` | Card, Form, Input, Button |
| `detail.tsx` | DetailSurface, Card, Flex, Text, Table |
| `edit.tsx` | Card, Form, Input, Button |
| `analytics.tsx` | DashboardSurface, Card, Flex, Text |

### security/ (10 files)
| File | DS Components Used |
|------|-------------------|
| `overview.tsx` | DashboardSurface, Card, Flex, Text |
| `auth-methods.tsx` | Card, Flex, Text, Stack, Switch |
| `tokens.tsx` | Card, Table, Button, Tag |
| `mfa.tsx` | Card, Flex, Text, Button, Stack |
| `sso.tsx` | Card, Table, Button, Tag |
| `sso-detail.tsx` | DetailSurface, Card, Flex, Text |
| `sso-create.tsx` | Card, Form, Input, Select, Button |
| `oauth-providers.tsx` | Card, Table, Button, Tag |
| `oauth-create.tsx` | Card, Form, Input, Select, Button |
| `jwt.tsx` | Card, Flex, Text, Code, Button |
| `risk.tsx` | Card, Flex, Text, Table |

### service-accounts/ (3 files)
| File | DS Components Used |
|------|-------------------|
| `list.tsx` | ListSurface, Card, Table |
| `create.tsx` | Card, Form, Input, Button |
| `detail.tsx` | DetailSurface, Card, Flex, Text |

### sessions/ (1 file)
| File | DS Components Used |
|------|-------------------|
| `overview.tsx` | Card, Table, Button, Tag |

### settings/ (13 files)
| File | DS Components Used |
|------|-------------------|
| `overview.tsx` | Card, Flex, Text, Stack, Grid |
| `account.tsx` | Card, Form, Input, Button |
| `mfa.tsx` | Card, Flex, Text, Button |
| `passkeys.tsx` | Card, Table, Button |
| `api-keys.tsx` | Card, Table, Button, Tag |
| `webhooks.tsx` | Card, Table, Button, Form, Input |
| `notifications.tsx` | Card, Form, Switch, Button |
| `billing.tsx` | Card, Flex, Text, Button, Table |
| `privacy.tsx` | Card, Flex, Text, Switch |
| `attributes.tsx` | Card, Table, Form, Button |
| `whitelabel.tsx` | Card, Form, Input, ColorPicker, Button |
| `data-export.tsx` | Card, Flex, Text, Button |
| `scim.tsx` | Card, Flex, Text, Form, Input, Button |

### tenants/ (10 files)
| File | DS Components Used |
|------|-------------------|
| `list.tsx` | ListSurface |
| `list-config.tsx` | createListSurfaceConfig |
| `create.tsx` | Card, Form, Input, Select, Button |
| `detail.tsx` | DetailSurface, Card, Flex, Text, Table, Tabs |
| `detail-config.ts` | (configuration only) |
| `edit.tsx` | Card, Form, Input, Select, Button |
| `users.tsx` | Card, Table, Button |
| `companies.tsx` | Card, Table, Button |
| `features.tsx` | Card, Table, Switch, Button |
| `branding.tsx` | Card, Form, Input, ColorPicker, Button |
| `settings.tsx` | Card, Form, Input, Switch, Button |

### users/ (12 files)
| File | DS Components Used |
|------|-------------------|
| `list.tsx` | ListSurface |
| `list-config.tsx` | createListSurfaceConfig |
| `create.tsx` | Card, Form, Input, Select, Button |
| `detail.tsx` | DetailSurface, Card, Flex, Text, Table, Tabs, Avatar |
| `detail-config.ts` | (configuration only) |
| `edit.tsx` | Card, Form, Input, Select, Button |
| `guests.tsx` | Card, Table, Button, Tag |
| `duplicates.tsx` | Card, Table, Button |
| `groups-list.tsx` | ListSurface |
| `groups-detail.tsx` | DetailSurface |
| `groups-create.tsx` | Card, Form, Input, Button |
| `groups-edit.tsx` | Card, Form, Input, Button |

### web3/ (6 files)
| File | DS Components Used |
|------|-------------------|
| `tokens.tsx` | Card, Table, Button, Tag |
| `wallets.tsx` | Card, Table, Button |
| `nfts.tsx` | Card, Grid, Flex, Text, Button |
| `staking.tsx` | Card, Table, Flex, Text |
| `transactions.tsx` | Card, Table, Button, Tag |
| `analytics.tsx` | DashboardSurface, Card, Flex, Text |

### _shared/ (3 files)
| File | Purpose |
|------|---------|
| `permissions.ts` | useSurfacePermissions() - bridges RootProvider to Surface configs |
| `focus-mode.ts` | useSurfaceFocusMode() - FocusMode to Surface compact mode |
| `adapters/` | 11 EntityAdapter files (see ADAPTERS.md) |

---

## Summary

| Module | Surface Files | Index Files | Config Files | Total |
|--------|--------------|-------------|-------------|-------|
| admin | 4 | 1 | 0 | 5 |
| admin-units | 2 | 1 | 0 | 3 |
| companies | 5 (+1 impl) | 1 | 1 | 8 |
| compliance | 10 | 1 | 0 | 11 |
| dashboard | 1 | 1 | 1 | 3 |
| feature-analytics | 1 | 1 | 0 | 2 |
| feature-flags | 6 | 1 | 0 | 7 |
| impersonation | 2 | 1 | 0 | 3 |
| legal | 2 | 1 | 0 | 3 |
| navigation | 12 | 1 | 0 | 13 |
| notifications | 11 | 1 | 1 | 13 |
| payments | 2 | 1 | 0 | 3 |
| permissions | 6 | 1 | 1 | 8 |
| profile | 12 | 1 | 0 | 13 |
| roles | 6 | 1 | 1 | 8 |
| security | 10 | 1 | 0 | 11 |
| service-accounts | 3 | 1 | 0 | 4 |
| sessions | 1 | 1 | 0 | 2 |
| settings | 13 | 1 | 0 | 14 |
| tenants | 10 | 1 | 1 | 12 |
| users | 12 | 1 | 2 | 15 |
| web3 | 6 | 1 | 0 | 7 |
| _shared | 3 | 1 | 0 | 4 (+11 adapters) |
| **TOTAL** | **~140** | **23** | **8** | **~175** |
