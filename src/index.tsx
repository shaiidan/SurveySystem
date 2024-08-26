import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App/App';
import { createTheme, ThemeProvider } from '@mui/material';
import { CacheProvider } from '@emotion/react';
import rtlPlugin from 'stylis-plugin-rtl';
import createCache from '@emotion/cache';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import DonePage from './App/DonePage';
import ErrorBoundary from './App/ErrorBoundary';
import { ErrorContextProvider } from './App/ErrorBoundaryContext';

const theme = createTheme({
  direction: 'rtl',
});

// Create rtl cache
const cacheRtl = createCache({
  key: 'muirtl',
  stylisPlugins: [rtlPlugin],
});


export const router = createBrowserRouter([
  {
    path:"/",
    element: 
    <ErrorBoundary><App /></ErrorBoundary>
  },
  {
    path:"/done",
    element:<DonePage  />
  }
]);


const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  //<React.StrictMode>
   
  <CacheProvider value={cacheRtl}>
    <ThemeProvider theme={theme}>
      <ErrorContextProvider>
        <RouterProvider router={router} />
      </ErrorContextProvider>
    </ThemeProvider>
  </CacheProvider>
    
  //</React.StrictMode>

);




// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
//reportWebVitals();
