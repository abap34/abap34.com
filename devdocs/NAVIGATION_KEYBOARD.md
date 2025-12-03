# Keyboard Navigation System

abap34.com presents a TUI-inspired keyboard UX throughout the site. This document captures the latest contract so future contributors can extend it without re-learning every edge case.

## Goals

- **Single mental model:** One state machine (`FocusContext`) coordinates sidebar links, top-page sections, stand-alone pages, and modal lock states.
- **Helix-style keymap:** `hjkl` mirrors arrow keys for spatial navigation, with `Enter` to activate and `Escape` to step out.
- **Predictable accessibility hooks:** Every focusable element opts in via `data-focus-id` and can request self-activation with `data-focus-activate="self"`.
- **Visual parity:** Focused elements invert their palette (accent background + body foreground) using the shared `.keyboard-focused` class.

## Focus State Machine

`FocusContext` exposes the active focus and orchestrates transitions.

| Field | Description |
| --- | --- |
| `region` | `'sidebar' \| 'top'`. Sidebar handles nav links; top handles in-page content. |
| `sidebarIndex` | Which sidebar entry is active (0-3 for `/`, `/background`, `/works`, `/blog`). |
| `sectionIndex` | Enum defined in `SECTION_INDEX`. Mirrors Introduction, Recent Posts, Background, Works. |
| `mode` | `'section'` (section cards) or `'items'` (individual rows/cards). Stand-alone pages always use `'items'`. |
| `itemIndex` | Zero-based index within the current section/page. |
| `navigationLocked` | When `true`, key handlers early-return (used while Works modal is open). |
| `worksColumns` | Responsive column count for Works grids (TopPage simple layout uses 1/2 cols, `/works` uses up to 3). |

Additional helpers:

- `STANDALONE_SECTION_MAP`: `/background`, `/works`, `/blog`, `/search` map to a section index so they can reuse the same item navigation as TopPage.
- `lockNavigation()` / `unlockNavigation()`: Suspend input during modal display.
- `activateTopFromSidebar()`: When on `/` and About is re-activated via sidebar, this drops the user into the Introduction section.
- `focusStandaloneSection(section)` (internal): When the user presses `Enter` on the sidebar while already on `/background` etc., focus jumps directly into the page's first item.

### Key Map

| Key | Sidebar | TopPage (section mode) | TopPage / Stand-alone (items mode) | Global |
| --- | --- | --- | --- | --- |
| `j`, `ArrowDown`, `l`, `ArrowRight` | Next sidebar link | Next section | Next item (works grid uses row/col math) | – |
| `k`, `ArrowUp`, `h`, `ArrowLeft` | Previous sidebar link | Previous section | Previous item (works grid uses row/col math) | – |
| `Enter` | Trigger link (and re-enter current page if already active) | Enter item mode if section has items | Activate focused element (`data-focus-activate` target) | Opens Works modal when focused |
| `Escape` | – | Back to sidebar | - Introduction section → sidebar<br/>- Other sections → section mode<br/>- Stand-alone pages → sidebar | Closes Works modal (global listener) |

## Focusable Elements

1. **Attribute opt-in**
   ```jsx
   <column
     data-focus-id="top-item-works-0"
     data-focus-activate="self"
     className={isFocused ? 'keyboard-focused' : ''}
   >
   ```
   - `data-focus-id` must be unique on the page.
   - `data-focus-activate="self"` tells `activateFocusedElement` to click the element itself. Without it, the first descendant link/button is used.
2. **Dynamic list sizes** register through the context:
   - `setRecentItemCount(totalPosts (+ view-all link?))`
   - `setBackgroundItemCount(education + careers + others)`
   - `setWorksItemCount(works list length [+ CTA])`
3. **Hooks**
   - `useFocusContext()` returns `activeFocusId` and the setters.
   - `useIsFocused(focusId)` is available for syntactic sugar.

## Visual Treatment

`src/index.css` defines the canonical focus look:

```css
:root {
  --focus-ring-color: var(--accent0);
  --focus-bg-color: var(--accent0);
  --focus-fg-color: var(--background0);
  --focus-translate-distance: 2px;
}

.keyboard-focused {
  outline: 2px solid var(--focus-ring-color);
  background-color: var(--focus-bg-color);
  color: var(--focus-fg-color);
  transform: translateY(calc(var(--focus-translate-distance) * -1));
}
```

Component styles override spacing (e.g., `.works-card` adds padding/border-radius) but **should not** reintroduce drop shadows. The goal is a simple palette inversion that still reads in dark and light themes.

## Page Behaviors

### Sidebar

- Initial focus is `sidebar-0` (About).
- `Enter` navigates via React Router link click.
- If the destination matches `location.pathname`, the sidebar won't remount. Instead we manually call `focusStandaloneSection` so `/background`, `/works`, `/blog` regain their first item without a reload.
- When the user hits `Escape` while Introduction items are focused, focus snaps back to `sidebar-0`.

### TopPage

1. **Section order**: Introduction → Recent Posts → Background → Works.
2. **Section mode**: `Enter` dives into items, `Escape` bounces back to sidebar.
3. **Introduction items**: Social links implement `data-focus-activate="self"` so `Enter` opens in a new tab.
4. **RecentPosts**: Items + "View all posts" register counts. `Enter` opens the blog post URL in a new tab (handled inside `BlogPostItem`).
5. **Background (compact)**: When rendered inside TopPage, it contributes education/career/other totals; each row respects the `url` field.
6. **Works (simple mode)**: Up to `defaultVisibleCount` cards + optional CTA. Cards open the modal; CTA navigates to `/works`. Each card registers sequential `top-item-works-{index}` ids.

### Stand-alone Pages

| Path | Section Index | Item Source | Notes |
| --- | --- | --- | --- |
| `/background` | `SECTION_INDEX.BACKGROUND` | Full YAML data | Each entry opens its `url` in a new tab. |
| `/works` | `SECTION_INDEX.WORKS` | Filtered results respecting query/tag params | Responsive grid navigation uses `worksColumns`. |
| `/blog` & `/search` | `SECTION_INDEX.RECENT_POSTS` | `SearchResult` filtered posts | `setRecentItemCount` is set to `searchedPosts.length`. |

When a stand-alone page mounts, `FocusContext`:
1. Sets `region` to `top`.
2. Forces `mode` to `'items'`.
3. Sets `itemIndex` to `0`.
4. Leaves `sectionIndex` on the mapped value so existing arrow logic applies.

`Escape` always returns to the sidebar (highlighting the current nav link).

### Works Modal

- Triggered via `Enter`/click on any Works card.
- Calls `lockNavigation()` on open and `unlockNavigation()` on close/unmount so background focus does not move.
- Global `keydown` listener closes the modal on `Escape`.
- Modal click-outside closes it and unlocks the keyboard navigation.

### Works Grid Navigation

- `worksColumns` is derived from viewport width:
  - TopPage simple list: 1 column under 768px, 2 columns otherwise.
  - `/works`: 1 (≤768px), 2 (>768px and <1024px), 3 (≥1024px).
- `handleWorksMove(deltaRow, deltaCol)` adds `deltaRow * worksColumns` + `deltaCol`, clamped to `[0, itemCount-1]`.

### Background Entries

- Each entry is wrapped in `FocusableEntry`, which:
  - Applies `.keyboard-focused`.
  - Acts as an anchor: clicking or pressing `Enter` opens `url` in a new tab (`window.open` + `noopener`).
  - Adds `role="link"` for better semantics.

### Blog/Search Result Items

- `BlogPostItem` attaches `data-focus-activate="self"` and handles `onClick` to open the post in a new tab.
- Nested `<a>` tags stop propagation so mouse clicks still behave normally.

### Modal + Global Locks

- Any component that needs to pause keyboard nav should call `lockNavigation()` in an effect and `unlockNavigation()` on cleanup.
- This ensures `handleTopKeys` / `handleSidebarKeys` bail out early and no `activeFocusId` jumps occur behind overlays.

## Adding New Focus Targets

1. Decide whether the element belongs to the sidebar or top region.
2. Pick/extend a `SECTION_INDEX` entry if it participates in the hierarchical navigation. Update `STANDALONE_SECTION_MAP` for new stand-alone routes.
3. Register `data-focus-id` and optional `data-focus-activate="self"`.
4. Update the relevant `set*ItemCount` call so arrow keys wrap correctly.
5. Apply `.keyboard-focused` styling or ensure your component inherits it from a parent.
6. If the new feature shows a modal, remember to `lockNavigation` while it is open.

## Testing Checklist

- Tab focus should remain disabled; keyboard UX is entirely custom.
- Smoke test each page:
  1. `/` – move between sections, enter/exit, Works modal open/close with `Enter`/`Escape`.
  2. `/background` – ensure `Enter` opens the documented URL.
  3. `/works` – arrow around the grid on desktop + mobile widths; open/close modal.
  4. `/blog` – confirm posts open in new tabs.
  5. `/search?q=foo` – `setRecentItemCount` equals filtered length for arrow navigation.
- Re-run after altering YAML counts or adding filters to ensure `set*ItemCount` uses the new totals.
