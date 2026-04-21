# Mini ERP — User Flows

## Flow rules

- Every critical flow uses step-by-step progression.
- Max length: 3 to 5 steps.
- Every step has one main decision.
- Every critical flow ends with confirmation.

---

## Cash module

## 1. Open cash register

### Step 1 — Start opening

- User selects `Abrir caja`
- System validates:
  - no active cash register in same context

### Step 2 — Base input

- User enters:
  - received base total
- Optional:
  - open detailed count view

### Step 3 — Count coins

- User inputs quantity by coin denomination
- System shows:
  - live coins total

### Step 4 — Count bills

- User inputs quantity by bill denomination
- System shows:
  - live bills total
  - live full total

### Step 5 — Confirm opening

- System shows:
  - declared base
  - detailed total
  - difference if any
- User confirms
- Result:
  - cash register opens
  - opening event is stored

---

## 2. Register movement

### Step 1 — Choose movement type

- Options:
  - gasto
  - ingreso
  - compra
  - nómina
  - transferencia

### Step 2 — Enter financial data

- User enters:
  - amount
  - short reason
  - related reference when applicable

### Step 3 — Attach evidence

- Required when movement policy demands it

### Step 4 — Confirm

- System creates movement
- System updates operational cash balance view

---

## 3. Close cash register

### Step 1 — Review expected summary

- System shows:
  - opening base
  - total movements
  - expected cash

### Step 2 — Count physical cash

- Separate sections:
  - coins
  - bills
- System shows live totals:
  - total coins
  - total bills
  - total cash
  - difference

### Step 3 — Review operational alerts

- System shows:
  - mandatory pending tasks
  - missing evidence alerts
  - open incidents

### Step 4 — Validate difference

- System classifies:
  - LOW
  - MEDIUM
  - CRITICAL
- Behavior:
  - LOW → continue
  - MEDIUM → continue + admin alert
  - CRITICAL → block + request admin PIN

### Step 5 — Confirm closure

- User confirms final closure
- System generates:
  - closure record
  - audit info if needed
  - final receipt / strip

---

## Tasks module

## 1. Create task (Admin)

### Step 1 — Define task

- Input:
  - title
  - description
  - type
  - due date

### Step 2 — Assign owner

- Input:
  - assigned user
  - optional location / zone

### Step 3 — Define execution rules

- Input:
  - mandatory yes/no
  - evidence required yes/no
  - multiple images yes/no

### Step 4 — Confirm creation

- Result:
  - task created in `PENDIENTE`

---

## 2. Execute task (Employee / Cashier)

### Step 1 — Start

- Action:
  - `Iniciar`
- Result:
  - task changes to `EN_PROCESO`
  - execution session starts automatically

### Step 2 — Pause or continue

- Available actions:
  - `Pausar`
  - `Continuar`
- Result:
  - sessions are stored automatically

### Step 3 — Finish with evidence

- Action:
  - `Finalizar`
- Required:
  - evidence images
  - final note if configured

### Step 4 — Confirm finish

- System validates evidence
- If valid:
  - task changes to `COMPLETADA`
- If invalid:
  - finish is blocked

---

## 3. Expire task

### Trigger

- Scheduled validation checks due date

### Result

- If unfinished and overdue:
  - task changes to `VENCIDA`

---

## Purchases module

## 1. Create purchase order

### Step 1 — Choose supplier

- Select supplier

### Step 2 — Add lines

- Add expected products and expected price

### Step 3 — Define payment context

- cash / pending / transfer

### Step 4 — Confirm order

- Result:
  - purchase order created

---

## 2. Register invoice

### Step 1 — Attach invoice

- photo or file

### Step 2 — Capture invoice data

- supplier
- invoice number
- date
- amount

### Step 3 — Manual review

- OCR suggestion if available
- user edits before confirmation

### Step 4 — Confirm invoice registration

- Result:
  - invoice stored

---

## 3. Validate purchase

### Step 1 — Compare order vs invoice

- expected vs actual

### Step 2 — Review differences

- price increase
- new product
- amount mismatch

### Step 3 — Confirm decision

- approve / observe / reject

### Step 4 — Apply effects

- if approved and paid from cash:
  - create movement

---

## Transfers module

## 1. Request transfer

### Step 1 — Define route

- origin
- destination

### Step 2 — Define items

- products
- quantities

### Step 3 — Confirm request

- Result:
  - transfer request created

---

## 2. Approve transfer

### Step 1 — Review request

- requester
- route
- items

### Step 2 — Decide

- approve / observe / reject

### Step 3 — Confirm

- Result:
  - transfer status updated

---

## 3. Execute transfer

### Step 1 — Register output

- executor
- evidence if required

### Step 2 — Register reception

- receiver
- observations

### Step 3 — Confirm execution

- Result:
  - transfer completed

---

## Payroll module

## 1. Register payroll payment

### Step 1 — Select employee

- employee
- payroll period

### Step 2 — Enter payment data

- amount
- type: payment / advance / adjustment

### Step 3 — Confirm

- Result:
  - payroll record created
  - movement created
