CREATE TABLE IF NOT EXISTS order_requests (
  order_id TEXT PRIMARY KEY,
  captured_at TEXT NOT NULL,
  requested_at TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  shipping_address TEXT NOT NULL,
  total_cents INTEGER NOT NULL,
  item_count INTEGER NOT NULL,
  payload_json TEXT NOT NULL,
  source_origin TEXT NOT NULL,
  merchant_notification_status TEXT NOT NULL DEFAULT 'pending',
  customer_notification_status TEXT NOT NULL DEFAULT 'pending',
  merchant_notification_attempts INTEGER NOT NULL DEFAULT 0,
  customer_notification_attempts INTEGER NOT NULL DEFAULT 0,
  merchant_notification_error TEXT NOT NULL DEFAULT '',
  customer_notification_error TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_order_requests_captured_at
  ON order_requests (captured_at DESC);

CREATE INDEX IF NOT EXISTS idx_order_requests_notifications
  ON order_requests (merchant_notification_status, customer_notification_status);
