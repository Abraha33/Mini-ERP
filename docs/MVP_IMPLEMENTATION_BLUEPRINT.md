# Mini ERP — MVP Implementation Blueprint

## Scope

This document translates the current specs into a clean MVP implementation base.

It includes:

1. folder structure
2. Firestore schema examples
3. backend pseudo-code
4. frontend structure

---

## Verified assumptions

- Current repo stack is **Google Apps Script + HtmlService + Firestore**
- Current web client is not mobile-native
- Because Cloud Functions are not present in the repo today, backend logic is defined as **pseudo-code / service contracts**

---

## 1. Proposed folder structure

```text
/docs
  MVP_IMPLEMENTATION_BLUEPRINT.md

/mini-erp-spec
  README.md
  01_business_rules.md
  02_user_flows.md
  03_interaction_system.md
  04_data_model.md
  05_role_dashboards.md

/web
  /app
    app-shell.md
    routes.md
  /modules
    /dashboard
    /cash
    /tasks
    /purchases
    /admin
    /payroll
    /transfers
  /components
    /cards
    /fab
    /wizard
    /lists
    /layout
  /services
    auth.service.md
    firestore.service.md
    storage.service.md
  /state
    session.store.md
    cash.store.md
    tasks.store.md

/backend
  /services
    movement.service.md
    cash.service.md
    task.service.md
    purchase.service.md
    audit.service.md
  /validators
    cash.validator.md
    task.validator.md
  /triggers
    expire-tasks.md
    raise-alerts.md
```

> For now this is a **clean implementation map**, not a forced framework migration.

---

## 2. Firestore schema

Use the collections defined in:

- `mini-erp-spec/04_data_model.md`

### Critical collections

- `cash_registers`
- `movements`
- `tasks`
- `task_sessions`
- `task_evidences`
- `purchases`
- `purchase_orders`
- `transfers`
- `payroll_entries`
- `audit_events`
- `alerts`

### Rules

- flat collections
- reference by id
- no deep nesting
- no destructive delete

---

## 3. Backend functions

## `createMovement(input)`

### Purpose

Create any auditable financial record.

### Pseudo-code

```text
validate input.type in [GASTO, INGRESO, COMPRA, NOMINA, TRANSFERENCIA, AJUSTE]
validate input.amount > 0
validate input.user_id exists

if movement type requires evidence:
  validate evidence exists

create movement document

if input.cash_register_id exists:
  update cash expected total projection

return movement
```

---

## `openCashRegister(input)`

### Purpose

Open a new operational cash register.

### Pseudo-code

```text
validate no active cash register exists for same cashier/location/context
validate opening base total > 0
validate coin and bill counts are not negative

create cash_register with status ABIERTA
create OPENING event / movement trace if required

return cash_register
```

---

## `validateCashDifference(expectedTotal, countedTotal)`

### Purpose

Classify closure difference and enforce the rule.

### Pseudo-code

```text
difference = abs(expectedTotal - countedTotal)

if difference <= 5000:
  return { level: LOW, allow_close: true, requires_admin_pin: false, create_alert: false }

if difference <= 20000:
  return { level: MEDIUM, allow_close: true, requires_admin_pin: false, create_alert: true }

return { level: CRITICAL, allow_close: false, requires_admin_pin: true, create_alert: true }
```

---

## `closeCashRegister(input)`

### Purpose

Close cash with physical count, alert review and audit enforcement.

### Pseudo-code

```text
load open cash register
validate cash register is ABIERTA

expectedTotal = calculateExpectedTotalFromOpeningAndMovements()
countedTotal = calculateCountedTotalFromCoinsAndBills(input.count)

alerts = loadOpenOperationalAlertsForCashContext()
differenceResult = validateCashDifference(expectedTotal, countedTotal)

if differenceResult.level == CRITICAL:
  validate admin PIN authorization
  create audit_event

if differenceResult.create_alert:
  create alert

update cash register:
  status = CERRADA
  closure_responsible_user_id = cashier_user_id
  audited_by_user_id = admin_user_id if used
  expected_total = expectedTotal
  counted_total = countedTotal
  difference_total = countedTotal - expectedTotal
  difference_level = differenceResult.level

generate closure receipt payload

return closure result
```

---

## `updateTaskStatus(taskId, action, context)`

### Purpose

Move task through its operational lifecycle.

### Supported actions

- `START`
- `PAUSE`
- `CONTINUE`
- `FINISH`
- `EXPIRE`

### Pseudo-code

```text
load task

switch action:
  START:
    validate task.status == PENDIENTE
    set status = EN_PROCESO
    create session started_at

  PAUSE:
    validate task.status == EN_PROCESO
    close current open session with paused_at

  CONTINUE:
    validate task.status == EN_PROCESO
    create new open session resumed_at

  FINISH:
    validate required evidence exists
    close open session
    set status = COMPLETADA

  EXPIRE:
    if due_at passed and status != COMPLETADA:
      set status = VENCIDA

return updated task
```

---

## `completeTask(input)`

### Purpose

Finish task with evidence and final audit trail.

### Pseudo-code

```text
validate task exists
validate task status in [PENDIENTE, EN_PROCESO]
validate evidence images count > 0 when requires_evidence = true

store task evidence
close active sessions
set task status = COMPLETADA

return task
```

---

## 4. Frontend structure

## App shell

### Main navigation

- Dashboard
- Caja
- Tareas
- Compras
- Traslados
- Admin

Visible modules depend on role.

---

## Screen structure by module

## Dashboard

- role-based card layout
- no heavy tables
- quick stats
- direct alerts

## Cash module

- cash status header
- movement list
- Action Hub
- open cash wizard
- close cash wizard

## Tasks module

- tabs:
  - Pendientes
  - En proceso
  - Completadas
- task cards
- task execution flow

## Admin module

- employee list
- tasks per employee
- cash audit queue
- purchase validation queue

---

## Components

## Core

- `AppShell`
- `PageHeader`
- `RoleDashboard`
- `CardGrid`
- `ActionHubFab`
- `WizardLayout`
- `AlertBanner`

## Cash

- `CashStatusCard`
- `CashMovementCard`
- `CashCountTable`
- `DifferenceSummaryCard`
- `CloseCashWizard`

## Tasks

- `TaskCard`
- `TaskInboxTabs`
- `TaskExecutionPanel`
- `TaskEvidenceUploader`
- `TaskSessionTimeline`

## Admin

- `CashAuditCard`
- `EmployeeTaskOverview`
- `PurchaseValidationCard`

---

## UI behavior rules

- dashboard = read
- FAB = actions only
- wizard = critical process
- task completion = action flow, not checkbox
- cash counting = separate coins and bills with live totals

---

## Tradeoff taken

- The original conversation leaned mobile-first.
- The latest implementation prompt asks for **desktop-first responsive-ready**.
- This blueprint follows the latest prompt because the current repo is already a web app and not a native mobile app.
