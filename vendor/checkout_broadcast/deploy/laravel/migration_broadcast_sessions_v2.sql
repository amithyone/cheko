-- Session lifecycle for Pay at Shop (open until paid/cancelled)
-- Replaces one-shot replay consume with status tracking.

CREATE TABLE IF NOT EXISTS broadcast_sessions (
    session_uuid CHAR(36) PRIMARY KEY,
    terminal_id VARCHAR(64) NOT NULL,
    status ENUM('open', 'paid', 'cancelled') NOT NULL DEFAULT 'open',
    amount_kobo INT UNSIGNED NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    INDEX idx_broadcast_sessions_terminal_status (terminal_id, status),
    CONSTRAINT fk_broadcast_sessions_terminal_v2
        FOREIGN KEY (terminal_id) REFERENCES broadcast_terminals(terminal_id)
);

-- Optional: drop legacy replay-only table after migration
-- DROP TABLE IF EXISTS broadcast_used_sessions;
