import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error in React tree:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0e0b07] text-white flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white/5 border border-amber-500/30 rounded-2xl p-6 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center font-bold text-xl">
              CUB
            </div>
            <h2 className="text-xl font-bold font-['Sora'] text-yellow-400">
              Caribbean Union Bank AI
            </h2>
            <p className="text-sm text-gray-300">
              Something unexpected occurred while rendering the chat interface.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-extrabold text-xs uppercase tracking-wider hover:scale-105 transition-all shadow-md cursor-pointer"
            >
              Reload Chat Session
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
