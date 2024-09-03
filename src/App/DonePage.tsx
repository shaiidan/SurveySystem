import { Container, Grid, Paper } from '@mui/material';
import * as React from 'react';
import InsertEmoticonIcon from '@mui/icons-material/InsertEmoticon';
import MoodBadIcon from '@mui/icons-material/MoodBad';
import { Link, useLocation  } from 'react-router-dom';
import { clearAppStorageData } from '../sessionStorage';

export interface DonePageState {
    type?: 'error' | 'done';
    message?:string;
}

export default function DonePage() {

    const location = useLocation();
    const [type, setType] = React.useState<'error' | 'done' | undefined>(undefined);
    const [message, setMessage] = React.useState<string>("");


    React.useEffect(()=>{
        if(location && location.state && location.state.type){
          setType(location.state.type);
          if(location.state.message) {
            setMessage(location.state.message); 
          }
        } else  {
            const search = location.search;
            const typeParam = new URLSearchParams(search).get('type');
            const messageParam = new URLSearchParams(search).get('message');
            if((typeParam === 'error' || typeParam === 'done') && messageParam) {
                setType(typeParam);
                setMessage(messageParam);
            }
        }
    },[]);

    const reloadPage = ()=>{
        clearAppStorageData();
        window.history.replaceState({}, '')
    }

    return (
        type ? 
        <>
            <Container  fixed sx={{height:'100%',}} >
                <Paper
                sx={{ p: 2, display:'flex', height:'100%',
                    justifyContent:'center' }} >
                    
                    <Grid container spacing={0} direction="column" alignItems="center" justifyContent="center" >
                        { 
                            type === 'done' ? 
                            <>
                                <h1>הסקר נשלח בהצלחה</h1>
                                <InsertEmoticonIcon sx={{m:2 , color:'rgb(162, 181, 235)', height:'30%', width:'30%'} }  />
                                <h2>תודה להתראות</h2>
                            </>
                            :
                            <>
                                <h1>סליחה משהו השתבש</h1>
                                <MoodBadIcon  sx={{m:2 , color:'rgb(230, 90, 90)', height:'30%', width:'30%'}}/>
                                <h2>{message!}</h2>
                                <Link to="/" onClick={reloadPage} >נסה שוב</Link>
                            </>
                        }
                    </Grid>

                </Paper>
            </Container>
        </> : null
    );
  
}