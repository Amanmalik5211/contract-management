# Contract Management System

A dynamic, web-based Contract Management System built with **Next.js 16**, **React 19**, and **Tailwind CSS**. This application facilitates the complete lifecycle of contract management, from blueprint creation to contract generation, editing, and status tracking.

##  Technology Stack

-   **Framework**: [Next.js 16]
-   **Styling**: [Tailwind CSS v4]
-   **State Management**: [Zustand] with persistence middleware.
-   **Icons**: [Lucide React]
-   **Charts**: [Recharts]

##  Features

### 1. Blueprint Management
- **Create Blueprints**: Define reusable contract templates (Blueprints) with rich text sections, images, and form fields.
- **Dynamic Fields**: Support for various field types:
    - Text
    - Date
    - Checkbox
    - Signature
- **Section-Based Layout**: Organize contracts into logical sections for better readability.

### 2. Contract Lifecycle
- **Generate Contracts**: Instantiate new contracts from existing blueprints, inheriting structure and fields.
- **Deep Copy Architecture**: Contracts maintain their own independent copy of fields, ensuring blueprint changes don't affect existing contracts.
- **Status Workflow**: Manage contract states through a defined lifecycle:
    - `Created` → `Sent` → `Signed` → `Locked`
    - Option to `Revoke` contracts.

### 3. Interactive Contract Editing
- **Form Filling**: Fill in contract values directly within the document interface.
- **Drag-and-Drop Reordering**:
    - Rearrange fields using drag handles.
    - Robust implementation protecting input focus while dragging.
    - Works within section-based layouts.
- **Real-time Updates**: Local state management ensures smooth editing before saving.

### 4. Dashboards & Analytics
- **Dashboard**: Overview of contract stats and recent activities.
- **Status Filtering**: View contracts filtered by their current status.

##  Architecture and Design Decisions


### Key Design Decisions
1.  **Client-Side State Persistence**:
    - The application uses `zustand` with `persist` middleware to store data (Blueprints and Contracts) in `localStorage`.
    - **Rationale**: Enables a functional, persistent prototype without requiring a dedicated backend database setup.

2.  **Document Renderer Component**:
    - A unified `DocumentRenderer` component handles both the read-only view and the interactive editor.
    - **Rationale**: Reduces code duplication and ensures visual consistency between "View" and "Edit" modes.

3.  **Field Position Metadata**:
    - Fields are explicitly ordered using a `position` property (`number`).
    - **Rationale**: Ensures reliable drag-and-drop reordering that persists across renders and sessions, decoupled from array index.

4.  **Drag-and-Drop Implementation**:
    - Custom implementation using standard HTML5 Drag and Drop API.
    - **Rationale**: Avoids heavy external libraries for this specific feature while offering granular control over drag handles and drop targets.

##  Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd contract_management
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

### Running the Application

1.  **Start the development server**:
    ```bash
    npm run dev
    ```

2.  **Open in browser**:
    Navigate to [http://localhost:3000](http://localhost:3000)

##  Assumptions and Limitations

-   **Data Persistence**: Data is stored in the browser's `localStorage`. Clearing browser data will delete all blueprints and contracts.
-   **Single User**: The application is designed as a single-user client-side tool. There is no user authentication or multi-seat collaboration.
-   **File Handling**: Images for blueprints are currently handled via URL links, not file uploads.
-   **Security**: As a client-side demo, sensitive contract data is stored locally and is secure only as far as the local device is secure.

##  Project Structure

```
├── app/
│   ├── blueprints/    # Blueprint management routes
│   ├── contracts/     # Contract management routes
│   └── dashboard/     # Analytics dashboard
├── components/
│   ├── ui/            # Reusable UI components (buttons, inputs)
│   └── document-renderer.tsx # Core document rendering engine
├── lib/
│   └── store.ts       # Zustand store definition
└── types/             # TypeScript definitions
```
