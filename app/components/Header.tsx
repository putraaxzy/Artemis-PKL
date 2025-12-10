/**
 * Header Component - Navigation header
 */

import React from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "./Button";
import { useAuth } from "../hooks/useAuth";
import { MdTask, MdAdd, MdMenu, MdClose, MdLogout } from "react-icons/md";
import { FaUser } from "react-icons/fa";

export function Header() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 max-w-7xl mx-auto gap-4">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-2 group flex-shrink-0"
            >
              <img
                src="/logo.png"
                alt="Artemis SMEA"
                className="h-16 transform group-hover:scale-110 transition-transform"
              />
            </Link>

            {/* Desktop Navigation */}
            {isAuthenticated && (
              <nav className="hidden md:flex items-center gap-2 flex-1 justify-center">
                <Link
                  to="/tasks"
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all font-medium flex items-center gap-2"
                >
                  <MdTask className="w-5 h-5" />
                  <span>Tasks</span>
                </Link>
                {user?.role === "guru" && (
                  <Link
                    to="/create-task"
                    className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all font-medium flex items-center gap-2"
                  >
                    <MdAdd className="w-5 h-5" />
                    <span>Create Task</span>
                  </Link>
                )}
              </nav>
            )}

            {/* User Menu */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {isAuthenticated && user ? (
                <>
                  <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                    <FaUser className="w-4 h-4 text-gray-600" />
                    <div>
                      <p className="font-semibold text-gray-900 text-sm whitespace-nowrap">
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
                    className="hidden md:inline-flex hover:bg-red-50 hover:text-red-600 gap-2"
                  >
                    <MdLogout className="w-4 h-4" />
                    <span>Logout</span>
                  </Button>

                  {/* Mobile Menu Button */}
                  <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <MdMenu className="w-6 h-6 text-gray-900" />
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
              {/* Close Button */}
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <MdClose className="w-6 h-6 text-gray-900" />
              </button>

              {/* User Info */}
              <div className="pb-4 border-b border-gray-200 pt-2 flex items-center gap-3">
                <FaUser className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="text-lg font-bold text-gray-900">
                    {user?.name}
                  </p>
                  <p className="text-sm text-gray-600 capitalize">
                    {user?.role}
                  </p>
                </div>
              </div>

              {/* Menu Items */}
              <nav className="space-y-2">
                <Link
                  to="/tasks"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <MdTask className="w-5 h-5" />
                  <span className="font-medium">Tasks</span>
                </Link>
                {user?.role === "guru" && (
                  <Link
                    to="/create-task"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <MdAdd className="w-5 h-5" />
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
                  <MdLogout className="w-5 h-5" />
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
