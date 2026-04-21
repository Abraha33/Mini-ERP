# Mini ERP — Dashboard Roles

## Principio

Cada rol debe ver primero lo que necesita para actuar HOY.

- El dashboard no es una pantalla decorativa.
- El dashboard entrega contexto, prioridad y acceso rápido.
- La edición vive fuera del dashboard.

---

## Reglas globales

- información crítica arriba
- una lectura rápida en menos de 5 segundos
- sin formularios pesados
- con accesos rápidos contextualizados por rol
- alertas antes que métricas secundarias

---

## ADMIN

## Objetivo del dashboard

Control global, alertas operativas e inconsistencias del sistema.

### Prioridades

1. alertas críticas
2. inconsistencias operativas
3. estado global del negocio
4. accesos a validaciones pendientes

### Bloques recomendados

#### Alertas

- cajas sin cerrar
- tareas críticas pendientes
- compras observadas
- traslados pendientes de aprobación

#### Inconsistencias

- diferencias de caja
- compras con datos incompletos
- tareas sin evidencia
- pagos o movimientos con referencia faltante

#### Control global

- cajas abiertas hoy
- compras del día
- tareas pendientes por equipo
- traslados en curso

### Accesos rápidos sugeridos

- Validar compra
- Aprobar traslado
- Revisar incidencias
- Crear tarea

---

## CAJERO

## Objetivo del dashboard

Resolver operación de caja con rapidez y sin ruido.

### Prioridades

1. saldo actual
2. movimientos del día
3. estado de caja
4. accesos operativos directos

### Bloques recomendados

#### Estado de caja

- caja abierta / cerrada
- hora de apertura
- base inicial
- saldo esperado actual

#### Movimientos del día

- ingresos acumulados
- egresos acumulados
- últimos movimientos
- diferencias o alertas activas

#### Pendientes de cierre

- tareas obligatorias incompletas
- faltantes de evidencia
- alertas que bloquean cierre

### Accesos rápidos sugeridos

- Registrar ingreso
- Registrar gasto
- Registrar ajuste
- Cerrar caja

---

## EMPLEADO

## Objetivo del dashboard

Mostrar trabajo pendiente, estado de nómina y accesos directos a ejecución.

### Prioridades

1. nómina actual
2. restante por recibir
3. tareas asignadas
4. accesos rápidos

### Bloques recomendados

#### Nómina actual

- total del período
- pagado acumulado
- restante por recibir
- último pago recibido

#### Tareas asignadas

- tareas de hoy
- tareas críticas
- tareas vencidas
- tareas que requieren evidencia

#### Acceso operativo

- iniciar tarea
- subir evidencia
- ver estado de pagos

### Accesos rápidos sugeridos

- Ejecutar tarea
- Adjuntar evidencia
- Ver nómina

---

## Jerarquía visual recomendada

## ADMIN

- alertas
- inconsistencias
- estado global
- acciones administrativas

## CAJERO

- estado de caja
- saldo actual
- movimientos del día
- pendientes de cierre

## EMPLEADO

- cuánto va a recibir
- cuánto le falta
- qué ya le pagaron
- qué tarea debe resolver ahora

---

## Reglas de contenido por rol

- cada tarjeta debe responder una pregunta operativa real
- no mostrar métricas que el rol no puede accionar
- no duplicar información entre tarjetas
- si una tarjeta requiere edición compleja, debe abrir flujo aparte

---

## Relación con el sistema de interacción

- el dashboard da contexto
- el Action Hub dispara acciones
- los Process Flows resuelven procesos

No mezclar estas tres capas.
