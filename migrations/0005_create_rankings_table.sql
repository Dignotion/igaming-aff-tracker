-- Migration number: 0005 	 2024-01-08T10:03:00.000Z
CREATE TABLE IF NOT EXISTS rankings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    list_id INTEGER NOT NULL,
    brand_id INTEGER NOT NULL,
    rank INTEGER NOT NULL,
    rating TEXT,
    bonus_offer TEXT,
    scraped_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (list_id) REFERENCES lists(id),
    FOREIGN KEY (brand_id) REFERENCES brands(id)
);
