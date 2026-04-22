# ESTRUCTURA DE DATOS - Formularios de Auditoría

Este documento detalla la estructura real de los datos extraídos de cada una de las 13 pestañas de Google Sheets asociadas a los formularios de auditoría de Anfiteatro. Esta información es fundamental para el diseño del esquema de la base de datos (ETAPA 1.2) y el modelo de datos.

## Resumen de Pestañas y Campos Comunes

Existen 13 pestañas de auditorías independientes. A pesar de sus diferencias, comparten algunos campos base:
- **Marca temporal** (Presente en todas, tipo Fecha/Hora)
- **Auditor / ¿Quién audita? / ¿Quién realiza esta auditoría?** (Presente en todas, tipo Texto)
- **Observaciones / Problemas detectados** (Presente en casi todas, tipo Texto)
- **Fecha de auditoría / Día de auditoría** (Presente en muchas, tipo Fecha)

La mayoría de los campos de evaluación se responden con **Sí/No**, **Escalas numéricas (1-5)** o **N/A**.

---

## Pestaña: "SALÓN - AUDITORÍA DE EXCELENCIA EN SERVICIO"

| Columna | Tipo Inferido | Posibles Valores / Notas |
|---------|--------------|--------------------------|
| Marca temporal | Date |  |
| ¿Quién audita? | String | Ej: Capitan |
| Mesero auditado? | String | Ej: Mesero 1 |
| Pregunto si  ¿El Cliente ya hizo tour? | Enum / Boolean | Valores: No |
| Si ya hizo tour pregunto ¿Qué le pareció? | Enum / Boolean | Valores: No |
| Si NO hizo: ¿Se ofreció amablemente sin presionar? | Enum / Boolean | Valores: No |
| Pregunto ¿Primera vez que visita Anfiteatro? | Enum / Boolean | Valores: Si |
| ¿Saludó cálidamente? | Number | Ej: 2 |
| ¿Se presentó con nombre? | Enum / Boolean | Valores: Si |
| Se ofrecieron aperitivos - entradas  | Number | Ej: 1 |
| ¿Explicó especiales? | Number | Ej: 3 |
| ¿Tomó orden sin apresurar? | Number | Ej: 5 |
| ¿Se atendió rápidamente? | Number | Ej: 5 |
| ¿Verificó satisfacción durante servicio? | Number | Ej: 3 |
| ¿Sugirió bebidas/postres? | Number | Ej: 3 |
| ¿Se despidió cordialmente? | Number | Ej: 4 |
| Observaciones  | String | Ej: esto es una prueba no cuenta para  el dashboard |

**Campos únicos vs. comunes**: Los campos de evaluación son altamente específicos a esta auditoría. Su estructura variará en la base de datos de manera radical respecto a otras áreas.

---

## Pestaña: "SALÓN - AUDITORÍA DE OPERACIÓN"

| Columna | Tipo Inferido | Posibles Valores / Notas |
|---------|--------------|--------------------------|
| Marca temporal | Date |  |
| ¿Quién audita? | String | Ej: Backup |
| Tipo de Auditoria | String | Ej: Cierre |
| ¿Mesas limpias sin manchas? | Enum / Boolean | Valores:  |
| ¿Pisos limpios (sin migajas, derrames)? | Enum / Boolean | Valores:  |
| ¿Baños impecables? | Enum / Boolean | Valores:  |
| ¿Cristales sin manchas? | Enum / Boolean | Valores:  |
| ¿Área cocina visible limpia? | Enum / Boolean | Valores:  |
| ¿Mesas puestas correctamente? | Enum / Boolean | Valores:  |
| ¿Cubiertos en su lugar? | Enum / Boolean | Valores:  |
| ¿Vasos limpios e invertidos? | Enum / Boolean | Valores:  |
| ¿Servilletas presentes? | Enum / Boolean | Valores:  |
| ¿Pisos limpios? | Enum / Boolean | Valores:  |
| ¿Baños limpios? | Enum / Boolean | Valores:  |
| ¿Personal uniforme correcto? | Enum / Boolean | Valores:  |
| ¿Punto atención listo? | Enum / Boolean | Valores:  |
| ¿Mesas limpias y despejadas? | Enum / Boolean | Valores: No |
| ¿Pisos limpios y secos? | Enum / Boolean | Valores: Sí |
| ¿Baños limpios y desinfectados? | Enum / Boolean | Valores: Sí |
| ¿Cristales limpios? | Enum / Boolean | Valores: No |
| ¿Luces apagadas? | Enum / Boolean | Valores: No |
| ¿Equipos guardados? | Enum / Boolean | Valores: Si |
| ¿Caja contabilizada y Datafono cerrado? | Enum / Boolean | Valores: No |
| ¿Sin basura visible? | Enum / Boolean | Valores: Sí |
| Observaciones  | String | Ej: esto es una prueba no cuenta para el dashboard |

**Campos únicos vs. comunes**: Los campos de evaluación son altamente específicos a esta auditoría. Su estructura variará en la base de datos de manera radical respecto a otras áreas.

---

## Pestaña: "COCINA - AUDITORÍA GENERAL"

| Columna | Tipo Inferido | Posibles Valores / Notas |
|---------|--------------|--------------------------|
| Marca temporal | Date |  |
| Auditor | String | Ej: Chef |
| Tipo de auditoria | String | Ej: Salida |
| ¿Equipos funcionan? ¿Temperaturas correctas? Frío 0-4°C | Congelador -18°C | Enum / Boolean | Valores: No |
| ¿Cocina limpia? (Sin restos, estaciones limpias, pisos limpios) | Enum / Boolean | Valores: Sí |
| ¿Área accesible y organizada? | Enum / Boolean | Valores: Si |
| Observaciones  | String | Ej: test |
| ¿Limpieza profunda? (Estaciones desinfectadas, equipos limpios: horno, estufa, freidora) | Enum / Boolean | Valores: Sí |
| ¿Limpieza general? (Refrigerador, pisos, drenajes) | Enum / Boolean | Valores: Si |
| ¿Área cerrada? (Sin basura, luces apagadas, equipos apagados, segura) | Enum / Boolean | Valores: Sí |
| Observaciones | String | Ej: esto es una prueba no cuenta para el dashboard |

**Campos únicos vs. comunes**: Los campos de evaluación son altamente específicos a esta auditoría. Su estructura variará en la base de datos de manera radical respecto a otras áreas.

---

## Pestaña: "COCINA - AUDITORÍA INDIVIDUAL"

| Columna | Tipo Inferido | Posibles Valores / Notas |
|---------|--------------|--------------------------|
| Marca temporal | Date |  |
| Auditor | String | Ej: Chef |
| Colaborador auditado | String | Ej: Cocinero 1 |
| UNIFORME Y PRESENTACIÓN  Uniforme limpio, completo, ordenado. Cabello cubierto. ¿Cumple? | Number | Ej: 3 |
| HIGIENE DE MANOS Y PREVENCIÓN Uñas limpias/cortadas, lava manos, usa guantes, no toca comida tras limpiar. ¿Cumple?  | Number | Ej: 3 |
| LIMPIEZA Y ORDEN DE ESTACIÓN      "Estación limpia, herramientas organizadas, limpia derrames inmediatamente. ¿Cumple?  | Number | Ej: 4 |
| INOCUIDAD ALIMENTARIA      "Separación crudos/cocidos, temperaturas, vencimientos, descarta dudosos. ¿Cumple?  | Number | Ej: 2 |
| ¿Falta detectada? | String | Ej: Falta Baja |
| Descripción breve y acción (si hay falta) | String | Ej: test |
| Observaciones, mejoras, fortalezas y notas especiales  | String | Ej: esto es una prueba no cuenta para el dashboard |

**Campos únicos vs. comunes**: Los campos de evaluación son altamente específicos a esta auditoría. Su estructura variará en la base de datos de manera radical respecto a otras áreas.

---

## Pestaña: "Planilla y Horas - Auditoría"

| Columna | Tipo Inferido | Posibles Valores / Notas |
|---------|--------------|--------------------------|
| Marca temporal | Date |  |
| ¿Quién audita? | String | Ej: Gerente |
| Semana auditada | Date |  |
| ¿Todas las marcaciones están registradas correctamente?  | Enum / Boolean | Valores: No |
| ¿No hay marcaciones duplicadas? | Enum / Boolean | Valores: Si |
| ¿Atrasos y confusiones justificadas? | Enum / Boolean | Valores: Si |
| ¿Ausencias Reportadas correctamente? | Enum / Boolean | Valores: Si |
| ¿Permisos autorizados y documentados? | Enum / Boolean | Valores: No |
| ¿Todas las horas extras fueron autorizadas antes de realizar planilla? | Enum / Boolean | Valores: Sí |
| ¿Horas extras calculadas correctamente? | Enum / Boolean | Valores: Sí |
| ¿Salario base calculado correctamente? | Enum / Boolean | Valores: No |
| ¿Bonificaciones/descuentos aplicados correctamente? | Enum / Boolean | Valores: No |
| ¿Neto a pagar está correcto? | Enum / Boolean | Valores: Sí |
| Problemas o discrepancias encontradas | String | Ej: esto es una prueba no cuenta para el dashboard |

**Campos únicos vs. comunes**: Los campos de evaluación son altamente específicos a esta auditoría. Su estructura variará en la base de datos de manera radical respecto a otras áreas.

---

## Pestaña: "Inventarios - Auditoria"

| Columna | Tipo Inferido | Posibles Valores / Notas |
|---------|--------------|--------------------------|
| Marca temporal | Date |  |
| ¿Quién audita? | String | Ej: Yeiruska |
| Fecha de auditoria  | Date |  |
| ¿Tipo de auditoría? | String | Ej: Parcial |
| ¿Inventario físico coincide con sistema? | Number | Ej: 4 |
| ¿Diferencias encontradas? | Enum / Boolean | Valores: Si |
| Describe las diferencias  | String | Ej: test |
| ¿Precisión general del inventario? | Number | Ej: 2 |
| ¿Diferencias investigadas y resueltas? | Enum / Boolean | Valores: Si |
| ¿Rotación PEPS (primero entra, primero sale) seguida? | Enum / Boolean | Valores: Si |
| ¿Productos vencidos identificados? | Enum / Boolean | Valores: No |
| ¿Cantidad de productos vencidos identificados? | String | Ej: test |
| ¿Refrigeración a temperatura correcta? | String | Ej: si |
| ¿Almacenamiento seco en condiciones óptimas? | Enum / Boolean | Valores: Sí |
| ¿Organización clara por categoría? | Enum / Boolean | Valores: No |
| Problemas detectados | String | Ej: esto es una prueba no cuenta para el dashboard |

**Campos únicos vs. comunes**: Los campos de evaluación son altamente específicos a esta auditoría. Su estructura variará en la base de datos de manera radical respecto a otras áreas.

---

## Pestaña: "AUDITORÍA DE PAGOS Y FACTURAS"

| Columna | Tipo Inferido | Posibles Valores / Notas |
|---------|--------------|--------------------------|
| Marca temporal | Date |  |
| ¿Quién audita? | String | Ej: Mariela |
| Fecha de auditoría | Date |  |
| ¿Totas las factura presentes y legibles? | Enum / Boolean | Valores: No, Si |
| ¿Datos del proveedor visibles? | Enum / Boolean | Valores: No, Sí |
| ¿Concepto de pago claro? | Enum / Boolean | Valores: Si |
| ¿Todas las facturas cuentan con Autorización de pago? | Enum / Boolean | Valores: Sí |
| ¿Todos los montos de  las facturas coincide con las ordenes de compra? | Enum / Boolean | Valores: Sí |
| ¿Montos de los Impuestos fue calculados correctamente? | Enum / Boolean | Valores: Sí |
| ¿Todos los descuentos fueron autorizados previamente? revisar y eliminar | Enum / Boolean | Valores: No, Sí |
| ¿Monto total correcto? | Enum / Boolean | Valores: No, Si |
| ¿Clasificación contable correcta?   | Enum / Boolean | Valores: No, Si |
| ¿Registro en sistema completado? | Enum / Boolean | Valores: No, Sí |
| ¿Comprobantes archivado correctamente? | Enum / Boolean | Valores: Sí |
| ¿Trazabilidad completa del pago? | Enum / Boolean | Valores: Sí |
| Discrepancias o problemas encontrados | String | Ej: esto es una prueba no cuenta para el dashboard, No |

**Campos únicos vs. comunes**: Los campos de evaluación son altamente específicos a esta auditoría. Su estructura variará en la base de datos de manera radical respecto a otras áreas.

---

## Pestaña: "ADMINISTRACIÓN - AUDITORÍA DE CAJA SORPRESA"

| Columna | Tipo Inferido | Posibles Valores / Notas |
|---------|--------------|--------------------------|
| Marca temporal | Date |  |
| ¿Quién audita? | String | Ej: Gerente |
| ¿Dia de auditoría? | String | Ej: 27/3/2026 |
| ¿Saldo reportado en sistema? | Enum / Boolean | Valores: No |
| ¿Efectivo contado y clacificado? | Enum / Boolean | Valores: No |
| ¿Diferencia encontrada? | Enum / Boolean | Valores: Si |
| ¿Hay diferencia? | String | Ej: Hay Diferencia |
| ¿Cause de Diferencia definida? | Enum / Boolean | Valores: Si |
| ¿Se documentó incidencia? | Enum / Boolean | Valores: No |
| Observaciones | String | Ej: esto es una prueba no cuanta para el dashboard |

**Campos únicos vs. comunes**: Los campos de evaluación son altamente específicos a esta auditoría. Su estructura variará en la base de datos de manera radical respecto a otras áreas.

---

## Pestaña: "OPERACIÓN - AUDITORÍA DE EJECUCIÓN DE EVENTOS"

| Columna | Tipo Inferido | Posibles Valores / Notas |
|---------|--------------|--------------------------|
| Marca temporal | Date |  |
| ¿Nombre del evento? | String | Ej: test |
| ¿Número de asistentes? | String | Ej: 71-80 |
| Fecha del evento | Date |  |
| ¿Decoración completada según diseño? | Enum / Boolean | Valores: N/A |
| ¿Mesas y sillas disposición correcta? | Enum / Boolean | Valores: N/A |
| ¿Sonido y proyección apropiados? | Enum / Boolean | Valores: No |
| ¿Servicio de alimentos/bebidas listos a tiempo y servidos a tiempo? | Enum / Boolean | Valores: Si |
| ¿Servicio fue profesional y oportuno? | Number | Ej: 5 |
| ¿Atención a detalles fue excepcional? | Number | Ej: 2 |
| ¿Ambiente y ambiente fueron agradables? | Number | Ej: 2 |
| ¿Incidencias durante evento? | Enum / Boolean | Valores: No |
| Detalles de las incidencias | String | Ej: test |
| ¿Satisfacción general del cliente? | Number | Ej: 1 |
| ¿Limpieza y orden post-evento? | Number | Ej: 5 |
| Observaciones del evento | String | Ej: esto es una prueba no cuenta para el dashboard |

**Campos únicos vs. comunes**: Los campos de evaluación son altamente específicos a esta auditoría. Su estructura variará en la base de datos de manera radical respecto a otras áreas.

---

## Pestaña: "EVALUACIÓN - AUDITORÍA DE DESEMPEÑO POR ÁREA"

| Columna | Tipo Inferido | Posibles Valores / Notas |
|---------|--------------|--------------------------|
| Marca temporal | Date |  |
| ¿Líder de área auditado? | String | Ej: Raqe |
| ¿Área? | String | Ej: Cavernas |
| ¿Cumplimiento de objetivos Trimestre? | String | Ej: Sobre paso |
| ¿implementa y cumple con las métricas de calidad? | String | Ej: Sobre paso |
| ¿Implementa y cumple con las métricas de Eficiencia? | String | Ej: Cumplio |
| ¿Cumplimiento de procesos? | String | Ej: No Cumplio |
| ¿Se identificaron áreas de mejora? | Enum / Boolean | Valores: Si |
| ¿Cuáles fueron las mejoras? (describir) | String | Ej: test |
| ¿Se establecieron acciones correctivas? | Enum / Boolean | Valores: No |
| ¿Cuáles acciones correctivas?(describir) | String | Ej: test |
| ¿Desempeño del equipo del lider? | Number | Ej: 3 |
| ¿Logros destacados del trimestre? | String | Ej: test |
| Observaciones generales | String | Ej: esto es una prueba y no cuenta para el dashboard |

**Campos únicos vs. comunes**: Los campos de evaluación son altamente específicos a esta auditoría. Su estructura variará en la base de datos de manera radical respecto a otras áreas.

---

## Pestaña: "COMPRAS - AUDITORÍA DE CONTROL DE PROVEEDORES"

| Columna | Tipo Inferido | Posibles Valores / Notas |
|---------|--------------|--------------------------|
| Marca temporal | Date |  |
| ¿Quién audita? | String | Ej: Opción 1 |
| ¿Proveedor auditado? | String | Ej: delta, Centro Internacional de Inversiones |
| Fecha de auditoría | Date |  |
| ¿Entregas a tiempo? | Enum / Boolean | Valores: Sí |
| ¿Calidad de productos entregados? | Number | Ej: 4, 5 |
| ¿Presentación y empaque correcto? | Number | Ej: 4, 5 |
| ¿Cantidades coinciden con ordenes 99% del tiempo? | Enum / Boolean | Valores: Si |
| Observaciones | String | Ej: esto es una prueba no cuenta para el dashboard |

**Campos únicos vs. comunes**: Los campos de evaluación son altamente específicos a esta auditoría. Su estructura variará en la base de datos de manera radical respecto a otras áreas.

---

## Pestaña: "SERVICIO AL CLIENTE - AUDITORÍA DE RESERVAS"

| Columna | Tipo Inferido | Posibles Valores / Notas |
|---------|--------------|--------------------------|
| Marca temporal | Date |  |
| ¿Quién audita? | String | Ej: Opción 1, Stephanie |
| ¿Tipo de servicio? | String | Ej: Restaurante, Evento |
| Fecha de auditoría | Date |  |
| ¿Información completa de todos los clientes? Teléfono, Email, cantidad de personas, fecha, hora, etc | String | Ej: SI |
| Mensajes y correos adecuados utilizados ? | Enum / Boolean | Valores: No, Si |
| ¿Confirmaciones enviadas al cliente? | Enum / Boolean | Valores: No, Sí |
| ¿Observaciones especiales registradas? | Enum / Boolean | Valores: Si |
| Se realizaron los seguimientos adecuados y a tiempo para coordinación?  | Enum / Boolean | Valores: Si |
| Se completaron los seguimientos después del servicio y se enviaron las encuestas? | Enum / Boolean | Valores: Sí, No |
| Observaciones | String | Ej: esto es una prueba no cuenta para el dashboard ni  |

**Campos únicos vs. comunes**: Los campos de evaluación son altamente específicos a esta auditoría. Su estructura variará en la base de datos de manera radical respecto a otras áreas.

---

## Pestaña: "Auditoría de Apertura y Cierre - Cavernas"

| Columna | Tipo Inferido | Posibles Valores / Notas |
|---------|--------------|--------------------------|
| Marca temporal | Date |  |
| ¿Quién realiza esta auditoría? | String | Ej: Raquel, Backup |
| ¿Qué tipo de auditoría? | String | Ej: Apertura |
| Se completaron correctamente  la limpieza y organización la noche o dia anterior? | Enum / Boolean | Valores: Sí, No, Mas o menos |
| Se completaron la limpieza y orden antes de la Apertura? | String | Ej: Sí, No, Mas o Menos |
| ¿Se abrió área y se instalaron los equipos? | Enum / Boolean | Valores: Sí, Mas o menos |
| ¿Se revisaron reservas y horarios del día?  | Enum / Boolean | Valores: Si |
| ¿Se validó personal disponible y necesario? | Enum / Boolean | Valores: Sí, No |
| ¿Se verificaron todas las luces (funcionan)? | Enum / Boolean | Valores: Sí, No |
| ¿Se verificaron que todos tienen los equipos de comunicación de radio? | Enum / Boolean | Valores: No Completo, No |
| ¿Punto de atención (recepción)está listo a tiempo? | Enum / Boolean | Valores: Sí, No |
| Problemas detectados o notas especiales | String | Ej: test, En verificación de radios, todos tienen su r |
| Se completo la limpieza y ordenamiento de la noche ? | Enum / Boolean | Valores: Si |
| ¿Café apagado? | Enum / Boolean | Valores: Si |
| ¿Snacks o Helados apagado o cerrado? | Enum / Boolean | Valores: No |
| ¿Otros expendedores apagados? | Enum / Boolean | Valores: Si |
| ¿Equipos de recepcion guardados? | Enum / Boolean | Valores: No |
| ¿Recepción limpia | Enum / Boolean | Valores: No |
| ¿Cajas arqueólogo limpias? | Enum / Boolean | Valores: No |
| ¿Salas caverna limpias? | Enum / Boolean | Valores: Sí |
| ¿Baños limpios? | Enum / Boolean | Valores:  |
| ¿Estan todas las Luces apagadas? | Enum / Boolean | Valores: No |
| ¿Portones Cerrados correctamente? | Enum / Boolean | Valores: Sí |
| ¿Área Lista y segura? | Enum / Boolean | Valores: Si |
| Problemas detectados o notas especiales | String | Ej: esto es una prueba no cuenta para el dasboard |

**Campos únicos vs. comunes**: Los campos de evaluación son altamente específicos a esta auditoría. Su estructura variará en la base de datos de manera radical respecto a otras áreas.

---

## Recomendaciones y Próximos Pasos (ETAPA 1.2)

1. **Variabilidad de Datos**: La estructura de las columnas difiere completamente de una auditoría a otra. Por lo tanto, el diseño de la base de datos en PostgreSQL debería contemplar un esquema normalizado flexible (como `EAV` o campos JSONB para las respuestas) o tablas específicas por cada tipo de auditoría, dependiendo de las agregaciones requeridas en los dashboards.
2. **Normalización de Nombres**: Los nombres de los auditores y campos varían entre formularios ("Sí" vs "Si", "¿Quién audita?" vs "Auditor"). Estos valores deben normalizarse durante el proceso de sincronización.
3. **Escalas de Puntuación**: Mientras que algunos miden de 1 a 5, otros usan Si/No. El motor de métricas debe mapear Si=100%, No=0%, y adaptar la escala de 1 a 5 a porcentajes.
