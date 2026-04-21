# Mini ERP — UX/UI System

## Principio base

> **El usuario actúa, no navega.**

- La app está diseñada para operación directa.
- La navegación existe para cambiar de contexto, no para resolver trabajo.
- Cada pantalla debe acercar al usuario a una decisión concreta.

---

## Tipos de interacción

## 1. Quick Actions

### Qué son

Acciones rápidas de baja complejidad que pueden resolverse en una sola pantalla o en un diálogo corto.

### Cuándo usar

- registrar gasto
- registrar ingreso
- registrar abono
- marcar tarea simple

### Reglas

- una intención
- un resultado
- inputs mínimos
- sin navegación profunda
- confirmación corta

---

## 2. Process Flows

### Qué son

Flujos guiados paso a paso para procesos que requieren orden, validación y confirmación.

### Cuándo usar

- apertura de caja
- cierre de caja
- validación de compra
- ejecución de traslado
- tareas con evidencia obligatoria

### Reglas

- 3 a 5 pasos máximo
- progreso visible
- validación por paso
- una decisión principal por pantalla
- confirmación final obligatoria

---

## 3. Visualización

### Qué es

Pantallas de lectura diseñadas para mostrar estado, alertas y contexto operativo.

### Cuándo usar

- dashboard por rol
- estado de caja
- resumen de nómina
- alertas administrativas

### Reglas

- sin inputs innecesarios
- sin edición embebida
- información crítica primero
- acciones visibles pero separadas del contenido

---

## Reglas clave del sistema

- **1 pantalla = 1 decisión**
- **No mezclar ver + editar**
- **Máximo 3–5 acciones en FAB**
- **Step flows de máximo 3–5 pasos**
- **Validación por paso**
- **La navegación no reemplaza una acción**
- **La acción no reemplaza una pantalla de contexto**

---

## FAB — Floating Action Button

## Definición oficial

El FAB se implementa como **Action Hub contextual**.

### Función

- disparar acciones operativas
- reducir pasos de entrada
- mantener foco en tareas frecuentes

### Lo que NO hace

- no navega entre módulos
- no reemplaza tabs o menú principal
- no muestra listas largas
- no mezcla acciones sin relación con el contexto actual

### Reglas del Action Hub

- visible solo cuando aporta valor operativo
- entre 3 y 5 acciones máximo
- acciones del mismo contexto
- texto claro y directo
- íconos solo como apoyo, no como único identificador

---

## Ejemplos por módulo

## Caja

### Action Hub sugerido

- Abrir caja
- Registrar ingreso
- Registrar gasto
- Registrar ajuste
- Cerrar caja

### No incluir

- Ir a compras
- Ver dashboard admin
- Cambiar de módulo

---

## Compras

### Action Hub sugerido

- Nueva orden
- Registrar factura
- Validar compra
- Adjuntar comprobante

### No incluir

- Ir a caja
- Ver historial general

---

## Tareas

### Action Hub sugerido

- Nueva tarea
- Ejecutar tarea
- Adjuntar evidencia
- Marcar completada

### No incluir

- Ir a nómina
- Ir a perfil

---

## Estructura estándar de Process Flows

Cada wizard debe seguir esta secuencia:

1. **Paso**
   - objetivo claro
   - contexto mínimo necesario

2. **Input mínimo**
   - solo campos indispensables
   - evitar formularios largos

3. **Validación**
   - validación inmediata
   - errores visibles antes de continuar

4. **Confirmación final**
   - resumen
   - impacto esperado
   - acción explícita de confirmar

---

## Patrón visual recomendado para wizard

### Encabezado

- título del proceso
- paso actual
- indicador de progreso

### Cuerpo

- bloque principal con una sola tarea
- inputs agrupados por sentido operativo

### Pie

- volver
- continuar
- confirmar en último paso

### Indicador sugerido

```text
● ○ ○ ○
Paso 1 de 4
```

---

## Ejemplo detallado — Apertura de caja

## Paso 1 — Base

### Objetivo

Definir el monto base de inicio.

### Inputs

- usar base anterior
- o ingresar base manual

### Validación

- debe existir una base válida

---

## Paso 2 — Monedas

### Objetivo

Registrar conteo por denominación.

### Inputs

- cantidad por moneda

### Validación

- solo números
- no negativos

---

## Paso 3 — Billetes

### Objetivo

Registrar conteo por denominación.

### Inputs

- cantidad por billete

### Validación

- solo números
- no negativos

---

## Paso 4 — Confirmación

### Objetivo

Validar total calculado antes de abrir caja.

### Visualización

- total base
- resumen por denominación

### Acción final

- Confirmar apertura

---

## Criterios para elegir patrón

## Usar Quick Action si:

- la tarea cabe en una sola decisión
- no depende de pasos previos
- no necesita revisión secuencial

## Usar Process Flow si:

- el orden importa
- hay validaciones parciales
- existe riesgo operativo
- hay confirmación de impacto

## Usar Visualización si:

- el usuario solo necesita contexto
- la prioridad es leer estado, no editar

---

## Anti-patrones prohibidos

- usar FAB para navegación
- mezclar dashboard con formulario de edición
- hacer procesos largos en una sola pantalla
- abrir formularios pesados para acciones simples
- esconder validaciones hasta el último paso
- meter más de 5 acciones en el Action Hub

---

## Criterios de implementación

- cada módulo debe tener un home claro
- cada home debe combinar contexto + acción
- cada acción debe mapear a Quick Action o Process Flow
- cada dashboard debe vivir separado del sistema de interacción

---

## Key Learnings

- Un FAB no debe asumir funciones de navegación; solo acciones contextuales.
- Separar Quick Actions de Process Flows evita inconsistencias cuando el producto crece.
- Dashboards deben documentarse por separado y no mezclarse con interacción.
- El sistema debe minimizar navegación y maximizar decisiones directas.
