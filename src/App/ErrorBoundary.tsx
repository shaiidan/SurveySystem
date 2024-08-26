import React, { Component, ErrorInfo, ReactNode } from "react";
import { Navigate } from "react-router-dom";
import DonePage from "./DonePage";
import {ErrorContext} from './ErrorBoundaryContext';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage:string;
}

export default class ErrorBoundary extends Component<Props, State> {

  static contextType = ErrorContext;
  context!:React.ContextType< typeof ErrorContext>;

  public state: State = {
    hasError: false,
    errorMessage: ""
  };
  constructor(props) {
    super(props);
    this.state = { hasError: false ,errorMessage:""};
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const {updateError} = this.context;
    updateError(true);
    this.setState({ hasError: true, errorMessage:error?.message  });
  }

  resetErrorBoundary() {
    const {updateError} = this.context;
    updateError(false);
    this.setState({ hasError: false });
  }


  render() {
    if (this.state.hasError) {
     return <Navigate to="/done" replace={true} state={{type:'error', message:this.state.errorMessage}}/>
    }
    return this.props.children;
  }
}