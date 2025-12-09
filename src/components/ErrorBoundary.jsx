import React from 'react';

/**
 * ErrorBoundary catches JavaScript errors in child components
 * and displays a fallback UI instead of crashing the entire app.
 *
 * This prevents the "white screen of death" and gives users a way to recover.
 *
 * @example
 * <ErrorBoundary>
 *   <FlashCardQuiz />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    static getDerivedStateFromError(error) {
        // Update state so next render shows fallback UI
        return {
            hasError: true,
            error
        };
    }

    componentDidCatch(error, errorInfo) {
        // Log error details for debugging
        console.error('🚨 ErrorBoundary caught an error:', error);
        console.error('Component stack:', errorInfo.componentStack);

        // Store error info in state
        this.setState({
            errorInfo
        });

        // TODO: Send to error tracking service (Sentry, LogRocket, etc.)
        // Example:
        // Sentry.captureException(error, { extra: errorInfo });
    }

    handleReset = () => {
        // Reset error state and try to recover
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null
        });
    };

    handleReload = () => {
        // Full page reload as last resort
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            // Fallback UI
            return (
                <div className="min-h-screen bg-gradient-to-b from-[#8B1538] via-[#A0253B] to-[#6B1829] flex items-center justify-center p-4">
                    <div className="bg-[#F5E6D3] rounded-2xl shadow-2xl p-8 md:p-12 max-w-2xl w-full border-4 border-[#D4A574]">
                        {/* Error Icon */}
                        <div className="text-center mb-6">
                            <div className="inline-block text-8xl mb-4">😔</div>
                            <h1 className="text-3xl md:text-4xl font-black text-[#8B1538] mb-2">
                                Oeps! Er ging iets mis
                            </h1>
                            <p className="text-lg text-[#8B6F47]">
                                Het Sinterklaas spel heeft een foutje gemaakt
                            </p>
                        </div>

                        {/* Error Message (only in dev mode) */}
                        {import.meta.env.DEV && this.state.error && (
                            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-6 text-left">
                                <h3 className="font-bold text-red-900 mb-2">
                                    🐛 Development Info:
                                </h3>
                                <p className="text-sm text-red-800 font-mono break-words">
                                    {this.state.error.toString()}
                                </p>
                                {this.state.errorInfo && (
                                    <details className="mt-3">
                                        <summary className="cursor-pointer text-sm text-red-700 font-semibold">
                                            Component Stack
                                        </summary>
                                        <pre className="mt-2 text-xs text-red-700 overflow-x-auto whitespace-pre-wrap">
                                            {this.state.errorInfo.componentStack}
                                        </pre>
                                    </details>
                                )}
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={this.handleReset}
                                className="bg-[#6B8E23] hover:bg-[#556B1D] text-white font-black py-3 px-8 rounded-xl text-lg transition-colors duration-200 shadow-lg"
                            >
                                🔄 Opnieuw Proberen
                            </button>
                            <button
                                onClick={this.handleReload}
                                className="bg-[#8B1538] hover:bg-[#A0253B] text-white font-black py-3 px-8 rounded-xl text-lg transition-colors duration-200 shadow-lg"
                            >
                                ↻ Volledig Herladen
                            </button>
                        </div>

                        {/* Help Text */}
                        <div className="mt-8 text-center text-sm text-[#8B6F47]">
                            <p>
                                Als het probleem blijft bestaan, probeer dan:
                            </p>
                            <ul className="mt-2 space-y-1">
                                <li>• Je browser cache te legen</li>
                                <li>• In een ander tabblad te openen</li>
                                <li>• Een andere browser te gebruiken</li>
                            </ul>
                        </div>
                    </div>
                </div>
            );
        }

        // No error, render children normally
        return this.props.children;
    }
}

export default ErrorBoundary;
