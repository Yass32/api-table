import React, { useState, useEffect } from 'react';
import { Box, Paper, TableContainer, TableHead, TableBody, 
  TableFooter, Table, TableCell, TableRow, 
  TableSortLabel, TablePagination } from '@mui/material';
import axios from 'axios';
import './App.css';

function App() {
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
    let data = [];
    let fetchedPages = [...fetchedApiPages]; // Create a copy of fetchedApiPages to avoid modifying state directly
    for (let page = startPage; page <= endPage; page++) {
      if (!fetchedApiPages.includes(page)) {
        try {
          const response = await axios.get(`https://rickandmortyapi.com/api/character/?page=${page}`); //20 characters per page
          data = [...data, ...response.data.results];
          fetchedPages.push(page); // Add the page to fetchedApiPages
        } catch (error) {
          console.error('Error fetching page', page, error);
        }
      }
      
    }
    setRowsData(prevRows => [...prevRows, ...data]); // Append new data to existing rowsData
    setFetchedApiPages(fetchedPages); // Update the state with fetched pages
  }

  useEffect(() => {
    fetchPages(1, 13); // Fetch the first 13 or 260 characters at least on first render
  }, []);

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
    if (sortDirection === 'asc') {
      return a[sortBy] > b[sortBy] ? 1 : -1;
    } else {
      return a[sortBy] < b[sortBy] ? 1 : -1;
    }
  });

  // Filter the sorted rowsData based on the filterType and filterValue
  const filteredRowsData = sortedRowsData.filter(row => {
    if (!filterType || !filterValue) {
      return true; // <-- include all rows if no filter is set
    }
    let value = row[filterType];
    if (typeof value === 'object' && value !== null && value.name) {
      value = value.name;
    }
    if (typeof value === 'string') {
      return value.toLowerCase().includes(filterValue.trim().toLowerCase());
    }
    return false;
  });

  






  return (
    <>
      <Box sx={{ width: '100%' }}>
        <Paper elevation={4} sx={{ width: '100%'}} square={false}>
          <TableContainer sx={{ width: '80vw', overflowY: 'auto' }}>
            <Table  >
              <TableHead>
                <TableRow>
                  <TableCell colSpan={9} sx={{ textAlign: 'center', fontSize: '1.2rem', fontWeight: 'bold' }}>
                    Rick and Morty Characters
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={9} sx={{ textAlign: 'right' }}  >
                    <p >Filter By:</p>
                    <select style={{ marginRight: '10px', background: 'white', color: 'black' }} 
                    value={filterType} onChange={(e) => {setFilterType(e.target.value);}}>
                      <option value="">All</option>
                      <option value="name">Name</option>
                      <option value="status">Status</option>
                      <option value="species">Species</option>
                      <option value="type">Type</option>
                      <option value="gender">Gender</option>
                      <option value="origin">Origin</option>
                      <option value="location">Location</option>
                    </select>
                    <input style={{ marginRight: '10px', background: 'white', color: 'black' }} type="text" 
                    placeholder="Search..." value={filterValue} onChange={(e) => {setFilterValue(e.target.value);}}/>
                  </TableCell>
                </TableRow>
                <TableRow>
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
                {filteredRowsData < 1 ? (
                  <TableRow>
                    <TableCell colSpan={9} sx={{ textAlign: 'center' }}>
                      <p>Sorry characters cannot be found 🥺</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRowsData.slice(currentPage * rowsPerPage, currentPage * rowsPerPage + rowsPerPage).map((row) => (
                    <TableRow hover key={row.id} onClick={() => setActiveCharacter(activeCharacter?.id == row.id ? null : row)}>
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
                    count={825}
                    rowsPerPage={rowsPerPage}
                    page={currentPage}
                    onPageChange={(event, newPage) => {
                      setCurrentPage(newPage);
                      // Calculate which API page is needed for the new table page
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
                <p><strong>Url:</strong> {activeCharacter.url}</p>
                <p><strong>Created:</strong> {activeCharacter.created}</p>
              </div>
            </div>

          </Paper>
        </Box>
      )}

      
    </>
  )
}

export default App
