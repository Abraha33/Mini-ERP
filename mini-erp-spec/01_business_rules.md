# Mini ERP — Business Rules

## System nature

- This is an **operational ERP**, not a passive dashboard.
- The system must optimize execution, control and audit trail.
- Every critical action must have:
  - user
  - timestamp
  - status
  - traceable reference

---

## Core business rules

## 1. Cash is the financial center

- Cash register is the operational financial center.
- Any money that enters or leaves operational cash must be recorded.
- Cash balance is the result of movements, not a manually editable field.

## 2. All financial actions generate movements

- Every cash-impacting action generates a document in **movements**.
- Required movement types:
  - `GASTO`
  - `INGRESO`
  - `COMPRA`
  - `NOMINA`
  - `TRANSFERENCIA`
  - `AJUSTE` when correction is needed

## 3. No hard delete

- Records are never deleted from the operational flow.
- Invalidated records use:
  - `status = "ANULADO"`
- The original record must remain auditable.

## 4. Responsibility is never lost

- Every action must have a responsible user.
- Cash closure responsibility always belongs to the **CAJERO** who operated the shift.
- If admin intervenes with PIN:
  - admin acts as auditor/authorizer
  - responsibility of the cash closure does **not** move from cajero to admin

## 5. Evidence is mandatory when required

- Evidence is required for:
  - critical tasks
  - purchases
  - expenses
  - transfers
  - any movement configured as auditable
- Evidence can include:
  - one or multiple images
  - note
  - reference number
  - supporting file metadata

---

## Cash rules

## 1. Open cash register

- Only one active cash register per cashier / point / shift context.
- Opening always stores:
  - opening base total
  - coin breakdown
  - bill breakdown
  - source of base

## 2. Close cash register

- Closing requires:
  - expected balance summary
  - physical count
  - difference calculation
  - explicit confirmation
- Cash counting must be split into:
  - coins
  - bills

## 3. Cash difference policy

### Difference levels

- `0 – 5,000` → `LOW`
  - allow close
- `5,001 – 20,000` → `MEDIUM`
  - allow close
  - generate admin alert
- `20,001+` → `CRITICAL`
  - block close
  - require admin PIN authorization

### Rule

- Differences never rewrite history.
- If correction is needed, the system creates an auditable adjustment path.

## 4. Cash closure result

- Every closure generates:
  - closure record
  - final counted totals
  - difference level
  - audit info when applicable
  - printable receipt / final strip inspired by daily Z report

---

## Movement rules

- Every movement must store:
  - `user_id`
  - `timestamp`
  - `type`
  - `amount`
  - `status`
  - `cash_register_id` when applicable
  - `reference_id`
  - `evidence` when required

- Transfers also generate movements.
- Transfer-based sales affect financial balance and must be traceable in history.
- Purchases paid from cash affect cash immediately.

---

## Task rules

## 1. Tasks are operational

- Tasks are part of the operation, not optional notes.
- Tasks must use these states:
  - `PENDIENTE`
  - `EN_PROCESO`
  - `COMPLETADA`
  - `VENCIDA`

## 2. Task assignment

- Every task must have:
  - assigned user
  - creator user
  - due date or due window
  - evidence policy

## 3. Task execution

- Tasks can:
  - start
  - pause
  - continue
  - finish
- Time tracking is automatic through execution sessions.
- Manual time input is not allowed.

## 4. Evidence

- A task cannot be completed without required evidence.
- Evidence supports **multiple images**.
- Evidence is captured at finish, not as a checkbox side effect.

## 5. Mandatory tasks

- Tasks marked as `OBLIGATORIA` do not block the full system by default.
- They do generate:
  - visible alerts
  - audit trail
  - closure warnings when relevant
- If the business later decides to block a specific process, that should be configured explicitly, not assumed.

## 6. Expired tasks

- Expired tasks automatically change to `VENCIDA`.

---

## Purchase rules

- A purchase should move through:
  - request / order
  - invoice registration
  - validation
- Purchase evidence is mandatory.
- Validation compares:
  - expected order
  - actual invoice
  - amount difference
  - new product detection

---

## Transfer rules

- Transfers affect financial history when they involve payment or financial impact.
- Transfer records must preserve:
  - requester
  - approver
  - executor
  - timestamps
  - evidence

---

## Audit rules

- Admin validates critical issues with PIN.
- Admin audit does not erase original action owner.
- Audit must register:
  - auditor user id
  - timestamp
  - reason
  - PIN validation result
  - affected record ids

---

## Cross-module integrations

## Tasks ↔ Cash close

- Cash close must check related operational alerts.
- Mandatory pending tasks generate warnings in closure summary.
- Critical financial closure rules are still enforced by cash difference policy.

## Purchases ↔ Movements ↔ Cash

- Purchase paid in cash creates movement and impacts cash balance.
- Purchase pending payment stays operationally pending and does not affect cash yet.

## Payroll ↔ Movements

- Payroll payments and advances generate movement records.
- Employee payroll dashboard reads from auditable financial history.

## Transfers ↔ Movements

- Financially relevant transfers create movement records and affect balance.
