import * as React from 'react';
import { Box, CircularProgress} from '@mui/material';

export default  function Loading() {
    return (
        <Box sx={{ display: 'flex', justifyContent:'center' , m: 4}}>
            <CircularProgress />
        </Box>
    );
}


