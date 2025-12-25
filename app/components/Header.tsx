/**
 * Header Component - Navigation header
 */

import React from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "./Button";
import { useAuth } from "../hooks/useAuth";
import {
  MdTask,
  MdAdd,
  MdMenu,
  MdClose,
  MdLogout,
  MdArrowUpward,
} from "react-icons/md";
import { FaUser } from "react-icons/fa";

export function Header() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [showScrollTop, setShowScrollTop] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 max-w-7xl mx-auto">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-2 group flex-shrink-0"
            >
              <img
                src="/batik.png"
                alt="Artemis SMEA"
                className="h-9 sm:h-10 w-auto object-contain transform group-hover:scale-105 transition-transform"
              />
            </Link>

            {/* Right Side - Nav + User */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Desktop Navigation */}
              {isAuthenticated && (
                <nav className="hidden md:flex items-center gap-1">
                  <Link
                    to="/dashboard"
                    className="px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all font-medium flex items-center gap-2 text-sm"
                  >
                    <MdTask className="w-4 h-4" />
                    <span>Tasks</span>
                  </Link>
                  {user?.role === "guru" && (
                    <Link
                      to="/create-task"
                      className="px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all font-medium flex items-center gap-2 text-sm"
                    >
                      <MdAdd className="w-4 h-4" />
                      <span>Create Task</span>
                    </Link>
                  )}
                </nav>
              )}

              {/* Divider - Desktop Only */}
              {isAuthenticated && (
                <div className="hidden md:block w-px h-8 bg-gray-200" />
              )}

              {/* User Menu */}
              {isAuthenticated && user ? (
                <>
                  <div className="hidden md:flex items-center gap-2 px-3 py-1.5 text-sm">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <FaUser className="w-3.5 h-3.5 text-gray-600" />
                    </div>
                    <div className="hidden lg:block">
                      <p className="font-medium text-gray-900 text-sm leading-tight">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500 capitalize leading-tight">
                        {user.role}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={logout}
                    className="hidden md:inline-flex hover:bg-red-50 hover:text-red-600 text-sm px-3"
                  >
                    <MdLogout className="w-4 h-4" />
                    <span className="hidden lg:inline ml-1">Logout</span>
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
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Slide Panel - FROM LEFT */}
          <div className="fixed top-0 left-0 h-full w-72 max-w-[85vw] bg-white shadow-2xl z-[70] md:hidden animate-slide-in-left">
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
                  to="/dashboard"
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
      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-6 right-6 p-3 bg-gray-900 text-white rounded-full shadow-lg hover:bg-gray-800 hover:shadow-xl transition-all duration-300 transform z-40 ${
          showScrollTop
            ? "translate-y-0 opacity-100"
            : "translate-y-10 opacity-0 pointer-events-none"
        }`}
        aria-label="Scroll to top"
      >
        <MdArrowUpward className="w-6 h-6" />
      </button>
    </>
  );
}
