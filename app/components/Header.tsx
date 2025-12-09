/**
 * Header Component - Navigation header
 */

import React from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "./Button";
import { useAuth } from "../hooks/useAuth";

export function Header() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 max-w-7xl mx-auto">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <img
                src="/logo.png"
                alt="Artemis SMEA"
                className="h-16 transform group-hover:scale-110 transition-transform"
              />
            </Link>

            {/* Desktop Navigation */}
            {isAuthenticated && (
              <nav className="hidden md:flex items-center gap-2">
                <Link
                  to="/tasks"
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all text-sm font-medium"
                >
                  📋 Tasks
                </Link>
                {user?.role === "guru" && (
                  <Link
                    to="/create-task"
                    className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all text-sm font-medium"
                  >
                    ➕ Create Task
                  </Link>
                )}
              </nav>
            )}

            {/* User Menu */}
            <div className="flex items-center gap-3">
              {isAuthenticated && user ? (
                <>
                  <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-600 capitalize">
                        {user.role}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={logout}
                    className="hidden md:inline-flex text-sm hover:bg-red-50 hover:text-red-600"
                  >
                    Logout
                  </Button>

                  {/* Mobile Menu Button */}
                  <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <svg
                      className="w-6 h-6 text-gray-900"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      {mobileMenuOpen ? (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      ) : (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 6h16M4 12h16M4 18h16"
                        />
                      )}
                    </svg>
                  </button>
                </>
              ) : (
                <Button
                  size="sm"
                  onClick={() => navigate("/login")}
                  className="text-sm bg-gray-900 hover:bg-gray-800"
                >
                  Login
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Slide Menu */}
      {mobileMenuOpen && isAuthenticated && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden animate-fade-in"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Slide Panel - FROM LEFT */}
          <div className="fixed top-0 left-0 h-full w-64 bg-white shadow-2xl z-50 md:hidden animate-slide-in-left">
            <div className="p-6 space-y-6">
              {/* Close Button */}
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg
                  className="w-6 h-6 text-gray-900"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              {/* User Info */}
              <div className="pb-4 border-b border-gray-200 pt-2">
                <p className="text-lg font-bold text-gray-900">{user?.name}</p>
                <p className="text-sm text-gray-600 capitalize">{user?.role}</p>
              </div>

              {/* Menu Items */}
              <nav className="space-y-2">
                <Link
                  to="/tasks"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <span className="text-xl">📋</span>
                  <span className="font-medium">Tasks</span>
                </Link>
                {user?.role === "guru" && (
                  <Link
                    to="/create-task"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <span className="text-xl">➕</span>
                    <span className="font-medium">Create Task</span>
                  </Link>
                )}
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors w-full text-left"
                >
                  <span className="text-xl">🚪</span>
                  <span className="font-medium">Logout</span>
                </button>
              </nav>
            </div>
          </div>
        </>
      )}
    </>
  );
}
