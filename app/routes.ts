import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("login", "routes/login.tsx"),
  route("register", "routes/register.tsx"),
  route("dashboard", "routes/tasks.tsx"),
  route("dashboard/:id", "routes/task-detail.tsx"),
  route("create-task", "routes/create-task.tsx"),
  route("edit-task/:id", "routes/edit-task.$id.tsx"),
] satisfies RouteConfig;
