import React, { useState } from 'react';
import { Box, Grid, TextField, MenuItem, IconButton } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import CustomButton from './CustomButton'; // Your reusable button

// --- MOCK TEMPLATE DATA ---
// NOTE: These templates should eventually be fetched from Laxman's/Naveen's API: GET /api/templates [cite: 43, 84]
const MOCK_TEMPLATES = [
  { id: '', label: 'All Activity Types' },
  { id: 'HACKATHON_P', label: 'Hackathon Participation' },
  { id: 'SEMINAR_A', label: 'Seminar Attended' },
  { id: 'SPORTS_W', label: 'Sports Event Winner' },
  { id: 'CULTURAL_P', label: 'Cultural Event' },
];
// --- END MOCK TEMPLATE DATA ---

const FilterBar = ({ filters, setFilters }) => {
  const [localFilters, setLocalFilters] = useState({
    templateType: filters.templateType,
    dateFrom: filters.dateRange.from,
    dateTo: filters.dateRange.to,
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setLocalFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    setFilters({
      templateType: localFilters.templateType,
      dateRange: {
        from: localFilters.dateFrom,
        to: localFilters.dateTo,
      },
    });
  };

  const clearFilters = () => {
    const defaultFilters = { templateType: '', dateFrom: '', dateTo: '' };
    setLocalFilters(defaultFilters);
    setFilters({
        templateType: '',
        dateRange: { from: null, to: null },
    });
  };

  return (
    <Box component="div" sx={{ 
      p: 2, 
      mb: 3, 
      borderRadius: '8px', 
      boxShadow: 3, 
      bgcolor: 'white' 
    }}>
      <Grid container spacing={2} alignItems="center">
        {/* Filter Icon Title */}
        <Grid item>
          <FilterListIcon color="primary" sx={{ fontSize: 30 }} />
        </Grid>
        
        {/* Template Type Filter */}
        <Grid item xs={12} sm={4} md={3}>
          <TextField
            select
            fullWidth
            label="Activity Type"
            name="templateType"
            value={localFilters.templateType}
            onChange={handleChange}
            size="small"
          >
            {MOCK_TEMPLATES.map((option) => (
              <MenuItem key={option.id} value={option.id}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Date From Filter */}
        <Grid item xs={12} sm={4} md={3}>
          <TextField
            fullWidth
            label="Date From"
            name="dateFrom"
            type="date"
            value={localFilters.dateFrom}
            onChange={handleChange}
            size="small"
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        {/* Date To Filter */}
        <Grid item xs={12} sm={4} md={3}>
          <TextField
            fullWidth
            label="Date To"
            name="dateTo"
            type="date"
            value={localFilters.dateTo}
            onChange={handleChange}
            size="small"
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        {/* Apply and Clear Buttons */}
        <Grid item xs={12} md={3} sx={{ display: 'flex', gap: 1, justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
          <CustomButton 
            variant="contained" 
            color="primary" 
            onClick={applyFilters}
            startIcon={<FilterListIcon />}
          >
            Apply Filters
          </CustomButton>
          <IconButton 
            color="secondary" 
            onClick={clearFilters}
            title="Clear Filters"
          >
            <ClearIcon />
          </IconButton>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FilterBar;