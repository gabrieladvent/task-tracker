# Task Tracker

![PHP](https://img.shields.io/badge/PHP-8.3-777BB4?logo=php&logoColor=white)
![Laravel](https://img.shields.io/badge/Laravel-12.x-FF2D20?logo=laravel&logoColor=white)
![Inertia.js](https://img.shields.io/badge/Inertia.js-1.x-9553E9?logo=inertia&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-06B6D4?logo=tailwindcss&logoColor=white)
![React TS](https://img.shields.io/badge/React-Typescript-3178C6?logo=react&logoColor=white)


## Overviews
Task Tracker is a modern and structured work-management application designed for developers and teams to organize their workflow with clarity and efficiency. It helps you manage periods (sprints/months), organize projects, track tasks with priorities and story points, and generate comprehensive reports — all powered by a clean integration of Laravel 12, Inertia.js, React TypeScript, and Tailwind CSS.

This application is optimized for real-world daily usage: tracking progress, carrying over unfinished tasks, and providing insights that improve productivity over time.
## Features

### 📅 Period Management
- Create and manage work periods (sprints, months, quarters)
- View current and past periods
- Track task completion within periods
- Calendar view for easy task visualization

### 📁 Project Organization
- Create multiple projects with descriptions
- Color-coded project categories
- Search and filter projects
- View, edit, and manage project details

### ✅ Task Management
- Create tasks with priorities
- Assign tasks to projects
- Track task status
- Add story points for estimation
- Include task descriptions and notes
- Link pull requests to tasks
- Calendar and list views for tasks
- Copy incomplete tasks from previous periods

### 📊 Reports
- Generate detailed period reports
- View tasks grouped by project
- Track completed vs total tasks
- Monitor story points progress
- Export reports to Excel
- View task timelines and status

### 🔧 Tech Dev Backlog
- Separate technical development task management
- Project-specific technical tasks
- Independent from period-based tasks

## Tech Stack

- **Backend**: Laravel 12
- **Frontend**: React 18 with TypeScript
- **Routing**: Inertia.js
- **Styling**: Tailwind CSS
- **Database**: MySQL

## Installation

### Prerequisites
- PHP 8.2 or higher
- Composer
- Node.js 18+ and npm/yarn
- MySQL/PostgreSQL database

### Setup Steps

1. **Clone the repository**
```bash
git clone https://github.com/gabrieladvent/task-tracker
cd task-tracker
```

2. **Install PHP dependencies**
```bash
composer install
```

3. **Install Node dependencies**
```bash
npm install
# or
yarn install
```

4. **Configure environment**
```bash
cp .env.example .env
php artisan key:generate
```

5. **Configure database**
Edit `.env` file with your database credentials:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=task_tracker
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

6. **Run migrations**
```bash
php artisan migrate
```

7. **Build frontend assets**
```bash
npm run build
# or for development
npm run dev
```

8. **Start the development server**
```bash
php artisan serve
```

Visit `http://localhost:8000` in your browser.

## Artisan Commands

### Copy Incomplete Tasks
Copy incomplete tasks from previous day:
```bash
php artisan task:copy-incomplete --date=2025-12-12 --from-date=2025-12-11
```

### Optional Arguments

Both `--date` and `--from-date` are **optional**:

`--from-date`	Source date of the incomplete tasks. If omitted, the command automatically uses yesterday.

`--date`	Destination date where tasks will be copied. If omitted, the command automatically uses tomorrow.

### Default Behavior

If you run the command without any arguments:

```bash
php artisan task:copy-incomplete
```
### It will:

- Take incomplete tasks from yesterday 
- Copy them to tomorrow

## Development

### Running in development mode
```bash
# Terminal 1: Laravel server
php artisan serve

# Terminal 2: Vite dev server
npm run dev
```

### Building for production
```bash
npm run build
php artisan optimize
```

## Project Structure

```
├── app/
│   ├── Http/Controllers/    # Laravel controllers
│   ├── Models/              # Eloquent models
│   └── Console/Commands/    # Artisan commands
├── resources/
│   ├── js/
│   │   ├── Components/      # React components
│   │   ├── Pages/           # Inertia pages
│   │   └── types/           # TypeScript types
│   └── css/                 # Tailwind styles
├── routes/
│   └── web.php             # Application routes
└── database/
    └── migrations/          # Database migrations
```
