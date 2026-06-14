# Component Map

Prototype symbol → production component name → SF Symbol (mobile) / icon, plus a11y label source.
Tokens for all of these live in `../design-system/TOKENS.md`; states in `../design-system/COMPONENTS.md`.

## Symbols (prototype `kl-kit.jsx`)
| Prototype | Production (RN/web) | Notes |
| --- | --- | --- |
| `KL` (tokens object) | `tokens` | Convert to typed module + CSS vars |
| `KLIcon` | `Icon` | Map names → SF Symbols (table below) |
| `KLAvatar` | `Avatar` | initials + deterministic color; `ring` prop |
| `KLStatus` | `StatusBadge` | enum-driven; icon+text |
| `KLBtn` | `Button` | variants: primary/secondary/neutral/ghost/danger/dark/outline |
| `KLApplePayBtn` / `KLApplePaySheet` | `ApplePayButton` / native PassKit sheet | replace with real Apple Pay |
| `KLCard` | `Card` | |
| `KLSectionLabel` | `SectionLabel` | |
| `KLMeta` | `MetaRow` | |
| `KLRow` | `ListRow` | |
| `KLHeader` | `AppHeader` | large + inline variants |
| `KLTabBar` | `TabBar` | |
| `KLSheet` | `BottomSheet` | |
| `KLToast` | `Toast` | |
| `KLSpinner` | `Spinner` | |
| `KLField` | `FormField` | |
| `KLSegment` | `SegmentedControl` | |
| `KLToggle` | `Toggle` | |
| `KLFooter` | `FooterCTA` | |
| `KLFlow` | `FlowScreen` | fixed column + scroll body + pinned footer |
| `KLCapacity` | `CapacityBar` | |
| `KLGameCard` | `GameCard` | |
| `KLDateChip` | `DateChip` | |
| `KLCountdownPill` | `Countdown` | |
| `KLEmpty` | `EmptyState` | |
| `KLPayMethod` | `PaymentMethodRow` | |
| `KLPriceLine` | `PriceLine` | |
| `KLAppIcon` / `KLWordmark` | `AppIcon` / `Wordmark` | brand |

## To build (specified, not yet in prototype)
`WorkspaceSwitcher`, `OrganizationSwitcher`, `AlertBanner`, `ConfirmationSheet`,
`RegistrationStatusBlock`, `PaymentStatusBlock`, `UrgentActionCard` (extract from ScreenHome),
`SelectField`, `DateTimeField`, `SearchField`, `FilterChip`, `CapacityControl`, `PermissionCheckbox`,
`SkeletonLoader`, `ErrorState`, `FilteredEmptyState`, `OfflineBanner`, and web: `DataTable`,
`Pagination`, `SidebarNav`, `StatCard`, `FilterBar`, `AuditLogRow`.

## Icon → SF Symbol map (`KLIcon` name → SF Symbol)
| KLIcon | SF Symbol | a11y label |
| --- | --- | --- |
| home | house(.fill) | Home |
| ball | soccerball | Games |
| org | person.3(.fill) | Organizations |
| bell | bell(.fill) | Notifications |
| person | person.crop.circle | Profile |
| chevR / chevL / chevDown | chevron.right/left/down | (decorative) |
| calendar | calendar | Date |
| clock | clock | Time / deadline |
| pin | mappin.and.ellipse | Venue |
| check / checkCircle | checkmark(.circle) | Confirmed |
| plus | plus | Add |
| share | square.and.arrow.up | Share |
| ellipsis | ellipsis | More |
| wallet / card | wallet.pass / creditcard | Payment |
| lock | lock(.fill) | Private / secure |
| shield | checkmark.shield | Policy / reliability |
| info | info.circle | Info |
| warn | exclamationmark.triangle | Warning |
| map | map | Directions |
| person2 | person.2 | Players / guest |
| arrowSwap | arrow.left.arrow.right | Transfer / waitlist move |
| refresh | arrow.clockwise | Reload |
| flag | flag | Report / cancel |
| whatsapp | (brand asset) | WhatsApp |
| qr | qrcode | Check-in code |
| copy | doc.on.doc | Copy |
| gear | gearshape | Settings |
| receipt | receipt / doc.text | Receipt |

> WhatsApp is a third-party brand mark — use their brand asset/guidelines, not a hand-drawn icon.
