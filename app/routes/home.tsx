import React, { useEffect } from "react";
import { useNavigate } from "react-router";
import { tokenService } from "../services/api";

export function meta() {
  return [
    { title: "Tugas - Task Management System" },
    { name: "description", content: "Manage your tasks efficiently" },
  ];
}

export default function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    if (tokenService.hasToken()) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  }, [navigate]);

  return null;
}
