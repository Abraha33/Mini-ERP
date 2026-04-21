# Mini ERP — App Flows

## Convenciones de flujo

- Cada flujo se resuelve paso a paso.
- Cada paso tiene una sola decisión principal.
- Cada flujo termina con confirmación explícita.
- Si falta una validación crítica, el flujo no avanza.

---

## Caja

## 1. Apertura de caja

### Objetivo

Iniciar turno con base registrada y saldo inicial controlado.

### Flujo

1. **Seleccionar apertura**
   - Acción: abrir caja
   - Validación: no debe existir una caja abierta activa para ese contexto

2. **Definir base inicial**
   - Opción: usar base anterior o ingresar base manual
   - Validación: debe existir un monto inicial válido

3. **Registrar monedas**
   - Input: cantidades por denominación
   - Validación: cantidades numéricas y no negativas

4. **Registrar billetes**
   - Input: cantidades por denominación
   - Validación: cantidades numéricas y no negativas

5. **Confirmar apertura**
   - Sistema calcula total inicial
   - Usuario confirma
   - Resultado: caja pasa a estado **ABIERTA**

---

## 2. Registrar movimiento

### Objetivo

Registrar un ingreso, egreso, gasto, ajuste o abono sin salir del contexto operativo.

### Flujo

1. **Seleccionar tipo de movimiento**
   - Opciones: ingreso, egreso, gasto, ajuste, abono
   - Validación: tipo obligatorio

2. **Ingresar monto y referencia**
   - Input: monto, nota breve, origen
   - Validación: monto mayor a cero y referencia mínima

3. **Adjuntar soporte si aplica**
   - Input opcional: comprobante, foto, comentario
   - Validación: obligatorio si el tipo lo requiere

4. **Confirmar**
   - Resultado: se crea movimiento
   - Resultado adicional: caja se recalcula por historial

---

## 3. Cierre de caja

### Objetivo

Cerrar el turno validando saldo, tareas y pendientes críticos.

### Flujo

1. **Iniciar cierre**
   - Acción: cerrar caja
   - Validación: debe existir caja abierta

2. **Revisar resumen del día**
   - Visualización: saldo esperado, ingresos, egresos, diferencias preliminares
   - Validación: datos cargados correctamente

3. **Validar tareas obligatorias**
   - Sistema consulta tareas críticas del turno
   - Validación: no deben existir tareas críticas pendientes
   - Si falla: mostrar bloqueo y tareas faltantes

4. **Registrar conteo final**
   - Input: monedas, billetes, observaciones
   - Validación: conteo completo

5. **Confirmar cierre**
   - Sistema compara saldo esperado vs contado
   - Resultado: caja pasa a estado **CERRADA**
   - Resultado adicional: si hay diferencia, crear incidencia o ajuste según política

---

## Compras

## 1. Orden de compra

### Objetivo

Crear una intención de compra con proveedor, ítems y contexto.

### Flujo

1. **Iniciar orden**
   - Acción: nueva compra
   - Validación: usuario con permiso operativo

2. **Seleccionar proveedor**
   - Input: proveedor existente o nuevo
   - Validación: proveedor obligatorio

3. **Agregar productos o conceptos**
   - Input: líneas de compra
   - Validación: al menos una línea válida

4. **Definir condiciones**
   - Input: método de pago, fecha estimada, notas
   - Validación: método obligatorio si impacta caja

5. **Confirmar orden**
   - Resultado: compra pasa a **PENDIENTE** o **BORRADOR** según política

---

## 2. Registro de factura

### Objetivo

Asociar comprobante real a la compra y dejar soporte auditable.

### Flujo

1. **Seleccionar compra u origen**
   - Input: compra existente o registro directo
   - Validación: debe existir referencia válida

2. **Cargar factura**
   - Input: foto, archivo o datos manuales
   - Validación: comprobante obligatorio

3. **Registrar datos clave**
   - Input: número, monto, fecha, proveedor
   - Validación: campos mínimos completos

4. **Relacionar pago**
   - Input: pagada / pendiente / parcial
   - Validación: coherencia entre monto y estado

5. **Confirmar**
   - Resultado: factura queda registrada y vinculada

---

## 3. Validación de compra

### Objetivo

Confirmar que la compra es consistente antes de impactar operación.

### Flujo

1. **Abrir validación**
   - Acción: validar compra
   - Validación: compra con datos completos

2. **Comparar orden vs factura**
   - Sistema muestra diferencias de monto, proveedor o líneas
   - Validación: inconsistencias visibles

3. **Validar soporte**
   - Revisar evidencia y datos obligatorios
   - Validación: comprobante presente y legible

4. **Confirmar resultado**
   - Opciones: aprobar, observar, rechazar
   - Resultado:
     - aprobada → impacta inventario y/o caja si aplica
     - observada → vuelve a corrección
     - rechazada → queda cerrada sin ejecución

---

## Tareas

## 1. Creación de tarea (Admin)

### Objetivo

Definir trabajo operativo con responsable, fecha y nivel de criticidad.

### Flujo

1. **Crear tarea**
   - Acción: nueva tarea
   - Validación: solo admin o rol autorizado

2. **Definir contexto**
   - Input: título, descripción, módulo, prioridad
   - Validación: título y módulo obligatorios

3. **Asignar responsable**
   - Input: empleado o equipo
   - Validación: responsable obligatorio

4. **Definir evidencia**
   - Input: evidencia requerida sí/no
   - Validación: si es crítica, evidencia obligatoria

5. **Confirmar**
   - Resultado: tarea queda en **PENDIENTE**

---

## 2. Ejecución de tarea (Empleado)

### Objetivo

Completar la tarea desde móvil con mínima navegación.

### Flujo

1. **Abrir tarea asignada**
   - Acción: iniciar tarea
   - Validación: tarea vigente y visible para el usuario

2. **Revisar instrucciones**
   - Visualización: objetivo, plazo, evidencia requerida
   - Validación: contexto claro

3. **Ejecutar y registrar resultado**
   - Input: comentario, checklist o dato puntual
   - Validación: campos requeridos completos

4. **Adjuntar evidencia**
   - Input: foto, archivo o nota obligatoria
   - Validación: evidencia válida si la tarea la exige

5. **Confirmar finalización**
   - Resultado: tarea pasa a **COMPLETADA** o **POR VALIDAR**

---

## 3. Validación de tareas en cierre de caja

### Objetivo

Evitar cierres incompletos cuando hay tareas críticas pendientes.

### Flujo

1. **Disparar revisión desde cierre**
   - Sistema consulta tareas del turno

2. **Filtrar tareas críticas**
   - Validación: identificar pendientes y tareas sin evidencia

3. **Bloquear o permitir**
   - Si existen pendientes críticos:
     - bloquear cierre
     - mostrar listado y motivo
   - Si todo está completo:
     - permitir continuar

---

## Traslados

## 1. Solicitud de traslado

### Objetivo

Solicitar movimiento de productos o recursos entre ubicaciones.

### Flujo

1. **Iniciar solicitud**
   - Acción: nuevo traslado
   - Validación: usuario con acceso al módulo

2. **Definir origen y destino**
   - Input: ubicación origen, ubicación destino
   - Validación: no pueden ser iguales

3. **Agregar ítems**
   - Input: productos, cantidades, observaciones
   - Validación: al menos un ítem válido

4. **Justificar solicitud**
   - Input: motivo
   - Validación: motivo obligatorio

5. **Confirmar**
   - Resultado: traslado queda en **PENDIENTE DE APROBACIÓN**

---

## 2. Aprobación de traslado

### Objetivo

Controlar autorización antes de ejecutar el movimiento.

### Flujo

1. **Abrir solicitud pendiente**
   - Acción: revisar traslado

2. **Revisar contexto**
   - Visualización: origen, destino, ítems, motivo

3. **Tomar decisión**
   - Opciones: aprobar, observar, rechazar
   - Validación: motivo obligatorio si observa o rechaza

4. **Confirmar decisión**
   - Resultado:
     - aprobado → listo para ejecución
     - observado → vuelve a corrección
     - rechazado → cierre administrativo del flujo

---

## 3. Ejecución de traslado

### Objetivo

Confirmar salida y recepción del traslado aprobado.

### Flujo

1. **Abrir traslado aprobado**
   - Validación: debe estar aprobado

2. **Registrar salida**
   - Input: responsable, fecha/hora, evidencia si aplica
   - Validación: datos mínimos completos

3. **Registrar recepción**
   - Input: receptor, fecha/hora, observaciones
   - Validación: recepción confirmada

4. **Cerrar traslado**
   - Resultado: traslado pasa a **EJECUTADO**

---

## Reglas transversales de flujo

- Ningún flujo crítico debe exceder 5 pasos.
- Todo flujo debe tener confirmación final.
- Las validaciones se hacen por paso, no al final de todo el proceso.
- Si el proceso requiere revisión operativa, debe tener estado intermedio.
- Si el proceso impacta dinero, debe terminar generando movimiento financiero.
