# Contract Management System

🌐 **Live Demo**: [https://contract-management-wft1.onrender.com/](https://contract-management-wft1.onrender.com/dashboard)

A dynamic, web-based Contract Management System built with **Next.js 16**, **React 19**, and **Tailwind CSS**. This application facilitates the complete lifecycle of contract management, from blueprint creation to contract generation, editing, and status tracking with full PDF template support.

##  Technology Stack

-   **Framework**: [Next.js 16]
-   **Styling**: [Tailwind CSS v4]
-   **State Management**: [Zustand] with persistence middleware
-   **Icons**: [Lucide React]
-   **Charts**: [Recharts]
-   **PDF Processing**: [PDF.js] for rendering and [pdf-lib] for generation

##  Features

### 1. Blueprint Management

#### PDF-Based Blueprints
- **PDF Template Upload**: Create blueprints from existing PDF documents
- **Multi-Page Support**: Handle PDFs with multiple pages seamlessly
- **Visual Field Placement**: Click-to-place fields directly on PDF pages
- **Field Positioning**: Percentage-based positioning for responsive scaling

#### Text-Based Blueprints (Legacy)
- **Section-Based Layout**: Organize contracts into logical sections for better readability
- **Rich Text Support**: Define reusable contract templates with rich text sections and images

#### Field Types
Support for various field types across both PDF and text-based blueprints:
- **Text Input**: Multi-line text fields with overflow validation
- **Date Picker**: Calendar-based date selection
- **Checkbox**: Boolean selection fields
- **Signature**: Click-to-sign functionality

#### Blueprint Editing
- **Edit Mode**: Toggle between view and edit modes
- **Field Management**: Add, remove, move, and resize fields
- **Field Labeling**: Custom labels for each field
- **Overlap Detection**: Visual warnings for overlapping fields

### 2. PDF Blueprint Editor

#### Visual Field Placement
- **Click-to-Place**: Select field type and click anywhere on PDF to place
- **Drag & Drop**: Move fields by dragging with visual feedback
- **Resize Handles**: Resize fields using corner handles (touch-friendly)
- **Multi-Page Support**: Place fields on any page of multi-page PDFs

#### Field Management
- **Field Selection**: Click fields to select and edit
- **Label Editing**: Inline label editing for selected fields
- **Field Deletion**: Remove fields from list or when selected
- **Field List Panel**: View all placed fields with page and position info

#### Overlap Detection & Warnings
- **Automatic Detection**: Real-time overlap detection between fields
- **Visual Indicators**: Yellow borders and warning badges for overlapping fields
- **Placement Warnings**: Confirmation dialog when placing overlapping fields

### 3. Contract Lifecycle

#### Contract Creation
- **Blueprint Selection**: Choose from existing blueprints
- **Contract Naming**: Custom names for each contract instance
- **Field Inheritance**: Contracts inherit all fields from blueprint
- **Deep Copy Architecture**: Contracts maintain independent copies, ensuring blueprint changes don't affect existing contracts

#### Status Workflow
Manage contract states through a defined lifecycle:
- `Created` → `Approved` → `Sent` → `Signed` → `Locked`
- **Revoke Option**: Ability to revoke contracts at any stage
- **Status Transitions**: Enforced valid status transitions
- **Status Badges**: Visual indicators for current contract status

### 4. Interactive Contract Editing

#### PDF Contract Editor
- **PDF-Based Editing**: Fill contracts directly on PDF templates
- **Real-Time Rendering**: Progressive PDF page loading for performance
- **Field Overlays**: Interactive fields overlaid on PDF pages
- **Text Overflow Validation**: Prevents text from exceeding field boundaries
- **Field List Panel**: Quick navigation to all fields
- **Overflow Warnings**: Visual indicators for fields with text overflow

#### Text-Based Contract Editing (Legacy)
- **Form Filling**: Fill in contract values directly within the document interface
- **Drag-and-Drop Reordering**: Rearrange fields using drag handles
- **Input Focus Protection**: Robust implementation protecting input focus while dragging
- **Section-Based Layouts**: Works seamlessly within section-based layouts

#### Editing Features
- **Edit Mode Toggle**: Switch between view and edit modes
- **Unsaved Changes Tracking**: Visual indicators for unsaved modifications
- **Save Functionality**: Explicit save action to persist changes
- **Field Value Validation**: Real-time validation of field inputs

### 5. PDF Generation & Download

#### PDF Export
- **Generate PDF**: Create downloadable PDFs with filled field values
- **Field Rendering**: Accurate positioning of field values on PDF
- **Text Wrapping**: Automatic text wrapping within field boundaries
- **Multi-Page Support**: Preserves all pages from original PDF template
- **Typography Matching**: Consistent typography with PDF template

#### Download Features
- **Download Warnings**: Pre-download validation for overlapping fields and unfilled required fields
- **Safe Filenames**: Automatic filename sanitization
- **Progress Indicators**: Loading states during PDF generation

### 6. Dashboard & Analytics

#### KPI Cards
- **Contract Statistics**: Total contracts, active contracts, signed contracts
- **Blueprint Statistics**: Total blueprints and field counts
- **Real-Time Updates**: Live statistics reflecting current data

#### Analytics Graphs
- **Status Distribution**: Visual breakdown of contracts by status
- **Timeline Analysis**: Contract creation trends over time
- **Field Type Distribution**: Analysis of field types across blueprints

#### Search & Filtering
- **Multi-Status Filtering**: Filter contracts by multiple statuses simultaneously
- **Field Type Filtering**: Filter blueprints by field types
- **Search Functionality**: Search contracts and blueprints by name
- **View Toggle**: Switch between contract and blueprint views

#### Contract Management
- **Quick Actions**: View, edit, delete, and status change from dashboard
- **Bulk Operations**: Efficient management of multiple contracts
- **Delete Confirmation**: Safe deletion with confirmation dialogs

### 7. User Interface Features

#### Responsive Design
- **Mobile-First**: Fully responsive design for all screen sizes
- **Touch Support**: Touch-friendly drag and resize handles
- **Adaptive Layouts**: Layouts adapt to screen size

#### Loading States
- **Progressive Loading**: Progressive PDF page rendering
- **Loading Indicators**: Clear loading states throughout the application
- **Error Handling**: User-friendly error messages

#### Toast Notifications
- **Success Messages**: Confirmation for successful operations
- **Error Messages**: Clear error notifications
- **Warning Messages**: Storage quota and validation warnings

##  Workflow

### Creating a Blueprint

1. **Navigate to Blueprints**: Go to `/blueprints` page
2. **Choose Blueprint Type**:
   - **PDF-Based**: Upload a PDF template and place fields visually
   - **Text-Based**: Create sections and add fields manually
3. **For PDF Blueprints**:
   - Upload PDF file (supports multi-page PDFs)
   - Enter blueprint name
   - Click "Add Field" and select field type
   - Click on PDF to place fields
   - Drag to reposition, use resize handles to adjust size
   - Edit field labels inline
   - Save blueprint
4. **For Text-Based Blueprints**:
   - Enter blueprint name
   - Add fields with labels and types
   - Organize into sections (optional)
   - Save blueprint

### Creating a Contract

1. **Navigate to Contracts**: Go to `/contracts` page
2. **Select Blueprint**: Choose from existing blueprints
3. **Enter Contract Name**: Provide a unique name for the contract
4. **Review Blueprint Preview**: See field count and types
5. **Create Contract**: Click "Create Contract" to instantiate
6. **Auto-Navigate**: Automatically opens contract in edit mode

### Editing a Contract

1. **Open Contract**: Navigate to contract detail page
2. **Enter Edit Mode**: Click "Edit" button (only available for "Created" status)
3. **Fill Fields**:
   - **PDF Contracts**: Fill fields directly on PDF overlay
   - **Text Contracts**: Fill fields in form layout
4. **Text Overflow Protection**: System prevents text from exceeding field boundaries
5. **Save Changes**: Click "Update" to save modifications
6. **View Mode**: Exit edit mode to see read-only view

### Managing Contract Status

1. **View Contract**: Open contract detail page
2. **Status Badge**: Current status displayed prominently
3. **Change Status**: Click status badge or use dashboard quick actions
4. **Valid Transitions**: System enforces valid status workflow
5. **Status Options**:
   - `Created` → Can be edited
   - `Approved` → Ready to send
   - `Sent` → Awaiting signature
   - `Signed` → Contract executed
   - `Locked` → Final state, no further edits
   - `Revoked` → Contract cancelled

### Downloading Contracts

1. **Open Contract**: Navigate to contract detail page
2. **Check Status**: Ensure contract is in appropriate status
3. **Click Download**: Use download button
4. **Review Warnings**: System shows warnings for:
   - Overlapping fields
   - Unfilled required fields
5. **Generate PDF**: System generates PDF with filled values
6. **Download File**: PDF downloads with sanitized filename

### Dashboard Management

1. **View Dashboard**: Navigate to `/dashboard`
2. **View KPIs**: See contract and blueprint statistics
3. **Analyze Graphs**: Review status distribution and trends
4. **Filter & Search**:
   - Toggle between contracts and blueprints
   - Filter by status or field type
   - Search by name
5. **Quick Actions**: View, edit, delete, or change status directly from dashboard

##  Architecture and Design Decisions

### Key Design Decisions

1.  **Client-Side State Persistence**:
    - The application uses `zustand` with `persist` middleware to store data (Blueprints and Contracts) in `localStorage`.
    - **Smart Storage Management**: Automatic cleanup of large base64 data and old items to prevent quota errors
    - **Rationale**: Enables a functional, persistent prototype without requiring a dedicated backend database setup.

2.  **Dual Rendering System**:
    - **PDF Contract Editor**: For PDF-based contracts with visual field overlays
    - **Document Renderer**: For text-based contracts with section layouts
    - **Rationale**: Supports both legacy text-based workflows and modern PDF-based templates.

3.  **Field Position Metadata**:
    - Fields use percentage-based positioning (`x`, `y`, `width`, `height` as percentages)
    - Fields are explicitly ordered using a `position` property (`number`)
    - **Rationale**: Ensures reliable positioning that scales with PDF rendering and persists across sessions.

4.  **Progressive PDF Rendering**:
    - PDF pages render progressively, one at a time
    - Yields to event loop between page renders
    - **Rationale**: Prevents UI blocking and provides better user experience for large PDFs.

5.  **Text Overflow Validation**:
    - Real-time validation prevents text from exceeding field boundaries
    - State-locked overflow tracking (updated only in input handlers)
    - **Rationale**: Ensures downloaded PDFs maintain proper formatting and field boundaries.

6.  **Pointer Events for Drag & Resize**:
    - Uses Pointer Events API instead of Mouse Events
    - **Rationale**: Provides unified support for both mouse and touch interactions.

7.  **Overlap Detection**:
    - Real-time overlap detection between fields on same page
    - Visual warnings without blocking placement
    - **Rationale**: Helps users identify potential layout issues while maintaining flexibility.

8.  **PDF Generation Strategy**:
    - Uses `pdf-lib` to modify existing PDFs rather than creating from scratch
    - Preserves original PDF structure and formatting
    - **Rationale**: Maintains fidelity to original template while adding field values.

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

-   **Data Persistence**: 
    - Data is stored in the browser's `localStorage` with automatic quota management
    - Large base64 PDF data is automatically removed to prevent quota errors
    - Clearing browser data will delete all blueprints and contracts
    - Storage is limited to ~4MB with automatic cleanup of old items

-   **Single User**: 
    - The application is designed as a single-user client-side tool
    - There is no user authentication or multi-seat collaboration
    - No real-time synchronization between devices

-   **PDF Handling**: 
    - PDFs can be uploaded via file input or URL
    - Base64-encoded PDFs are not persisted in localStorage (too large)
    - PDF URLs must be accessible from the client (CORS-enabled)

-   **Security**: 
    - As a client-side demo, sensitive contract data is stored locally
    - Security is only as strong as the local device security
    - No encryption of stored data
    - No server-side validation or authentication

-   **Browser Compatibility**: 
    - Requires modern browsers with localStorage support
    - PDF.js requires browsers with Canvas API support
    - Touch devices supported via Pointer Events API

##  Project Structure

```
├── app/
│   ├── blueprints/
│   │   ├── [id]/          # Blueprint detail and edit page
│   │   └── page.tsx       # Blueprint creation page
│   ├── contracts/
│   │   ├── [id]/          # Contract detail and edit page
│   │   ├── new/           # New contract creation
│   │   └── page.tsx       # Contracts listing page
│   ├── dashboard/         # Analytics dashboard
│   └── page.tsx           # Landing page
│
├── components/
│   ├── blueprints/
│   │   ├── blueprint-card.tsx      # Blueprint card component
│   │   └── blueprint-form.tsx      # Blueprint creation form
│   ├── contracts/
│   │   └── contract-card.tsx       # Contract card component
│   ├── dashboard/
│   │   ├── contracts-list-section.tsx
│   │   ├── dashboard-graphs-section.tsx
│   │   └── kpi-cards.tsx
│   ├── pdf-blueprint-editor.tsx    # PDF field placement editor
│   ├── pdf-contract-editor/
│   │   ├── constants.ts            # PDF typography constants
│   │   ├── contract-page-row.tsx  # PDF page rendering
│   │   ├── fields-list-panel.tsx  # Fields navigation panel
│   │   ├── overflow-warning-banner.tsx
│   │   ├── pdf-utils.ts            # PDF.js utilities
│   │   ├── types.ts                # Type definitions
│   │   └── validation.ts           # Text overflow validation
│   ├── pdf-contract-editor.tsx    # Main PDF contract editor
│   ├── pdf-viewer.tsx             # PDF viewer component
│   ├── document-renderer.tsx      # Text-based document renderer
│   ├── shared/
│   │   ├── delete-confirmation-dialog.tsx
│   │   ├── page-layout.tsx
│   │   └── search-and-filter.tsx
│   └── ui/                        # Reusable UI components
│
├── lib/
│   ├── contract-pdf-layout.ts     # PDF layout constants
│   ├── contract-utils.ts          # Contract status utilities
│   ├── generate-contract-pdf.ts   # PDF generation logic
│   ├── store.ts                   # Zustand store with persistence
│   └── utils.ts                   # General utilities
│
└── types/
    ├── blueprint.d.ts             # Blueprint type definitions
    ├── contract.d.ts              # Contract type definitions
    └── field.d.ts                 # Field type definitions
```

##  Key Components

### PDF Blueprint Editor (`components/pdf-blueprint-editor.tsx`)
- Visual editor for placing fields on PDF templates
- Drag and drop field positioning
- Resize handles for field dimensions
- Overlap detection and warnings
- Field type selection and placement

### PDF Contract Editor (`components/pdf-contract-editor.tsx`)
- Interactive contract filling on PDF templates
- Progressive PDF page rendering
- Text overflow validation
- Field list panel for navigation
- Real-time field value updates

### Contract PDF Generator (`lib/generate-contract-pdf.ts`)
- Generates PDFs with filled field values
- Text wrapping within field boundaries
- Multi-page PDF support
- Overlap detection and warnings
- Typography matching with template

### Store (`lib/store.ts`)
- Zustand-based state management
- localStorage persistence with quota management
- Automatic cleanup of large data
- Date serialization/deserialization
