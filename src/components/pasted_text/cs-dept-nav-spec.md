Build a complete full-stack indoor navigation web application called:

**“Navigation System for the Department of Computer Science”**

The application is intended for the **University of Zambia (UNZA) Department of Computer Science**.

IMPORTANT: This is an INDOOR navigation system for the Computer Science Department building. The rooms are on the **GROUND FLOOR only**. There are NO upstairs floors and the system must not assume or create stairs, elevators, or multiple floors.

## 1. TECHNOLOGY STACK

Build the project using:

### Frontend

* React
* JavaScript
* Vite
* Tailwind CSS
* Lucide React icons
* Responsive/mobile-first design
* Interactive map/navigation interface

### Backend

* Node.js
* Express.js
* REST API

### Database

* Supabase
* PostgreSQL

The architecture should be clean enough that the application can later be expanded to cover the entire University of Zambia campus.

---

# 2. MAIN PURPOSE

A student, visitor, lecturer, or staff member should be able to:

1. Open the navigation system.
2. See the Computer Science Department ground-floor layout.
3. Search for a room/person/facility.
4. Select a destination.
5. See the location highlighted on the map.
6. Get step-by-step walking directions from the department entrance.
7. See the approximate walking route visually.
8. Easily understand which corridor to follow and where to turn.

The navigation must be based on the actual spatial relationships described below.

---

# 3. DEPARTMENT LAYOUT / NAVIGATION LOGIC

Treat the **main department entrance** as the starting point.

When a person enters the Computer Science Department:

### ENTRANCE

Immediately after entering:

* **Hardware Lab** is on the RIGHT.
* **Students and Visitors Toilet** is STRAIGHT ahead.

The user then reaches the main corridor/intersection.

### FIRST TURN

From the entrance, continue toward the main corridor.

At the **first major turn/intersection**:

* Turn LEFT.
* After turning LEFT, continue down the corridor.
* Then turn RIGHT.

After turning RIGHT, the corridor contains two sides:

### LEFT SIDE AFTER THE SECOND TURN

The following locations are on the LEFT side:

* Head Computer Science Office
* Secretary
* Messenger
* Electrical Services
* Computer Studies Room 2
* Dr E Lampi
* Mr Mofya Phiri
* Computer Studies Room 3
* Mr. A Theu
* Mr. M Phiri
* Computer Studies Room 4
* Mr D. Zulu
* Computer Studies Room 5
* Prof J. Phiri
* Computer Studies Room 6
* Mrs. Monica M. Kabemba
* Staff Gents Only
* Staff Female Only
* Seminar Room

### RIGHT SIDE AFTER THE SECOND TURN

The following are on the RIGHT side:

* Computer Lab 1
* Computer Lab 2
* Computer Lab 3

Make the map visually communicate this left/right arrangement.

Do NOT randomly place rooms. The navigation graph must preserve these relationships.

---

# 4. COMPLETE ROOM DATABASE

Create these locations in Supabase:

1. Head Computer Science
2. Secretary
3. Messenger
4. Electrical Services
5. Computer Lab 1
6. Computer Lab 2
7. Computer Lab 3
8. Computer Studies Room 2
9. Dr E Lampi
10. Mr Mofya Phiri
11. Computer Studies Room 3
12. Mr. A Theu
13. Mr M Phiri
14. Computer Studies Room 4
15. Mr D. Zulu
16. Computer Studies Room 5
17. Prof J. Phiri
18. Computer Studies Room 6
19. Mrs. Monica M. Kabemba
20. Staff Gents Only
21. Staff Female Only
22. Students and Visitors Toilet
23. Seminar Room
24. Hardware Lab

Every location should have fields such as:

* id
* name
* type
* description
* floor
* corridor
* side
* coordinates/node position
* searchable keywords

Set:

floor = "Ground Floor"

Possible types:

* office
* laboratory
* classroom
* toilet
* staff_facility
* utility
* seminar_room
* entrance

---

# 5. NAVIGATION GRAPH

Do NOT make the navigation merely a collection of clickable room cards.

Create an actual navigation graph.

The graph should contain:

* Entrance node
* Corridor nodes
* Intersection nodes
* Turn nodes
* Room destination nodes

Each node should contain:

* id
* name
* x
* y
* type

Create edges between nodes.

Each edge should contain:

* from
* to
* distance
* direction

Use a pathfinding algorithm such as **Dijkstra's algorithm or A*** to calculate routes.

The system should be able to calculate:

**Entrance → selected destination**

and later:

**Current location → selected destination**

---

# 6. DIRECTIONS

When a user selects a destination, show instructions such as:

“Enter the Computer Science Department.”

“Hardware Lab will be on your right.”

“Continue straight toward the Students and Visitors Toilet.”

“Reach the main corridor.”

“Turn left at the first intersection.”

“Continue straight.”

“Turn right.”

“Computer Lab 1 is on your right.”

OR:

“Computer Studies Room 4 is on your left.”

The directions should automatically change depending on the selected destination.

Do not hard-code completely separate directions for every room.

Generate the directions from the navigation graph.

---

# 7. INTERACTIVE MAP

Create a clean indoor map.

The map should visually show:

* Department entrance
* Main corridor
* Side corridors
* Intersections
* Rooms
* Room labels
* Left/right placement
* Navigation path
* Current location
* Destination marker

Use a clean modern map style.

The map should NOT look like Google Maps or an outdoor geographical map.

It should look like an **indoor floor-plan/navigation map**.

Use simple shapes:

* rectangles for rooms
* lines for corridors
* circles for navigation nodes
* arrows for directions

Make the corridors visually obvious.

---

# 8. ROOM COLORS / CATEGORIES

Use different visual styles for different room types.

For example:

* Offices
* Computer labs
* Computer studies rooms
* Toilets
* Staff facilities
* Seminar room
* Hardware lab
* Utilities

However, keep the overall design professional and not overly colorful.

---

# 9. SEARCH

Create a search bar:

**“Search rooms, offices or staff...”**

The user should be able to type:

* Computer Lab 1
* Lab 2
* Hardware Lab
* Dr E Lampi
* Mofya Phiri
* Seminar Room
* Staff Gents
* Computer Studies Room 5
* Secretary

Search should work even when the user types partial names.

For example:

“lampi”

should return:

**Dr E Lampi**

“lab”

should return:

* Computer Lab 1
* Computer Lab 2
* Computer Lab 3
* Hardware Lab

---

# 10. DESTINATION INFORMATION PANEL

When a user selects a room, display a panel containing:

Room/Office name

Type

Ground Floor

Short description

“Navigate here” button

Example:

Computer Lab 1
Computer Laboratory
Ground Floor

[ Navigate Here ]

---

# 11. NAVIGATION UI

When navigation starts, display:

### Destination

Computer Lab 2

### Route

Entrance → Main Corridor → Left → Right → Computer Lab 2

### Current instruction

“Turn left at the first intersection.”

### Next instruction

“Continue straight for the computer labs.”

Include:

* Start navigation
* Stop navigation
* Recalculate route
* Destination marker

---

# 12. MOBILE DESIGN

The application must be designed primarily for phones.

A student should be able to open it on an iPhone or Android phone and easily navigate the building.

Mobile interface should include:

* Large search bar
* Map
* Bottom destination panel
* Large navigation button
* Clear text
* Touch-friendly controls

Also make it responsive for desktop.

---

# 13. HOME SCREEN

Create a professional landing screen.

Title:

**Computer Science Department**

Subtitle:

**Indoor Navigation System**

Show:

* Search bar
* Interactive map
* Popular destinations
* “Start from Entrance” button

Popular destinations could include:

* Computer Lab 1
* Computer Lab 2
* Computer Lab 3
* Hardware Lab
* Seminar Room
* Head Computer Science

---

# 14. SUPABASE DATABASE

Create the Supabase database structure.

Create a `locations` table with:

id
name
type
description
floor
corridor
side
x
y
keywords
created_at

Create a `navigation_nodes` table:

id
name
type
x
y

Create a `navigation_edges` table:

id
from_node
to_node
distance
direction

Create appropriate foreign keys.

Add seed data for all Computer Science Department rooms.

Create a Supabase SQL schema/seed file inside the project, for example:

`supabase/schema.sql`

and

`supabase/seed.sql`

---

# 15. BACKEND API

Create an Express backend with endpoints such as:

GET `/api/locations`

GET `/api/locations/:id`

GET `/api/search?q=`

GET `/api/navigation/route/:destinationId`

POST `/api/navigation/route`

The backend should communicate with Supabase.

Use environment variables:

SUPABASE_URL

SUPABASE_ANON_KEY

Do NOT hard-code credentials.

Create:

`.env.example`

---

# 16. FRONTEND STRUCTURE

Use a clean React component architecture.

Suggested structure:

src/
components/
Map/
SearchBar.jsx
RoomCard.jsx
NavigationPanel.jsx
DestinationPanel.jsx
Header.jsx
pages/
Home.jsx
services/
api.js
data/
utils/
pathfinding.js
directions.js
App.jsx
main.jsx

You can improve this structure if necessary.

---

# 17. MAP IMPLEMENTATION

For the first working prototype, build the indoor map using **SVG or HTML/CSS**, rather than depending on Google Maps.

This allows the department floor plan to be completely custom.

The map should support:

* zoom
* pan
* clicking rooms
* highlighting destination
* highlighting calculated route
* responsive scaling

SVG is preferred because the navigation path can easily be drawn dynamically.

---

# 18. ROUTE VISUALIZATION

When the user clicks:

**Navigate Here**

draw the calculated route on top of the map.

For example:

Entrance
↓
Corridor
↓
Left turn
↓
Right turn
↓
Destination

The route should be visually obvious.

Animate the route if practical.

---

# 19. ACCESSIBILITY

Make the application accessible.

Use:

* readable fonts
* sufficient contrast
* keyboard navigation
* descriptive buttons
* aria-labels
* clear error messages

---

# 20. ERROR HANDLING

Handle:

* destination not found
* Supabase unavailable
* backend unavailable
* empty search
* invalid destination
* route unavailable

Show friendly messages instead of crashing.

---

# 21. DEVELOPMENT REQUIREMENTS

Create the project so I can run:

```bash
npm install
npm run dev
```

If a separate backend is required, create:

```bash
npm run server
```

or configure a convenient development setup.

Include a README.md explaining:

1. Installation
2. Supabase setup
3. Environment variables
4. Database setup
5. Running frontend
6. Running backend
7. Project architecture
8. How to add new rooms
9. How to modify the navigation graph

---

# 22. IMPORTANT DESIGN REQUIREMENT

The first prototype should prioritize:

**FUNCTIONALITY + CORRECT NAVIGATION LOGIC**

over unnecessary visual effects.

The user must be able to:

1. Enter the website.
2. Search for a room/person.
3. Select the destination.
4. See it on the map.
5. Press Navigate.
6. Receive a route from the department entrance.
7. See the route highlighted on the indoor map.
8. Read turn-by-turn instructions.

---

# 23. FUTURE EXPANSION

Structure the code so this Computer Science Department navigation system can later expand into a larger:

**UNZA Campus Navigation System**

Future features may include:

* Other departments
* Other buildings
* Outdoor campus navigation
* GPS
* QR-code room scanning
* Accessibility routes
* Multiple entrances
* User location
* Admin dashboard
* Room management
* Search across campus
* Student/staff accounts

Do not build all future features now. Just make the architecture extensible.

---

# 24. CRITICAL SPATIAL INFORMATION

Remember this exact relationship:

**MAIN ENTRANCE**
→ Hardware Lab is immediately RIGHT
→ Students & Visitors Toilet is STRAIGHT

Then:

**FIRST MAJOR TURN**
→ LEFT

Then:

**NEXT TURN**
→ RIGHT

After that:

**LEFT SIDE**
→ Head Computer Science
→ Secretary
→ Messenger
→ Electrical Services
→ Computer Studies rooms
→ Staff Gents
→ Staff Female
→ Seminar Room
→ Staff/lecturer offices

**RIGHT SIDE**
→ Computer Lab 1
→ Computer Lab 2
→ Computer Lab 3

Do not introduce an upstairs floor.

Do not add rooms that were not provided.

Do not randomly rearrange the rooms.

Use the above information as the source of truth for the initial navigation graph.

---

# 25. FINAL TASK

Build the complete working application now.

Create all necessary frontend, backend, Supabase configuration, components, navigation graph, pathfinding logic, map, search, API routes, database schema, seed data, and README.

Do not only provide an explanation.

Actually create/edit the project files in the VS Code workspace.

After implementation, check for:

* JavaScript errors
* React errors
* missing imports
* incorrect routes
* API errors
* Supabase configuration errors
* responsive layout issues

Make sure the application can run successfully with the documented commands.
