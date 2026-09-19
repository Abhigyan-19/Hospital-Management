# SEBASETHU Frontend

SEBASETHU is a React frontend for the Hospital Management System. It uses a light healthcare design, large readable controls, responsive layouts, and mock data until each backend module is available.

## 1. Requirements

Install these first:

- Node.js 20 or newer
- npm 10 or newer
- A browser such as Chrome or Edge
- Optional: Java 21 and Maven for the Spring Boot backend

Check your versions:

```powershell
node --version
npm --version
```

## 2. Install and run

Open PowerShell in this `frontend` folder:

```powershell
npm install
npm run dev
```

Open the URL printed by Vite, normally:

```text
http://localhost:5173/
```

Keep the terminal running while using the app. Stop the server with `Ctrl+C`.

## 3. Demo login

Open `/login` or click **Staff login** on the home page.

```text
Email:    admin@sebasethu.health
Password: demo123
```

The current mock login accepts any non-empty email and password. The demo user is an `ADMIN`.

## 4. Mock mode and backend mode

The `.env` file controls the data source:

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_USE_MOCK=true
```

Use `VITE_USE_MOCK=true` to work without Spring Boot. This is the easiest mode for a presentation.

Use `VITE_USE_MOCK=false` when the backend is running and you want patients and doctors to use the real API. Restart Vite after changing `.env`.

The frontend currently calls these real backend endpoints:

| Method | URL | Used by |
| --- | --- | --- |
| GET | `/patients` | Patient directory |
| POST | `/patients` | Add patient |
| GET | `/patients/{id}` | Patient details |
| DELETE | `/patients/{id}` | Delete patient |
| GET | `/doctors` | Doctor directory |
| POST | `/doctors` | Add doctor |
| GET | `/doctors/{id}` | Doctor details |
| DELETE | `/doctors/{id}` | Delete doctor |

Appointments, departments, prescriptions, reports, billing, beds, and labs currently use mock services because those backend controllers do not exist yet.

## 5. Available pages

Public pages:

- `/` - SEBASETHU landing page
- `/login` - staff login

Protected pages:

- `/dashboard` - overview, charts, appointments and quick actions
- `/patients` - patient search, pagination, create, view and delete
- `/doctors` - doctor directory, create, view and delete
- `/appointments` - booking, list view, week view and status changes
- `/departments` - department management and service catalog
- `/prescriptions` - create, view and print prescriptions
- `/reports` - charts, date filters and CSV export
- `/billing` - invoices and payment status preview
- `/beds` - ward capacity preview
- `/labs` - lab test tracking preview
- `/settings` - profile and password forms

## 6. Backend run order

If you want to use the Spring Boot API:

1. Open a second PowerShell terminal.
2. Move to the project root, the folder containing `pom.xml`:

```powershell
cd ..
mvn spring-boot:run
```

3. Keep the frontend running in the first terminal.
4. Change `VITE_USE_MOCK=false` in `.env`.
5. Restart the frontend with `npm run dev`.

The backend must allow the frontend origin `http://localhost:5173` through CORS.

## 7. Production build

Create the production bundle:

```powershell
npm run build
```

Test the built bundle locally:

```powershell
npm run preview
```

The output is created in `dist/`. Do not edit files inside `dist/`; they are generated.

## 8. Project structure

```text
src/
  api/          Axios instance and one service per module
  components/   Shared UI and application layout
  context/      Authentication context
  mock/         Demo records used in mock mode
  pages/        Public, auth, dashboard and module pages
  utils/        Small formatting helpers
  routes.jsx    Public and protected routes
  main.jsx      React entry point
```

To add a module:

1. Add its service in `src/api/`.
2. Add mock records in `src/mock/data.js` when needed.
3. Create a page in `src/pages/`.
4. Add a protected route in `src/routes.jsx`.
5. Add a labelled link in `src/components/layout.jsx`.
6. Run `npm run build`.

## 9. Common problems

### `npm` cannot find `package.json`

You are one folder too high. Run:

```powershell
cd "Hospital-Management\frontend"
npm run dev
```

### Port 5173 is already in use

Stop the old Vite process, or run:

```powershell
npm run dev -- --port 5174
```

### Login keeps showing an old screen

Refresh the browser. If necessary, open browser developer tools and clear local storage for `localhost:5173`, then log in again.

### API requests fail

For a presentation, set `VITE_USE_MOCK=true`. For real API mode, confirm Spring Boot is running on port `8080`, the endpoint exists, and CORS includes port `5173`.

## 10. Useful commands

```powershell
npm install       # install dependencies
npm run dev       # start development server
npm run build     # validate and create production bundle
npm run preview   # preview production bundle
```