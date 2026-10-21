
BEGIN;

CREATE TABLE departments (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE users (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'STUDENT'
        CHECK (role IN ('STUDENT', 'STAFF', 'ADMIN')),
    department_id BIGINT REFERENCES departments(id),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE locations (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    building VARCHAR(120) NOT NULL,
    floor VARCHAR(40),
    room VARCHAR(60),
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE categories (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    default_department_id BIGINT REFERENCES departments(id),
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE complaints (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    public_id UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category_id BIGINT NOT NULL REFERENCES categories(id),
    location_id BIGINT NOT NULL REFERENCES locations(id),
    submitted_by BIGINT NOT NULL REFERENCES users(id),
    assigned_department_id BIGINT REFERENCES departments(id),
    assigned_staff_id BIGINT REFERENCES users(id),
    status VARCHAR(20) NOT NULL DEFAULT 'SUBMITTED'
        CHECK (status IN (
            'SUBMITTED', 'REVIEWED', 'ASSIGNED',
            'IN_PROGRESS', 'RESOLVED', 'REJECTED'
        )),
    severity VARCHAR(20) NOT NULL DEFAULT 'MEDIUM'
        CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    priority_score INTEGER NOT NULL DEFAULT 0
        CHECK (priority_score BETWEEN 0 AND 100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    CHECK (
        assigned_staff_id IS NULL OR assigned_department_id IS NOT NULL
    )
);

CREATE TABLE assignments (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    complaint_id BIGINT NOT NULL REFERENCES complaints(id),
    department_id BIGINT NOT NULL REFERENCES departments(id),
    staff_id BIGINT REFERENCES users(id),
    assigned_by BIGINT NOT NULL REFERENCES users(id),
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    notes TEXT
);

CREATE TABLE complaint_status_history (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    complaint_id BIGINT NOT NULL REFERENCES complaints(id),
    old_status VARCHAR(20),
    new_status VARCHAR(20) NOT NULL
        CHECK (new_status IN (
            'SUBMITTED', 'REVIEWED', 'ASSIGNED',
            'IN_PROGRESS', 'RESOLVED', 'REJECTED'
        )),
    changed_by BIGINT NOT NULL REFERENCES users(id),
    notes TEXT,
    changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE resolutions (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    complaint_id BIGINT NOT NULL UNIQUE REFERENCES complaints(id),
    resolved_by BIGINT NOT NULL REFERENCES users(id),
    resolution_notes TEXT NOT NULL,
    resolved_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE feedback (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    complaint_id BIGINT NOT NULL UNIQUE REFERENCES complaints(id),
    submitted_by BIGINT NOT NULL REFERENCES users(id),
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comments TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_complaints_status
    ON complaints(status);

CREATE INDEX idx_complaints_priority
    ON complaints(priority_score DESC, created_at ASC);

CREATE INDEX idx_complaints_submitter
    ON complaints(submitted_by, created_at DESC);

CREATE INDEX idx_complaints_staff
    ON complaints(assigned_staff_id, status);

CREATE INDEX idx_complaints_department
    ON complaints(assigned_department_id, status);

CREATE INDEX idx_complaints_category
    ON complaints(category_id);

CREATE INDEX idx_history_complaint_time
    ON complaint_status_history(complaint_id, changed_at DESC);

CREATE INDEX idx_assignments_complaint
    ON assignments(complaint_id, assigned_at DESC);

CREATE INDEX idx_users_department_role
    ON users(department_id, role);

CREATE VIEW complaint_summary AS
SELECT
    c.id,
    c.public_id,
    c.title,
    c.status,
    c.severity,
    c.priority_score,
    c.created_at,
    u.full_name AS submitted_by_name,
    cat.name AS category_name,
    d.name AS department_name,
    l.building,
    l.floor,
    l.room
FROM complaints c
JOIN users u ON u.id = c.submitted_by
JOIN categories cat ON cat.id = c.category_id
JOIN locations l ON l.id = c.location_id
LEFT JOIN departments d ON d.id = c.assigned_department_id;

COMMIT;
