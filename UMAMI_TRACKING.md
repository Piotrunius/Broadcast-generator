# Umami Event Tracking Documentation

This document describes all Umami analytics events implemented across the Broadcast Generator application.

## Overview

The application uses Umami analytics to track user interactions across all pages. All tracking is centralized through the `umami-tracker.js` utility module located at `/src/scripts/utils/umami-tracker.js`.

## Utility Functions

### `trackEvent(eventName, eventData)`
Main function to track custom events.

### `trackNavigation(targetPage, sourcePage)`
Tracks page navigation between sections.

### `trackToggle(toggleName, newState)`
Tracks toggle state changes (e.g., audio, performance mode).

### `trackAndNavigate(targetUrl, targetPage, sourcePage)`
Tracks navigation and navigates after ensuring tracking completes.

## Tracked Events by Page

### Home Page (`pages/home/index.html`)

| Event Name | Trigger | Data Tracked |
|------------|---------|--------------|
| `Resources_Toggle` | Resources panel toggle button clicked | `expanded`: boolean |
| `Page_Navigation` | Broadcast Generator button clicked | `target`: 'broadcast_simple', `source`: 'home' |
| `Page_Navigation` | SCP-914 button clicked | `target`: 'scp914', `source`: 'home' |
| `Page_Navigation` | Credits button clicked | `target`: 'credits', `source`: 'home' |
| `External_Link_Clicked` | External link clicked | `link`: link text |

### Simple Broadcast Page (`pages/broadcast/simple/index.html`)

| Event Name | Trigger | Data Tracked |
|------------|---------|--------------|
| `Menu_Opened` | Menu button clicked | `menu`: menu id (alarm, status, events, testing) |
| `Menu_Option_Selected` | Menu option selected | `menu`: menu id, `option`: selected value |
| `Generate_Button_Clicked` | Generate button clicked | `hasAlarm`, `hasStatus`, `hasTesting`, `characterCount` |
| `Copy_Button_Clicked` | Copy button clicked (success) | `characterCount`, `method` (if fallback) |
| `Clear_Button_Clicked` | Clear button clicked | `page`: 'broadcast_simple' |
| `Mode_Switch_Clicked` | Mode switch to advanced | `from`: 'simple', `to`: 'advanced' |
| `Page_Navigation` | Mode switch to advanced | `target`: 'broadcast_advanced', `source`: 'broadcast_simple' |
| `Checkbox_Toggled` | Any checkbox toggled | `checkbox`: name, `checked`: boolean |
| `Back_Button_Clicked` | Back button clicked | `from`: 'broadcast_simple' |
| `Page_Navigation` | Back button clicked | `target`: 'home', `source`: 'broadcast_simple' |

**Checkboxes tracked:**
- SCP035
- SCP008
- SCP409
- SCP701
- CON-X
- ID

### Advanced Broadcast Page (`pages/broadcast/advanced/index.html`)

| Event Name | Trigger | Data Tracked |
|------------|---------|--------------|
| `Menu_Opened_Advanced` | Menu button clicked | `menu`: panel id |
| `Menu_Option_Selected_Advanced` | Menu option selected | `menu`: panel id, `option`: selected value |
| `Checkbox_Toggled_Advanced` | Any checkbox toggled | `menu`: panel id, `checkbox`: label, `checked`: boolean |
| `Copy_Button_Clicked_Advanced` | Copy button clicked (success) | `characterCount` |
| `Clear_Button_Clicked_Advanced` | Clear button clicked | `page`: 'broadcast_advanced' |
| `Mode_Switch_Clicked` | Mode switch to simple | `from`: 'advanced', `to`: 'simple' |
| `Page_Navigation` | Mode switch to simple | `target`: 'broadcast_simple', `source`: 'broadcast_advanced' |

**Menus tracked:**
- alarmContent (Threat Level)
- statusContent (Status)
- testingContent (Testing)
- breachedScpsContent (Breached SCPs)
- requirementsContent (Requirements)
- eventsContent (Events)

### SCP-914 Page (`pages/scp-914/index.html`)

| Event Name | Trigger | Data Tracked |
|------------|---------|--------------|
| `Calculate_Recipes_Clicked` | Calculate button clicked | `hasInput`, `hasOutput`, `success` |
| `Clear_Button_Clicked` | Clear button clicked | `page`: 'scp914' |
| `Back_Button_Clicked` | Back button clicked | `from`: 'scp914' |
| `Page_Navigation` | Back button clicked | `target`: 'home', `source`: 'scp914' |

### Credits Page (`pages/home/credits.html`)

| Event Name | Trigger | Data Tracked |
|------------|---------|--------------|
| `Back_Button_Clicked` | Back button clicked | `from`: 'credits' |
| `Page_Navigation` | Back button clicked | `target`: 'home', `source`: 'credits' |

### Global Toggle Components

These toggles are available on all pages:

| Event Name | Trigger | Data Tracked |
|------------|---------|--------------|
| `Audio_Toggle` | Audio toggle button clicked | `state`: 'on' or 'off' |
| `Performance_Toggle` | Performance mode toggle clicked | `state`: 'on' or 'off' |

## Event Naming Convention

All events follow the pattern: `[Element]_[Action]` or `[Element]_[Action]_[Context]`

Examples:
- `Menu_Opened` - Clear action on an element
- `Copy_Button_Clicked_Advanced` - Action with context
- `Checkbox_Toggled` - State change action

## Implementation Details

### Code Comments

All tracking calls in the codebase are marked with comments:
```javascript
// Umami tracking: Track [description]
trackEvent('Event_Name', { data });
```

### Error Handling

The utility module includes error handling to prevent tracking failures from affecting the user experience. If Umami is not loaded, warnings are logged to the console.

### Tracking Scope

- **User Actions**: Button clicks, menu selections, checkbox toggles
- **Navigation**: Page transitions, back navigation
- **Content Generation**: Broadcast generation with metadata
- **User Preferences**: Audio and performance mode toggles
- **Easter Eggs**: Hidden feature discoveries (6 total Easter eggs tracked)
- **Errors**: Failed operations (implicit through success tracking)

### Easter Egg Events

Special hidden features are tracked when discovered:

| Event Name | Trigger | Data Tracked |
|------------|---------|--------------|
| `Easter_Egg_Activated` | Konami code entered (↑↑↓↓←→←→BA) | `type`: 'konami_code', `page` |
| `Easter_Egg_Activated` | Copy same text 5 times | `type`: 'clipboard_anomaly', `page` |
| `Easter_Egg_Activated` | Page loaded at 00:00 or 03:33 | `type`: 'clock_anomaly', `time`, `page` |
| `Easter_Egg_Activated` | Click title 13 times | `type`: 'flickering', `clicks`, `page` |
| `Easter_Egg_Activated` | Threat pattern: High→Low→Medium→High→Low | `type`: 'pattern', `sequence`, `page` |
| `Easter_Egg_Activated` | Press Shift or Ctrl, then type "SCP" | `type`: 'silence', `trigger`, `page` |

## Testing

To test tracking:
1. Open browser developer console
2. Navigate to any page
3. Interact with elements
4. Check console for `[Umami] Tracked event:` messages
5. Verify events in Umami dashboard

### Testing Easter Eggs
- **Konami Code**: Press ↑↑↓↓←→←→BA on keyboard
- **Clipboard Anomaly**: Copy broadcast 5 times without changing it
- **Clock Anomaly**: Load page at exactly 00:00 or 03:33
- **Flickering**: Click "Broadcast Terminal" title 13 times
- **Pattern**: Select threat levels in sequence: High→Low→Medium→High→Low
- **Silence**: Hold Shift or Ctrl, then type "SCP"

## Future Enhancements

Potential additional tracking:
- Error messages shown to users
- Form validation failures
- Search interactions in SCP-914
- Time spent on pages
- User engagement metrics
