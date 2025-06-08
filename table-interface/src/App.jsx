import React, { useState, useEffect } from 'react';
import { Box, Paper, TableContainer, TableHead, TableBody, 
  TableFooter, Table, TableCell, TableRow, 
  TableSortLabel, TablePagination, InputLabel, TextField, Select,FormHelperText, FormLabel, MenuItem, Button } from '@mui/material';
import axios from 'axios';
import './App.css';

function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  const [fetchedApiPages, setFetchedApiPages] = useState([]); // Array to keep track of fetched API pages
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [rowsData, setRowsData] = useState([]);

  const [sortBy, setSortBy] = useState('id');
  const [sortDirection, setSortDirection] = useState('asc');

  const [filterType, setFilterType] = useState('');
  const [filterValue, setFilterValue] = useState('');

  const [activeCharacter, setActiveCharacter] = useState(null);


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
  ]


  const fetchPages = async (startPage, endPage) => {
    setLoading(true);
    let data = [];
    let fetchedPages = [...fetchedApiPages]; // Create a copy of fetchedApiPages to avoid modifying state directly
    for (let page = startPage; page <= endPage; page++) {
      if (!fetchedPages.includes(page)) {
        try {
          const response = await axios.get(`https://rickandmortyapi.com/api/character/?page=${page}`); //20 characters per page
          data = [...data, ...response.data.results];
          fetchedPages.push(page); // Add the page to fetchedApiPages
          // If there's no 'next' page in the API response, stop fetching
          if (!response.data.info.next) {
            break;
          }
        } catch (error) {
          console.error('Error fetching page', page, error);
          if (error.response && error.response.status === 404) {
            setError("No characters found. The API might have run out of data or your request is invalid.");
          } else {
            setError("Failed to fetch data. Please check your network connection.");
          }
        }
      } 
    }
    setRowsData(prevRows => [...prevRows, ...data]); // Append new data to existing rowsData
    setFetchedApiPages(fetchedPages); // Update the state with fetched pages
    setLoading(false); // Ensure loading is set to false after fetching
  }

  useEffect(() => {
    fetchPages(1, 13); // Fetch the first 13 or 260 characters at least on first render
  }, []);

  // Reset currentPage when filterType or filterValue changes
  useEffect(() => {
    setCurrentPage(0);
  }, [filterType, filterValue]);


  // Function to handle sorting
  const handleSort = (column) => {
    if (sortBy === column) {
      // toggle direction
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(column);
      setSortDirection('asc'); // reset direction to asc
    }
  };

  // Sort the rowsData based on the selected column and direction
  const sortedRowsData = [...rowsData].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    // Handle special cases for origin and location since they are objects
    if (typeof aValue === 'object' && aValue !== null) aValue = aValue.name;
    if (typeof bValue === 'object' && bValue !== null) bValue = bValue.name;
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Filter the sorted rowsData based on the filterType and filterValue
  const filteredRowsData = [...sortedRowsData].filter(row => {
    if(!filterType || !filterValue) {
      return true;
    }
    const value = row[filterType];
    if (typeof value === 'string') {
      if (filterType === "gender" ) {
        // Special exception for gender
        // Can't use includes because "male" is a substring of "female"
        // so we check if the first letter matches 
        return value.toLowerCase()[0]===filterValue.toLowerCase()[0];
      } 
      return value.toLowerCase().includes(filterValue.toLowerCase());
    } else if (typeof value === 'object' && value !== null) {
      return value.name.toLowerCase().includes(filterValue.toLowerCase());
    }
    return false;
  });


  return (
    <>
      <Box sx={{ width: '100%' }}>
        <Paper elevation={4} sx={{ width: '100%'}} square={false}>
          <TableContainer sx={{ width: '80vw', overflowY: 'auto' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell colSpan={columnHeaders.length} sx={{ textAlign: 'center', fontSize: '1.2rem', fontWeight: 'bold' }}>
                    Rick and Morty Characters
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={columnHeaders.length}  sx={{ textAlign: 'center', fontSize: '0.9rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'end', alignItems: 'center' }}>
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
                        <TextField sx={{ marginRight: 2 }} id="standard-basic" label="Search" variant="standard" value={filterValue} onChange={(e) => {setFilterValue(e.target.value);}}/>
                        <Button variant="contained" onClick={() => {
                          setFilterType('');
                          setFilterValue('');
                        }}>Clear Filters</Button>
                    </div>
                    </TableCell>  
                </TableRow>
                <TableRow sx={{backgroundColor: '#f5f5f5'}}>
                  {columnHeaders.map(header => {
                    return(
                      <TableCell key={header.id}>
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
                  filteredRowsData.slice(currentPage * rowsPerPage, currentPage * rowsPerPage + rowsPerPage).map((row) => (
                    <TableRow sx={{cursor:'pointer', backgroundColor: activeCharacter?.id === row.id ? '#f5f5f5' : 'inherit'}} 
                    hover key={row.id} onClick={() => setActiveCharacter(activeCharacter?.id == row.id ? null : row)}>
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
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 20]}           
                    count={filteredRowsData.length}
                    rowsPerPage={rowsPerPage}
                    page={currentPage}
                    onPageChange={(event, newPage) => {
                      setCurrentPage(newPage);
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

      {activeCharacter && (
        <Box sx={{ position: 'relative', top: 0, left: 0, width: '100%', height: '70%', backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 5 }}>
          <Paper elevation={4} sx={{ padding: 2, width: '80vw', maxHeight: '80vh', overflowY: 'auto' }}>
            <h2>Character Details</h2>
            <div style={{display: 'flex', alignItems: 'flex-start', justifyContent: 'center', textAlign: 'left'}}>
              <div>
                <img src={activeCharacter.image} alt={activeCharacter.name} style={{ width: '150px', height: '150px' }} />
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
