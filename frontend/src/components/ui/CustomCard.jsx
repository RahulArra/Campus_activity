import { Card, CardContent, CardHeader } from '@mui/material';
import { styled } from '@mui/system';

const StyledCard = styled(Card)({
  borderRadius: '12px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
  transition: 'transform 0.3s',
  '&:hover': {
    transform: 'translateY(-3px)',
  },
});

const CustomCard = ({ title, actions, children, ...props }) => {
  return (
    <StyledCard {...props}>
      {title && (
        <CardHeader
          title={title}
          action={actions}
          titleTypographyProps={{ variant: 'h6', fontWeight: 600, color: 'primary.main' }}
          sx={{ borderBottom: '1px solid #eee' }}
        />
      )}
      <CardContent>
        {children}
      </CardContent>
    </StyledCard>
  );
};

export default CustomCard;