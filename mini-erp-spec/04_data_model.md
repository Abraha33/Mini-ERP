# Mini ERP — Data Model

## Modeling rules

- Use **flat collections**
- Keep documents small
- Reference related records by ID
- Use append/update history instead of destructive edits

---

## Main collections

- `users`
- `cash_registers`
- `cash_count_templates`
- `movements`
- `purchases`
- `purchase_orders`
- `tasks`
- `task_sessions`
- `task_evidences`
- `transfers`
- `payroll_entries`
- `audit_events`
- `alerts`
- `suppliers`
- `products`
- `locations`

---

## Collection guide

## `users/{userId}`

### Purpose

- identity + operational roles

### Example

```json
{
  "display_name": "Laura Diaz",
  "email": "laura@empresa.com",
  "roles": ["CAJERO", "EMPLEADO"],
  "status": "ACTIVO",
  "created_at": "2026-04-20T10:00:00Z"
}
```

---

## `cash_registers/{cashRegisterId}`

### Purpose

- one operational cash cycle

### Example

```json
{
  "cashier_user_id": "user_123",
  "location_id": "loc_pos_mesa_nina",
  "status": "ABIERTA",
  "opened_at": "2026-04-20T08:00:00Z",
  "closed_at": null,
  "opening_base_total": 180000,
  "opening_coins_total": 30000,
  "opening_bills_total": 150000,
  "expected_total": 0,
  "counted_total": 0,
  "difference_total": 0,
  "difference_level": null,
  "closure_responsible_user_id": null,
  "audited_by_user_id": null
}
```

---

## `movements/{movementId}`

### Purpose

- auditable financial history

### Example

```json
{
  "type": "GASTO",
  "status": "ACTIVO",
  "amount": 25000,
  "currency": "COP",
  "user_id": "user_123",
  "cash_register_id": "cash_001",
  "reference_type": "PURCHASE",
  "reference_id": "purchase_001",
  "requires_evidence": true,
  "evidence_count": 1,
  "created_at": "2026-04-20T11:00:00Z"
}
```

---

## `purchase_orders/{purchaseOrderId}`

### Purpose

- expected purchase before invoice

### Example

```json
{
  "supplier_id": "sup_001",
  "created_by_user_id": "user_123",
  "status": "PENDIENTE",
  "payment_method": "EFECTIVO",
  "line_items": [
    {
      "product_id": "prod_001",
      "expected_qty": 10,
      "expected_unit_price": 5000
    }
  ],
  "created_at": "2026-04-20T12:00:00Z"
}
```

---

## `purchases/{purchaseId}`

### Purpose

- invoice registration + validation result

### Example

```json
{
  "purchase_order_id": "po_001",
  "supplier_id": "sup_001",
  "invoice_number": "FAC-8821",
  "invoice_total": 55000,
  "status": "VALIDADA",
  "paid_from_cash": true,
  "validated_by_user_id": "admin_001",
  "evidence_image_urls": [
    "https://storage.example/invoice-1.jpg"
  ],
  "created_at": "2026-04-20T13:00:00Z"
}
```

---

## `tasks/{taskId}`

### Purpose

- operational work assignment

### Example

```json
{
  "title": "Arreglar zona de bodega",
  "description": "Etiquetar, desempolvar y empaquetar",
  "assigned_user_id": "user_456",
  "created_by_user_id": "admin_001",
  "status": "PENDIENTE",
  "mandatory": true,
  "requires_evidence": true,
  "allow_multiple_images": true,
  "location_id": "loc_bodega",
  "due_at": "2026-04-25T18:00:00Z",
  "created_at": "2026-04-20T08:00:00Z"
}
```

---

## `task_sessions/{taskSessionId}`

### Purpose

- automatic time tracking

### Example

```json
{
  "task_id": "task_001",
  "user_id": "user_456",
  "started_at": "2026-04-20T09:00:00Z",
  "paused_at": "2026-04-20T11:00:00Z",
  "resumed_at": "2026-04-21T08:30:00Z",
  "ended_at": "2026-04-21T10:00:00Z",
  "status": "FINALIZADA"
}
```

---

## `task_evidences/{taskEvidenceId}`

### Purpose

- store task evidence metadata

### Example

```json
{
  "task_id": "task_001",
  "uploaded_by_user_id": "user_456",
  "image_urls": [
    "https://storage.example/task-1.jpg",
    "https://storage.example/task-2.jpg"
  ],
  "note": "Zona organizada y etiquetada",
  "created_at": "2026-04-21T10:02:00Z"
}
```

---

## `transfers/{transferId}`

### Purpose

- operational transfer request, approval and execution

### Example

```json
{
  "requested_by_user_id": "user_456",
  "approved_by_user_id": "admin_001",
  "executed_by_user_id": "user_123",
  "origin_location_id": "loc_bodega",
  "destination_location_id": "loc_pos_mesa_nina",
  "status": "APROBADO",
  "items": [
    {
      "product_id": "prod_001",
      "qty": 5
    }
  ],
  "created_at": "2026-04-20T14:00:00Z"
}
```

---

## `payroll_entries/{payrollEntryId}`

### Purpose

- payroll visible to employee and auditable in finance

### Example

```json
{
  "employee_user_id": "user_456",
  "period_label": "2026-Q2-1",
  "type": "PAGO",
  "amount": 350000,
  "movement_id": "mov_889",
  "created_by_user_id": "admin_001",
  "created_at": "2026-04-20T16:00:00Z"
}
```

---

## `audit_events/{auditEventId}`

### Purpose

- register admin interventions

### Example

```json
{
  "type": "CASH_DIFFERENCE_AUDIT",
  "target_id": "cash_001",
  "performed_by_user_id": "admin_001",
  "responsible_user_id": "user_123",
  "reason": "Critical difference over threshold",
  "pin_validated": true,
  "created_at": "2026-04-20T18:10:00Z"
}
```

---

## `alerts/{alertId}`

### Purpose

- visible operational warnings

### Example

```json
{
  "type": "MANDATORY_TASK_PENDING",
  "severity": "MEDIUM",
  "status": "OPEN",
  "target_type": "TASK",
  "target_id": "task_001",
  "assigned_to_role": "ADMIN",
  "created_at": "2026-04-20T18:00:00Z"
}
```

---

## Optional future collections

- `zones`
- `shelves`
- `bins`

Use them later when warehouse mapping becomes operationally necessary.

---

## Relationships summary

- `cash_registers` → referenced by `movements`
- `movements` → referenced by `purchases` and `payroll_entries`
- `tasks` → referenced by `task_sessions` and `task_evidences`
- `transfers` → may create `movements` when financially relevant
- `alerts` → point to tasks, cash registers, purchases or transfers
