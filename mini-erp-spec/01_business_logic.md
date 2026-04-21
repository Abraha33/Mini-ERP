# Mini ERP — Business Logic

## Principios operativos

- El sistema prioriza operación directa, trazabilidad y cierre controlado.
- Toda acción crítica deja rastro auditable.
- Ningún dato operativo desaparece; solo cambia de estado.
- La caja es un resultado del historial de movimientos, no un valor editable.

---

## Entidades operativas base

- **Caja**
- **Movimiento**
- **Compra**
- **Tarea**
- **Traslado**
- **Nómina**
- **Usuario**
- **Evidencia**

---

## Reglas clave

### 1. Todo movimiento financiero genera un movimiento

- Cada ingreso, egreso, ajuste, pago, abono, compra pagada o traslado con impacto financiero debe crear un registro en **Movimientos**.
- Un movimiento debe guardar como mínimo:
  - tipo
  - monto
  - origen
  - referencia
  - usuario responsable
  - fecha/hora
  - estado

### 2. Caja no se edita directamente

- El saldo de caja se calcula desde:
  - apertura
  - movimientos del día
  - cierre
- No existe edición manual del saldo actual.
- Si hay error operativo:
  - se registra un **movimiento de ajuste**
  - se conserva el historial anterior

### 3. Evidencia obligatoria en tareas críticas

- Toda tarea marcada como crítica requiere evidencia para poder cerrarse.
- Tipos válidos de evidencia:
  - foto
  - comentario obligatorio
  - archivo o comprobante
- Sin evidencia válida:
  - la tarea no puede pasar a **COMPLETADA**
  - el cierre relacionado puede quedar bloqueado

### 4. Nada se elimina

- Ningún registro operativo se elimina físicamente desde la app.
- Los registros cambian a estado:
  - **ANULADO**
  - **CANCELADO**
  - **RECHAZADO**
  - **VENCIDO**
- Toda anulación debe conservar:
  - motivo
  - usuario que anula
  - fecha/hora

### 5. Toda operación crítica requiere estado

- Cada módulo debe usar estados explícitos.
- Estados mínimos por proceso:
  - **BORRADOR**
  - **PENDIENTE**
  - **APROBADO**
  - **EJECUTADO**
  - **ANULADO**

### 6. Una caja solo puede cerrarse si cumple validaciones

- Debe existir apertura activa.
- Deben estar registrados todos los movimientos requeridos.
- Deben estar resueltas las tareas obligatorias asociadas al turno.
- Debe existir conteo final.
- Debe existir confirmación explícita del cajero.

---

## Reglas por módulo

## Caja

- Solo puede haber **una caja abierta por usuario/turno/punto** según configuración operativa.
- La apertura siempre requiere base inicial.
- El cierre siempre requiere conteo final.
- Las diferencias entre saldo esperado y saldo contado:
  - no corrigen el historial
  - generan incidencia o ajuste según política

## Compras

- Una compra nace como intención operativa y termina como registro validado.
- Toda compra validada puede impactar:
  - inventario
  - cuentas internas
  - movimientos de caja si fue pagada
- Una factura no debe registrarse dos veces.
- El comprobante de compra debe quedar asociado al registro.

## Tareas

- Las tareas pueden ser:
  - informativas
  - operativas
  - críticas
- Las tareas críticas pueden bloquear:
  - cierre de caja
  - validación de compra
  - cierre de turno

## Traslados

- Un traslado no se ejecuta sin aprobación si el flujo está marcado como controlado.
- El traslado aprobado debe registrar:
  - origen
  - destino
  - responsable
  - fecha de ejecución
  - evidencia si aplica

## Nómina

- La nómina es acumulativa y trazable.
- Todo pago parcial o adelanto debe quedar registrado como movimiento relacionado.
- El empleado debe poder ver:
  - total del período
  - pagado acumulado
  - restante por recibir

---

## Integraciones importantes

### Tareas ↔ Cierre de caja

- El cierre de caja debe consultar tareas obligatorias del turno.
- Si existe una tarea crítica pendiente:
  - el cierre no se confirma
  - el sistema muestra qué falta resolver

### Compras ↔ Movimientos ↔ Caja

- Si una compra se paga en efectivo:
  - genera movimiento de egreso
  - impacta caja
- Si una compra queda pendiente:
  - no impacta caja todavía
  - queda pendiente de pago o validación

### Traslados ↔ Tareas ↔ Evidencias

- Un traslado puede exigir evidencia de salida y recepción.
- Si el traslado es crítico:
  - puede crear tareas automáticas
  - puede requerir validación de ambas partes

### Nómina ↔ Movimientos

- Todo pago de nómina o adelanto genera movimiento financiero.
- El dashboard del empleado debe leer del historial consolidado, no de valores manuales.

---

## Restricciones operativas

- No mezclar creación y validación en la misma acción.
- No permitir edición libre de registros ya ejecutados.
- No permitir cierre de procesos con información incompleta.
- No permitir omitir evidencia en procesos marcados como críticos.

---

## Criterios de auditoría

- Toda acción crítica debe registrar:
  - usuario
  - rol
  - fecha/hora
  - dispositivo o sesión si aplica
  - origen del cambio
- Toda corrección debe quedar como nuevo evento, no como sobreescritura silenciosa.

---

## Dependencias de implementación

- **Caja** depende de **Movimientos**
- **Compras** puede disparar **Movimientos**
- **Tareas** puede bloquear **Cierre de caja**
- **Traslados** puede requerir **Aprobación** y **Evidencia**
- **Nómina** debe leer pagos reales desde **Movimientos**
