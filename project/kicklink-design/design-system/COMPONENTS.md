# Component Inventory

Every reusable component, its props, states, and the prototype symbol it maps to (`kl-kit.jsx`,
`kl-screens-*.jsx`). Production names are the suggested RN/React component names. Full SF-Symbol and
route mapping in `../handoff/COMPONENT_MAP.md`.

## Conventions
- Status is always **icon + text**, colour reinforces.
- Primary action = filled violet; secondary = violet tint; neutral = gray fill; destructive = red
  tint (full red only for the final destructive confirm); disabled = gray fill + tertiary text.
- One primary action per screen; secondaries never share its visual weight.

## Layout & navigation
| Component | Proto symbol | Key props | States |
| --- | --- | --- | --- |
| AppHeader | `KLHeader` | `title, large?, onBack?, trailing?, subtitle?` | large-title / inline / with-back / transparent |
| TabBar | `KLTabBar` | `active, onTab, badges` | per-tab active/inactive, badge count |
| WorkspaceSwitcher | *(spec)* | `mode: player\|organizer, orgs, activeOrg, onSwitch` | player / organizer (tinted), org picker open |
| OrganizationSwitcher | *(spec)* | `orgs, activeOrg, onSelect` | single-org (no switch) / multi |
| FooterCTA | `KLFooter` | `note?, children` | 1 primary / primary+link / disabled |
| FlowScreen | `KLFlow` | fixed column, scroll middle + pinned footer | — |
| BottomSheet | `KLSheet` | `title?, onClose` | present / dismiss; drag handle |
| ConfirmationSheet | *(spec, uses KLSheet)* | `title, body, confirmLabel, tone` | default / destructive (reason field) |
| Toast/Banner | `KLToast` | `tone: dark\|green\|violet` | success / info |
| AlertBanner | *(spec)* | `tone, title, body, action?` | info / warning / error / offline |

## Content & lists
| Component | Proto symbol | Props | States |
| --- | --- | --- | --- |
| ListRow | `KLRow` | `icon?, iconBg?, title, sub?, detail?, right?, onClick?, danger?, chevron?` | default / pressable / danger / with-toggle / last |
| SectionLabel | `KLSectionLabel` | `children, action?, onAction?` | with/without action |
| Card | `KLCard` | `pad, onClick?, style` | static / pressable / accent-bordered |
| GameCard | `KLGameCard` | `game, store, nav, statusOverride?` | open (spots left) / full / your-registration / past |
| DateChip | `KLDateChip` | `game, tone?` | — |
| MetaRow | `KLMeta` | `icon, label, value, color?` | — |
| CapacityBar | `KLCapacity` | `filled, capacity, accent` | open / almost-full / full |
| AnnouncementCard | *(in screens)* | `author, time, title, body` | read / unread |
| NotificationRow | *(in ScreenNotifs)* | `kind, title, body, time, unread` | read / unread, 5 kinds |
| PlayerRow | *(in ScreenParticipants)* | `name, status/position, isYou?` | confirmed / waitlisted(#n) / you |
| WaitlistRow | *(in ScreenParticipants)* | `name, position` | ordered |
| PaymentRow / ReceiptRow | *(in ScreenReceipts)* | `title, method, date, amount, status` | paid / refunded |
| AuditLogRow | *(web)* | `actor, action, target, reason?, time` | financial / admin / safety |

## Status & actions
| Component | Proto symbol | Props | States |
| --- | --- | --- | --- |
| StatusBadge | `KLStatus` | `status, label?, small?, icon?` | all enums in STATUS_MODEL |
| RegistrationStatusBlock | *(spec)* | `regStatus, payStatus, deadline?` | confirmed+paid / provisional+due / waitlisted / offered / transfer-pending / cancelled+refunded |
| PaymentStatusBlock | *(spec)* | `payStatus, amount, method?` | every payment enum |
| UrgentActionCard | *(in ScreenHome)* | `kind, title, sub, cta, countdown?` | payment-due / spot-offer / reschedule / info-requested / refund |
| Button | `KLBtn` | `variant, size, full?, icon?, disabled?` | primary / secondary / neutral / ghost / danger / dark / outline · pressed · disabled |
| ApplePayButton | `KLApplePayBtn` | `onClick` | — |
| ApplePaySheet | `KLApplePaySheet` | `total, game, onCancel, onDone` | confirm → auth(Face ID) → done |
| Countdown | `KLCountdownPill` | `seconds, big?` | normal / < 60s (red) / expired |

## Forms & inputs
| Component | Proto symbol | Props | States |
| --- | --- | --- | --- |
| FormField | `KLField` | `label, value, placeholder, icon?` | empty / filled / focus / error / disabled |
| SelectField | *(spec)* | `label, value, options` | closed / open / error |
| DateTimeField | *(spec)* | `label, value, mode: date\|time\|datetime` | iOS wheel/inline picker |
| SegmentedControl | `KLSegment` | `options, value, onChange` | 2–3 options |
| Toggle | `KLToggle` | `on, onToggle` | on / off / locked (always-on) |
| SearchField | *(spec)* | `value, placeholder, onClear` | empty / typing / results / no-results |
| FilterChip | *(spec)* | `label, active, count?` | default / active / with-count |
| CapacityControl | *(spec, event creation)* | `value, min, max, waitlist?` | stepper + waitlist toggle |
| PermissionCheckbox | *(spec, staff)* | `permission, checked, onToggle, locked?` | checked / unchecked / locked (owner) |

## Web-only
| Component | Props | States |
| --- | --- | --- |
| DataTable | `columns, rows, sort, onSort, selectable?, bulkActions?` | loading (skeleton rows) / empty / filtered-empty / populated / row-selected |
| Pagination | `page, pageCount, onPage` | first / middle / last / single-page |
| SidebarNav | `sections, active` | expanded / collapsed (drawer) |
| StatCard | `label, value, delta?` | neutral (ops-first, not decorative) |
| FilterBar | `filters, onChange, onClear` | default / active filters |

## Empty / loading / error
| Component | Proto symbol | Props |
| --- | --- | --- |
| EmptyState | `KLEmpty` | `icon, title, body, cta?, onCta?` |
| FilteredEmptyState | *(spec)* | `clearFilters` |
| SkeletonLoader | *(spec)* | `variant: list\|card\|table\|detail` |
| ErrorState | *(spec)* | `title, body, retry` |
| OfflineBanner | *(spec)* | persistent while offline; disables mutations |
| Spinner | `KLSpinner` | `size, color` |

Document each component's states in Storybook (web) / a component gallery screen (mobile) at build time.
