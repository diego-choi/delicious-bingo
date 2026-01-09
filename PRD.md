# Product Requirements Document (PRD): Delicious Bingo

## 1. Project Summary
- **Project Name:** Delicious Bingo (맛집 도장깨기 빙고)
- **Concept:** A mobile web application where food enthusiasts (e.g., Pyongyang Naengmyeon fans) complete a 5x5 bingo board by visiting specific restaurants and leaving reviews.
- **Core Value:** Gamification of food tours, achievement tracking through bingo, and community-based restaurant discovery.

## 2. Tech Stack (Confirmed)
- **Backend:** Python 3.10+ / Django 4.2+ (Django REST Framework)
- **Frontend:** React.js / Tailwind CSS
- **Database:** PostgreSQL (Supabase recommended)
- **Maps API:** Kakao Maps API (Local & Maps)
- **Infrastructure:** Vercel (FE), Fly.io/Heroku (BE), Supabase (Storage/DB)

## 3. Database Schema (Django Models)

### 3.1. Infrastructure
- **Category:** `name`, `description`
- **Restaurant:** - `category` (FK), `name`, `address`
    - `latitude`, `longitude`, `kakao_place_id`, `place_url`
    - `is_approved` (Admin approval required for user-suggested items)
    - `created_by` (User FK)

### 3.2. Bingo Logic (Template & Instance)
- **BingoTemplate:** `category`, `title`, `description` (Operated by Admin)
- **BingoTemplateItem:** - `template` (FK), `restaurant` (FK)
    - `position` (Integer, 0-24 for 5x5 grid placement)
- **BingoBoard (User Challenge):** - `user` (FK), `template` (FK)
    - `target_line_count` (User-defined difficulty: 1, 3, or 25)
    - `is_completed` (Boolean), `created_at`, `completed_at`

### 3.3. Content
- **Review:** - `user` (FK), `bingo_board` (FK), `restaurant` (FK)
    - `image` (Required), `content` (Min 10 chars), `rating`, `visited_date`
    - `is_public` (Boolean, default: True)

## 4. Key Functional Requirements

### 4.1. Admin Tools (P0)
- Interface to manage `BingoTemplate` and assign 25 `Restaurants` to specific `positions`.
- Approval system for user-submitted `Restaurant` data.

### 4.2. Bingo Gameplay (P0)
- **Initialization:** Copy template structure to a user's `BingoBoard` instance.
- **5x5 Grid UI:** Display restaurant name/info on each cell.
- **State Check:** A cell is "Activated" if a `Review` exists for that `restaurant` within that specific `BingoBoard`.
- **Bingo Logic:** Check horizontal, vertical, and diagonal lines for completion based on `target_line_count`.

### 4.3. User Features (P1)
- **Map Integration:** Show restaurant location using Kakao Maps when a cell is clicked.
- **Ranking:** Leaderboard based on `completed_at - created_at` (Time attack) and total bingo count.

## 5. Implementation Guide

### Step 1: Backend Initialization
1. Create Django project and `api` app.
2. Implement models as defined in Section 3.
3. Configure `django-cors-headers` to allow React frontend.
4. Register all models to `admin.py` for easy data management.

### Step 2: API Endpoints
- `GET /api/templates/`: List available bingo templates.
- `POST /api/boards/`: Start a new bingo challenge.
- `GET /api/boards/<int:id>/`: Get 5x5 grid data with review status for each cell.
- `POST /api/reviews/`: Submit a review (image/text) to unlock a cell.

### Step 3: Frontend Development
- Initialize React with Tailwind CSS.
- Create `BingoGrid` component using `grid-cols-5`.
- Implement `ReviewModal` for data entry.
- Integrate Kakao Maps SDK for restaurant location display.
