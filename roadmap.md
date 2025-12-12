# Project Roadmap: SCP Broadcast Generator

## Core Features & Modules
- [ ] **[Feature] "Advanced Mode" Toggle**
  - Create a slider/switch allowing users to choose between the current "Simple" view and a new "Advanced" dashboard.
- [x] **[Feature] Breached SCPs Module**
  - Add a selector to list specific breachable SCPs (e.g., enable specific SCPs currently out of containment).
  - Include detailed status updates rather than generic breach messages.
- [x] **[Feature] Contagious Hazard Preset (SCP-008)**
  - Add a dedicated button/message for contagious bio-hazards (e.g., Zombie plague).
- [x] **[Feature] Directives Module**
  - Add preset commands for teams (e.g., "Combatives to CX", "Class-D Riot in progress", "SiD+").
- [x] **[Feature] Facility Status Indicators**
  - **Generators:** Status of generator security.
  - **Nuke:** Status regarding O5 Council meetings/nuclear warhead planning.

## UI/UX & Layout
- [x] **[UI] Layout Refactor: Sidebar Dashboard**
  - Move control panels to the **left side** of the screen (Sidebar) instead of stacking them above the text panel.
  - *Goal:* Prevent the site from stretching vertically and improve aesthetics.
- [ ] **[UX] Custom Message Persistence (Save/Load)**
  - Implement LocalStorage/Cache support to let users edit and save their own custom broadcast templates.
- [x] **[UX] Character Limit Validation**
  - Implement a counter/hard limit for **200 characters** to ensure compatibility with Roblox chat constraints.

## Future Ideas / Expansion
- [ ] **[Expansion] Facility Map Sub-page**
  - Add a searchable/viewable map of the facility on a separate tab or web page.
