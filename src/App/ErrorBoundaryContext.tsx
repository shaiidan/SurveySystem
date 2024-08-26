import * as React from 'react';


const ErrorContext = React.createContext({
  hasError: false,
  updateError: (value:boolean) => {}
});

const ErrorContextProvider = ({ children }) => {
  const [hasError, setHasError] = React.useState(false);

  const updateError = (value:boolean) => {
    setHasError(value);
  };

  return (
    <ErrorContext.Provider value={{ hasError, updateError }}>
      {children}
    </ErrorContext.Provider>
  );
};

export { ErrorContext, ErrorContextProvider };