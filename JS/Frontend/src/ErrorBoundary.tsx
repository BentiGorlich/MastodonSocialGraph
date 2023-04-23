import React, { ReactNode } from "react";

interface ErrorBoundaryState {
    hasError: boolean,
    error?: ReactNode,
    info?: string,
}

interface ErrorBoundaryProps {
    children: ReactNode
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {

    constructor(props) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError(error: Error) {
        // Update state so the next render will show the fallback UI.
        let msg = <>
            <p>{error.name}: {error.message}</p>
            {error.stack && <pre>
                {error.stack}
            </pre>}
        </>
        return { hasError: true, error: msg }
    }

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return <>
                <h1>Something went wrong.</h1>
                {this.state.error}
            </>
        }

        return this.props.children;
    }
}

export default ErrorBoundary