# memory.layer

Personal memory layer — a local-first dashboard for storing, organizing, and reviewing the memories that shape your AI conversations.

## Features
- **Overview** — memory health score, pending AI suggestions, recent activity
- **All memories** — searchable, filterable library with bulk actions
- **Suggestions Center** — approve, edit, merge, or dismiss AI suggestions
- **Projects & Folders** — organize context by project or category
- **Memory Map** — visual graph of memories and shared-tag connections
- **Timeline & Activity** — event history, usage, conflicts, version restore
- **Integrations** — connect ChatGPT, Claude, Gemini, Perplexity
- **Privacy & Settings** — local storage, cloud sync toggle, export/backup, gradient themes

## Tech
### Frontend
React 19, Vite, Framer Motion, Lucide React, local-first (localStorage)

### Backend
Spring Boot 3.3.0, Java 17, Spring Data JPA, PostgreSQL, Flyway migrations

## Scripts

### Frontend
- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run lint` — run oxlint
- `npm run preview` — preview production build

### Backend (in `backend/` directory)
- `./mvnw compile` — compile backend
- `./mvnw test` — run backend tests
- `./mvnw package` — build backend JAR

## Data

### Frontend
All memories, folders, suggestions, activity, and settings persist in `localStorage` under `ml-*` keys. Nothing leaves your device unless you enable cloud sync or export.

### Backend
Memories are stored in PostgreSQL via Spring Data JPA. Database schema is managed by Flyway migrations.

## Backend Setup

### Prerequisites
- Java 17 or later
- Maven 3.9+ (or use Maven Wrapper)
- PostgreSQL 15+ (or use Docker Compose)

### Quick Start with Docker
```bash
cd backend
cp .env.example .env   # edit .env with your values
docker-compose up -d   # starts PostgreSQL + backend
```

### Manual Start
1. Start PostgreSQL (locally or via Docker)
2. Copy `backend/.env.example` to `backend/.env` and edit values
3. Run the backend:
   ```bash
   cd backend
   ./mvnw spring-boot:run
   ```

The API will be available at `http://localhost:8080/api/memories`.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/memories` | List all memories |
| GET | `/api/memories/{id}` | Get a single memory |
| POST | `/api/memories` | Create a memory |
| PUT | `/api/memories/{id}` | Update a memory |
| DELETE | `/api/memories/{id}` | Delete a memory |
| POST | `/api/memories/{id}/approve` | Approve (enable) a memory |
| POST | `/api/memories/{id}/reject` | Reject (disable) a memory |

### Example: Create a memory
```bash
curl -X POST http://localhost:8080/api/memories \
  -H "Content-Type: application/json" \
  -d '{"title":"My memory","details":"Some details","categoryId":"learning","source":"USER_ADDED"}'
```

### Example: Get all memories
```bash
curl http://localhost:8080/api/memories
```

## Architecture

| Layer | Purpose |
|-------|---------|
| **Controller** (`MemoryController`) | Handles HTTP requests/responses, maps URLs to service methods |
| **Service** (`MemoryService`) | Business logic: validation, versioning, status transitions |
| **Repository** (`MemoryRepository`) | Database access via Spring Data JPA |
| **Entity** (`MemoryEntity`) | JPA-mapped database table representation |
| **DTO** (`MemoryDTO`, `MemoryRequestDTO`) | Data transfer shapes — internal entities are never exposed directly |
| **Migration** (`V1__create_memories_table.sql`) | Flyway SQL migration creating the `memories` table |

