import React, { useState, useEffect } from 'react';
import { Box, Paper, TableContainer, TableHead, TableBody, 
  TableFooter, Table, TableCell, TableRow, 
  TableSortLabel, TablePagination, InputLabel, TextField, Select, MenuItem, Button } from '@mui/material';
import axios from 'axios';
import './App.css';

function App() {
  // State for loading indicator
  const [loading, setLoading] = useState(true);
  // State for error messages
  const [error, setError] = useState(null);

  // State to keep track of which API pages have been fetched
  const [fetchedApiPages, setFetchedApiPages] = useState([]);
  // State for current table page (pagination)
  const [currentPage, setCurrentPage] = useState(0);
  // State for how many rows to show per page
  const [rowsPerPage, setRowsPerPage] = useState(5);
  // State for all character data fetched from the API
  const [rowsData, setRowsData] = useState([]);

  // State for sorting: which column and direction
  const [sortBy, setSortBy] = useState('id');
  const [sortDirection, setSortDirection] = useState('asc');

  // State for filtering: which column and what value
  const [filterType, setFilterType] = useState('');
  const [filterValue, setFilterValue] = useState('');

  // State for the currently selected character (for details modal)
  const [activeCharacter, setActiveCharacter] = useState(null);

  // Table column definitions
  const columnHeaders = [
    { id: 'id', label: 'ID' },
    { id: 'image', label: 'Image' },
    { id: 'name', label: 'Name' },
    { id: 'status', label: 'Status' },
    { id: 'species', label: 'Species' },
    { id: 'type', label: 'Type' },
    { id: 'gender', label: 'Gender'},
    { id: 'origin', label: 'Origin' },
    { id: 'location', label: 'Location' }
  ];

  // Function to fetch a range of API pages and update state
  const fetchPages = async (startPage, endPage) => {
    setLoading(true); // Show loading spinner
    let data = [];
    let fetchedPages = [...fetchedApiPages]; // Copy of already fetched pages
    for (let page = startPage; page <= endPage; page++) {
      if (!fetchedPages.includes(page)) { // Only fetch if not already fetched
        try {
          // Fetch data from API
          const response = await axios.get(`https://rickandmortyapi.com/api/character/?page=${page}`);
          data = [...data, ...response.data.results]; // Add new characters
          fetchedPages.push(page); // Mark this page as fetched
          // Stop if there are no more pages
          if (!response.data.info.next) {
            break;
          }
        } catch (error) {
          // Handle errors
          console.error('Error fetching page', page, error);
          if (error.response && error.response.status === 404) {
            setError("No characters found. The API might have run out of data or your request is invalid.");
          } else {
            setError("Failed to fetch data. Please check your network connection.");
          }
        }
      } 
    }
    // Update state with new data and fetched pages
    setRowsData(prevRows => [...prevRows, ...data]);
    setFetchedApiPages(fetchedPages);
    setLoading(false); // Hide loading spinner
  }

  // On first render, fetch the first 13 pages (about 260 characters)
  useEffect(() => {
    fetchPages(1, 13);
  }, []);

  // When filter changes, reset to first page
  useEffect(() => {
    setCurrentPage(0);
  }, [filterType, filterValue]);

  // Handle sorting when a column header is clicked
  const handleSort = (column) => {
    if (sortBy === column) {
      // If already sorting by this column, toggle direction
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      // Otherwise, sort by this column ascending
      setSortBy(column);
      setSortDirection('asc');
    }
  };

  // Sort the data based on selected column and direction
  const sortedRowsData = [...rowsData].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    // If sorting by an object (origin/location), use the name property
    if (typeof aValue === 'object' && aValue !== null) aValue = aValue.name;
    if (typeof bValue === 'object' && bValue !== null) bValue = bValue.name;
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Filter the data based on filter type and value
  const filteredRowsData = [...sortedRowsData].filter(row => {
    if(!filterType || !filterValue) {
      return true; // No filter, show all
    }
    const value = row[filterType];
    if (typeof value === 'string') {
      if (filterType === "gender" ) {
        // For gender, match first letter (e.g. "m" for "male")
        // Can't use includes because "male" is a substring of "female"
        return value.toLowerCase()[0]===filterValue.toLowerCase()[0];
      } 
      // For other string fields, use substring match
      return value.toLowerCase().includes(filterValue.toLowerCase());
    } else if (typeof value === 'object' && value !== null) {
      // For object fields (origin/location), match on name
      return value.name.toLowerCase().includes(filterValue.toLowerCase());
    }
    return false;
  });

  return (
    <>
      {/* Main container */}
      <Box sx={{ width: '100%' }}>
        <Paper elevation={4} sx={{ width: '100%'}} square={false}>
          {/* Table container with scroll and fixed height for sticky header */}
          <TableContainer sx={{ width: '80vw', maxHeight: '80vh', overflowY: 'auto' }}>
            <Table>
              <TableHead>
                {/* Title row */}
                <TableRow>
                  <TableCell colSpan={columnHeaders.length} sx={{ textAlign: 'center', fontSize: '1.2rem', fontWeight: 'bold' }}>
                    Rick and Morty Characters
                  </TableCell>
                </TableRow>
                {/* Filter controls row */}
                <TableRow>
                  <TableCell colSpan={columnHeaders.length}  sx={{ textAlign: 'center', fontSize: '0.9rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'end', alignItems: 'center'}}>
                      {/* Filter type dropdown */}
                      <InputLabel htmlFor="filter-type-select">Filter By:</InputLabel>
                      <Select
                        label="Filter By"
                        sx={{ minWidth: 100, marginRight: 2, marginLeft: 2 }}
                        variant="standard"
                        id='filter-type-select'
                        value={filterType} 
                        onChange={(e) => {setFilterType(e.target.value);}}
                      >
                        <MenuItem value=""><em>None</em></MenuItem>
                        <MenuItem value="name">Name</MenuItem>
                        <MenuItem value="status">Status</MenuItem>
                        <MenuItem value="species">Species</MenuItem>
                        <MenuItem value="type">Type</MenuItem>
                        <MenuItem value="gender">Gender</MenuItem>
                        <MenuItem value="origin">Origin</MenuItem>
                        <MenuItem value="location">Location</MenuItem>
                      </Select>
                      {/* Filter value input */}
                      <TextField sx={{ marginRight: 2, height:'64px' }} id="standard-basic" label="Search" variant="standard" value={filterValue} onChange={(e) => {setFilterValue(e.target.value);}}/>
                      {/* Clear filter button */}
                      <Button variant="contained" onClick={() => {
                        setFilterType('');
                        setFilterValue('');
                      }}>Clear Filters</Button>
                    </div>
                  </TableCell>  
                </TableRow>
                {/* Sticky header row for column labels */}
                <TableRow sx={{position: 'sticky',top: 0,zIndex: 2,backgroundColor: '#f5f5f5'}}>
                  {columnHeaders.map(header => {
                    return(
                      <TableCell key={header.id}>
                        {/* Sortable column label */}
                        <TableSortLabel active={sortBy === header.id}
                          direction={sortBy === header.id ? sortDirection : 'asc'}
                          onClick={() => handleSort(header.id)}
                        >
                          {header.label}
                        </TableSortLabel>
                      </TableCell>
                    )
                  })}
                </TableRow>
              </TableHead>
              <TableBody sx={{ overflow: 'scroll' }}>
                {/* Show loading spinner, error, or table rows */}
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={columnHeaders.length} sx={{ textAlign: 'center' }}>
                      Loading characters...⏳
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={columnHeaders.length} sx={{ textAlign: 'center', color: 'red' }}>
                      Error: {error}
                    </TableCell>
                  </TableRow>
                ) : filteredRowsData.length < 1 ? (
                  <TableRow>
                    <TableCell colSpan={columnHeaders.length} sx={{ textAlign: 'center' }}>
                      <p>Sorry, no characters found matching your criteria 🥺</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  // Render paginated, filtered, and sorted rows
                  filteredRowsData.slice(currentPage * rowsPerPage, currentPage * rowsPerPage + rowsPerPage).map((row) => (
                    <TableRow 
                      sx={{cursor:'pointer', backgroundColor: activeCharacter?.id === row.id ? '#f5f5f5' : 'inherit'}} 
                      hover 
                      key={row.id} 
                      onClick={() => setActiveCharacter(activeCharacter?.id == row.id ? null : row)}
                    >
                      <TableCell>{row.id}</TableCell>
                      <TableCell>
                        <img src={row.image} alt={row.name} style={{ width: '80px', height: '80px' }} />
                      </TableCell>
                      <TableCell>{row.name}</TableCell>
                      <TableCell>{row.status}</TableCell>
                      <TableCell>{row.species}</TableCell>
                      <TableCell>{row.type || 'N/A'}</TableCell>
                      <TableCell>{row.gender}</TableCell>
                      <TableCell>{row.origin.name}</TableCell>
                      <TableCell>{row.location.name}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
              <TableFooter>
                <TableRow>
                  {/* Pagination controls */}
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 20]}           
                    count={825} // Total number of characters in the API
                    rowsPerPage={rowsPerPage}
                    page={currentPage}
                    onPageChange={(event, newPage) => {
                      setCurrentPage(newPage);
                      // Fetch more data if needed for new page
                      const apiPageNeeded = Math.floor((newPage * rowsPerPage) / 20) + 1;
                      if (!fetchedApiPages.includes(apiPageNeeded)) {
                        fetchPages(apiPageNeeded, apiPageNeeded);
                      }
                    }}
                    onRowsPerPageChange={(e) => {
                      setRowsPerPage(Number(e.target.value));
                      setCurrentPage(0);
                    }}
                    labelRowsPerPage="Rows per page"
                    labelDisplayedRows={({ from, to, count }) => `${from}-${to} of ${count !== -1 ? count : `more than ${to}`}`}
                  />
                </TableRow>
              </TableFooter>
            </Table>
          </TableContainer>
        </Paper>
      </Box>

      {/* Character details modal */}
      {activeCharacter && (
        <Box sx={{ position: 'relative', top: 0, left: 0, width: '100%', height: '70%', backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 5 }}>
          <Paper elevation={4} sx={{ padding: 2, width: '80vw', maxHeight: '80vh', overflowY: 'auto' }}>
            <h2>Character Details</h2>
            <div style={{display: 'flex', alignItems: 'flex-start', justifyContent: 'center', textAlign: 'left'}}>
              <div>
                <img src={activeCharacter.image} alt={activeCharacter.name} style={{ width: '150px', height: '150px', borderRadius: '50%' }} />
              </div>
              <div style={{ marginLeft: '20px', marginTop: '-20px' }}>
                <p><strong>ID:</strong> {activeCharacter.id}</p>
                <p><strong>Name:</strong> {activeCharacter.name}</p>
                <p><strong>Status:</strong> {activeCharacter.status}</p>
                <p><strong>Species:</strong> {activeCharacter.species}</p>
                <p><strong>Type:</strong> {activeCharacter.type || 'N/A'}</p>
                <p><strong>Gender:</strong> {activeCharacter.gender}</p>
                <p><strong>Origin:</strong> {activeCharacter.origin.name}</p>
                <p><strong>Location:</strong> {activeCharacter.location.name}</p>
                {/* Show episode count if available */}
                {activeCharacter.episode && activeCharacter.episode.length > 0 && (
                  <p>
                    <strong>Episodes:</strong> {activeCharacter.episode.length}
                  </p>
                )}
                <p><strong>URL:</strong> <a href={activeCharacter.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{activeCharacter.url}</a></p>
                <p><strong>Created:</strong> {new Date(activeCharacter.created).toLocaleDateString()}</p>
              </div>
            </div>
          </Paper>
        </Box>
      )}
    </>
  )
}

export default App
