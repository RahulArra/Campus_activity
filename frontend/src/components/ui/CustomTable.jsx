import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography 
} from '@mui/material';

const CustomTable = ({ headers, rows, title }) => {
  if (rows.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="subtitle1">No data to display.</Typography>
      </Paper>
    );
  }
  
  return (
    <TableContainer component={Paper} sx={{ borderRadius: '8px', boxShadow: 2 }}>
      {title && (
        <Typography variant="h6" sx={{ p: 2, bgcolor: '#f5f5f5' }}>{title}</Typography>
      )}
      <Table sx={{ minWidth: 650 }} aria-label="custom table">
        <TableHead>
          <TableRow sx={{ bgcolor: 'primary.main' }}>
            {headers.map((head) => (
              <TableCell 
                key={head.id} 
                align={head.align || 'left'} 
                sx={{ color: 'white', fontWeight: 600 }}
              >
                {head.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.id}
              sx={{ '&:nth-of-type(odd)': { backgroundColor: '#f9f9f9' } }}
            >
              {headers.map((head) => (
                <TableCell key={head.id} align={head.align || 'left'}>
                  {/* Render special action components or just text data */}
                  {row[head.id]} 
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default CustomTable;