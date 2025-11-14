import { TextField } from '@mui/material';

const StyledInput = ({ label, name, type = 'text', control, rules, ...rest }) => (
  // Use React Hook Form's Controller for clean integration (if using RHF)
  // For simplicity, we use the basic TextField here:
  <TextField
    fullWidth
    label={label}
    name={name}
    type={type}
    variant="outlined" // Standardized look
    margin="normal" 
    {...rest} // Allows passing required RHF props or other MUI props
  />
);

export default StyledInput;