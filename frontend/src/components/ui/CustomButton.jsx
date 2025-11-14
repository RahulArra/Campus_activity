import { Button } from '@mui/material';
import { styled } from '@mui/system';

const StyledButton = styled(Button)(({ theme, variant }) => ({
  borderRadius: '8px', // Slightly rounded corners for a modern feel
  textTransform: 'none', // Keep text case natural
  padding: '10px 20px',
  // Custom styling for primary contained buttons
  ...(variant === 'contained' && {
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 8px rgba(0, 0, 0, 0.15)',
    },
  }),
}));

const CustomButton = (props) => {
  return <StyledButton {...props} />;
};

export default CustomButton;