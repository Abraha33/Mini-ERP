# Mini ERP — Interaction System

## Core principle

> **The user acts, not navigates.**

- Navigation changes context.
- Action resolves work.
- Dashboards are for reading.
- Wizards are for critical processes.

---

## Interaction types

## 1. Dashboard

### Use for

- reading status
- reading alerts
- reading operational summary

### Rules

- cards first
- no heavy tables as main UI
- no mixed edit forms
- priority content at the top

---

## 2. FAB / Action Hub

### Definition

- Floating Action Button works as a **contextual Action Hub**

### Use for

- add expense
- add income
- register purchase
- create task

### Rules

- actions only
- max 5 options
- never used for navigation
- only show actions relevant to current module

---

## 3. Step Flow / Wizard

### Use for

- open cash
- close cash
- complete task
- validate purchase

### Rules

- 3 to 5 steps max
- minimal inputs
- progress indicator always visible
- confirmation always required
- validation happens on each step

---

## 4. Task interaction pattern

### Forbidden

- do not use checkboxes as task completion model

### Correct pattern

- `Iniciar`
- `Pausar`
- `Continuar`
- `Finalizar`

### Rule

- finishing requires evidence when configured

---

## 5. Cash counting UI

### Structure

- separate block for **coins**
- separate block for **bills**

### Live values

- total coins
- total bills
- total cash
- difference against expected

### Behavior

- user can move between coins and bills before confirmation
- totals stay visible during the counting flow

---

## Global UX rules

- 1 screen = 1 decision
- do not mix view + edit
- use dashboard for reading, not for process resolution
- use FAB only for contextual actions
- use wizard for critical operations
- keep inputs minimal
- always ask confirmation in critical actions

---

## Desktop-first guidance

- Primary target is **desktop web**
- Layout must be responsive and ready for smaller widths
- Do not use mobile-native assumptions yet
- Avoid components that only make sense inside a native mobile app shell

---

## Module examples

## Cash

### Dashboard

- current cash status
- latest movements
- open alerts

### Action Hub

- open cash
- add income
- add expense
- add transfer
- close cash

### Wizards

- open cash
- close cash

---

## Tasks

### Dashboard

- pending
- in progress
- completed
- overdue

### Action Hub

- create task
- attach evidence
- start task

### Wizard

- finish task with evidence

---

## Admin

### Dashboard

- critical alerts
- cash incidents
- overdue tasks
- items pending validation

### Action Hub

- create task
- validate purchase
- audit cash

---

## Anti-patterns to avoid

- using FAB as module navigation
- mixing dashboard cards with long forms
- forcing long forms for simple actions
- allowing task completion without evidence
- hiding cash difference until the last click
