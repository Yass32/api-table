# Rick and Morty Table Interface

A React + Material UI table interface for browsing, filtering, sorting, and paginating Rick and Morty character data from the [Rick and Morty API](https://rickandmortyapi.com/).

## Features

- **Fetches and displays** character data from the Rick and Morty API
- **Pagination** with dynamic data fetching as you navigate
- **Sorting** by any column (click the column header)
- **Filtering** by any field (name, status, species, type, gender, origin, location)
- **Sticky column header** for easy navigation
- **Character details modal** on row click
- **Loading and error states** for a smooth user experience

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or newer recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1. **Clone the repository:**
   ```sh
   git clone https://github.com/yourusername/table-interface.git
   cd table-interface
   ```

2. **Install dependencies:**
   ```sh
   npm install
   # or
   yarn install
   ```

3. **Start the development server:**
   ```sh
   npm run dev
   # or
   yarn dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Usage

- **Sort:** Click any column header to sort by that column. Click again to toggle ascending/descending.
- **Filter:** Use the "Filter By" dropdown and search box above the table to filter results.
- **Pagination:** Use the pagination controls at the bottom to change pages or rows per page.
- **Details:** Click any row to view detailed character info in a modal.
- **Clear Filters:** Click the "Clear Filters" button to reset all filters.

## Project Structure

```
src/
  App.jsx         # Main React component
  App.css         # Custom styles
  main.jsx        # Entry point
  index.css       # Global styles
  assets/         # Static assets
public/
  icon.png        # Favicon
```

## Tech Stack

- [React](https://react.dev/)
- [Material UI](https://mui.com/)
- [Axios](https://axios-http.com/)
- [Vite](https://vitejs.dev/)

## Customization

- To change the number of pages fetched on load, edit the `fetchPages(1, 13)` call in `App.jsx`.
- To adjust table columns, edit the `columnHeaders` array in `App.jsx`.

## Troubleshooting

- If you see "Loading characters...⏳" for too long, check your internet connection or the Rick and Morty API status.
- If you get "No characters found", try clearing filters or check your search terms.


