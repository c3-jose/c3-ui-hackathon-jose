Help me generate a prompt in this file, I will be adding some requirements and information.
And you will be creating context and prompt text.

Let's begin:

The main task is to build an app. I want to build an app with different requirements and technologies.
I will be exploring different technologies and frameworks, for example in this directory I am using Svelte and Sveltekit.

Prompt:
1. Create an app in this directory using Svelte and Sveltekit framework.
2. Consider these frameworks or tools to use like so:
  a. Svelte for UI generation.
  b. Flowbite Svelte as the component library.
  c. D3.js with svelte for data visualization.
  d. Open props + custom scss for styling, consider theming capabilities.
  e. Zustand for state management, make sure to make it Svelte compatible.

Here are some requirements:
  - Navigation: The application implements a master-detail pattern where the “master” page allows the user to see, sort, filter on an entity (Windturbines), and allow the user to click on a specific record to navigate to the “details” page.
    - Details: The application implements a “details” page pattern, which allows the user to:
      - Edit/update record
      - Delete record
      This page also allows seeing other data associated with this record. Data can be:
      - Relational (e.g. GET windturbine/34/work-orders)
      - Timeseries (e.g. windturbine/34/power-output)
      - ML predictions (e.g. windturbine/34/alert-predictions)
      All this, in a single organized page.
  - Routing: Rich support for routing, bookmarking, link sharing.
    - Support for static urls, dynamic parameters, query filters, and deep linking, meaning:
      - Support /windturbines for master pages
      - Support /windturbines/123 for detail pages
      - Support for complex filtering like
      ```/windturbines&location=california&manufacturer=vestas,siemens&power_capacity=100..200&sort=alerts,-name```
      With the intent being:
      ```
      SELECT *
      FROM windturbines
      WHERE location = 'california'
        AND (manufacturer = 'vestas' OR manufacturer = 'siemens')
        AND (power_capacity >= 100 AND power_capacity <= 200)
      ORDER BY alerts ASC, name DESC;
      ```
      - Support for deep linking, where a url like
      ```/windturbine/123/tab=work_orders&highlight=data_grid&status=open&sort=-days_open```
      Leads to the bahavior of “Navigate to the details page for windturbine 123. Ensure the Work Orders tab is open, and viewport is scrolled to show the Data Grid component. Ensure that component is filtered by open work orders, and sorted for days open (descending)“
  - Data Visualization: The application displays data in a way that promotes insights.
    - Records are displayed with tables, grids, or cards
    - Temporal/timeseries data is displayed with, line charts, bar charts, area charts over time, or Gantt charts
    - Categorical data is displayed using pie charts, histograms, radar plots
    - Geospatial is displayed on 2D/3D maps
    - Relationships are displayed on graphs (nodes and edges)
    - Frequencies are displayed with heatmaps, histograms, whisker plots
    - Flows/funnels are displayed with Sankey or Funnels
    Also, these visualizations are not static. They allow the user to sort, filter, zoom, explore deeper.
    - String Formatting: Units, significant digits, and decimal digits are formatted in a way that leads to user insights, as an example $1M for finance, 3.85*10^8m for astronomy.
  - Data Input: The application makes it easy to take action / submit data.
    - Support for editing and creating new records through forms
    - Support for adding unstructured data via file uploads
    - Support for bulk create/edit with file upload and table inline editing.
    - All forms of data input make it clear which fields are mandatory
    - All forms of data input perform data validation:
      - Mandatory checking
      - Type checking: is value a valid date, email, credit card, SSN, …
      - Semantic checks: Are values within a certain range,
    - The application makes it clear which fields are editable and read-only.
    - The application makes it hard to create invalid values, like using check boxes for binary choices, dropdowns for expected value.
  
  - Visual Feedback: The application provides feedback to the user acknowledging the user intent and result of user actions.
    - The application displays:
      - Feedback on invalid data when the user is inputing data
      - Feedback on successful actions to the user knows the system performed the intended action
      - The application displays spinners, or skeletons, or other loading states on slow operations
      Feedback can be error messages, toasts, labels, …

  - Data visualization, data input: The application is careful with data fetch defaults to ensure a fast and interactive user experience.
    - Anything that displays a list of records, including tables, dropdowns, and alike assume there can be millions of records on the database, and implement techniques to ensure the application is fast, including limiting the amount of data fetched, infinite scrolling, pagination, virtualization.
    - The equivalent is true for:
      - Time series data
      - Statistical data
      - Geospatial data
      - Relationship data (nodes-edges)
  
  - Internationalization: 
    - The application supports multiple locales.
      - The application detects the browser locale and changes strings, dates, digits, monetary values to be formatted according to the user’s locale
      - The user can select a different language
      - It’s easy for the application developer to share the full set of English strings with a translation company/LLM and add support for a new locale in 1 hour.
      - The application changes layout in RTL languages, so navigation menus are on the right, text is right-aligned, …
    - Timezone support
      - The application persists all data in the backend in UTC
      - Data visualization formats times according to user preference
      - Data input allows users to input dates in a timezone preferred by the user, but sends it in UTC to backend
  
  - Theming:
    - Out-of-box themes and easy to customize.
      - The application offers light and dark themes
      - Each user can select, light, dark, or system default to the theme respects the browser/OS settings
      - Application developers can theme the application to use the corporate brand colors and logo image in less than 1 hour.

  - User Preference
    - The application allows the user to have some degree of personalization, and the application persists those preferences across devices.
      - The application persists user preferences like theme, which columns are displayed and in which order, nav menu entry positions, filters, and more.
      - These preferences are respected even when the user logs in from another device.

FOR Backend:
I currently have a backend running in http://localhost:3000/api/1 you can explore the info there.
The project or source code is in `~/c3/c3-ui-hackathon/windturbine-backend` route.

Skip Authentication for now.

For Real time data we can work on it later, let's prepare a couple of things but not focus on it now.

For Deployment, let's focus on running everything locally now.