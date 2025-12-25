# Tugas - Task Management System (Frontend)

A modern, elegant, and lightweight task management system frontend built with React, TypeScript, and Tailwind CSS.

## ✨ Features

- **Clean & Elegant Design**: Minimalist white interface with smooth interactions
- **Role-Based Access**: Different views for teachers (guru) and students (siswa)
- **Task Management**: Create, view, and submit tasks
- **Real-time Status**: Track task submission status
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Type-Safe**: Full TypeScript support
- **Centralized API**: Service layer for all backend communication

## 🎯 User Roles

### Guru (Teacher)

- Create and manage tasks
- View student submissions
- Grade assignments
- Send reminders to students
- View submission statistics

### Siswa (Student)

- View assigned tasks
- Submit work (online or direct)
- Track submission status
- View grades (if enabled by teacher)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository

```bash
git clone <repository-url>
cd fe
```

2. Install dependencies

```bash
npm install
```

3. Setup environment variables

```bash
cp .env.example .env.local
```

4. Update `.env.local` with your API URL

```
VITE_API_URL=http://localhost:8000/api
```

5. Start development server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 📖 Pages

### Authentication

- **Login** (`/login`) - User authentication
- **Register** (`/register`) - New user registration (students only)

### Tasks

- **Tasks List** (`/tasks`) - View all tasks
- **Task Detail** (`/tasks/:id`) - View task details and submit
- **Create Task** (`/create-task`) - Create new task (guru only)

## 🏗️ Project Structure

```
app/
├── components/          # Reusable UI components
├── hooks/              # Custom React hooks
├── services/           # API service layer
├── routes/             # Page components
└── welcome/            # Welcome component
```

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed architecture documentation.

## 🎨 Design

### Color Scheme

- **Primary**: Gray-900 (dark gray/black)
- **Background**: White
- **Accents**: Green (success), Red (error), Blue (info), Yellow (warning)

### Typography

- Font: Inter (Google Fonts)
- Clean, readable hierarchy

### Components

- Minimal shadows and borders
- Smooth transitions
- Accessible focus states

## 🔐 Authentication

The application uses JWT tokens for authentication:

1. User logs in with username and password
2. Token is stored in localStorage
3. Token is sent with every API request
4. Automatic redirect to login if token is invalid

## 📡 API Integration

All API calls go through the centralized service layer (`app/services/api.ts`):

```typescript
import { authService, taskService } from "../services/api";

// Login
const response = await authService.login({ username, password });

// Get tasks
const tasks = await taskService.getTasks();

// Create task
const newTask = await taskService.createTask(taskData);
```

See [API Documentation](../be/API_DOCUMENTATION.md) for complete API reference.

## 🛠️ Development

### Build

```bash
npm run build
```

### Type Check

```bash
npm run typecheck
```

### Start Production Server

```bash
npm start
```

## 📦 Dependencies

- **react** (^19.2.1) - UI library
- **react-router** (7.10.1) - Routing
- **tailwindcss** (^4.1.13) - Styling
- **typescript** (^5.9.2) - Type safety
- **vite** (^7.1.7) - Build tool

## 🎯 Best Practices

1. **Always use the API service layer** - Don't make direct fetch calls
2. **Type everything** - Use TypeScript interfaces for all data
3. **Handle errors gracefully** - Show user-friendly error messages
4. **Show loading states** - Provide feedback during async operations
5. **Validate inputs** - Validate on client before sending to server
6. **Use components** - Reuse components instead of duplicating code
7. **Keep it simple** - Minimize complexity, maximize clarity

## 🔧 Troubleshooting

### API Connection Issues

- Check if backend is running on the correct port
- Verify `VITE_API_URL` in `.env.local`
- Check browser console for CORS errors

### Authentication Issues

- Clear localStorage and try logging in again
- Check if token is being saved correctly
- Verify backend is returning valid JWT tokens

### Styling Issues

- Ensure Tailwind CSS is properly configured
- Clear browser cache
- Rebuild the project

## 📝 Environment Variables

```
VITE_API_URL    # Backend API URL (default: http://localhost:8000/api)
```

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

This project is part of the PKL (Praktik Kerja Lapangan) program.

## 📞 Support

For issues or questions, please contact the development team.

---

**Built with ❤️ using React, TypeScript, and Tailwind CSS**
