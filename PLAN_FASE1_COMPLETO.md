# 🎯 PLAN FASE 1: CREACIÓN DASHBOARD AUDITORÍAS - DE CERO A 100%

## 📋 RESUMEN EJECUTIVO

**Objetivo:** Crear una plataforma de dashboard que unifique datos de auditorías de Google Forms y presente:
- Vista macro para WENDY (directora operacional)
- Vista por líder para cada LÍDER (muestran solo su trabajo)
- Reporte automático por correo para BENITO (dueño)
- Sistema de seguimiento de compromisos semanales

**Timeline:** 4-6 semanas
**Stack:** Next.js 14, React 18, TypeScript, Tailwind CSS, Google Sheets API, Recharts

---

## 📊 ESTRUCTURA DE DATOS ACTUAL

### Fuente: Google Sheets con 12 Tabs (Auditorías)
Cada tab tiene:
- Timestamp (fecha/hora de la auditoría)
- Auditor (nombre de quién hizo la auditoría)
- Área (sección auditada)
- Resultados (cumple, alerta, no cumple)
- Score (puntuación de cumplimiento)
- Observaciones
- Datos de calidad

---

## 🏗️ ARQUITECTURA GENERAL

```
┌─────────────────────────────────────────────────────────────┐
│                    DATOS (Google Sheets)                      │
│  12 Tabs × Google Forms → Resultados Auditorías              │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│           API Google Sheets + Procesamiento de Datos          │
│  • Fetch de todos los tabs                                   │
│  • Normalización de datos                                    │
│  • Cálculo de métricas y tendencias                          │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                  DASHBOARD (Next.js)                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ 1. VISTA MACRO (para WENDY)                          │   │
│  │    - Resumen de todas las áreas                      │   │
│  │    - Desempeño por líder                             │   │
│  │    - Alertas y problemas críticos                    │   │
│  │    - Histórico de 30 días                            │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ 2. VISTA POR LÍDER (para cada Líder)                 │   │
│  │    - Solo su área/equipo                             │   │
│  │    - Sus auditorías realizadas                       │   │
│  │    - Su cumplimiento                                 │   │
│  │    - Sus compromisos semanales                       │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ 3. VISTA EJECUTIVA (para BENITO)                     │   │
│  │    - Resumen de qué se hizo/no se hizo               │   │
│  │    - Qué está fallando                               │   │
│  │    - Qué está caminando correctamente                │   │
│  │    - Alertas estratégicas                            │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│          SISTEMA DE REPORTES (Correos Automáticos)           │
│  • Reporte semanal para BENITO (domingo/lunes)              │
│  • Notificaciones de alertas críticas                        │
│  • Resumen de compromisos no cumplidos                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎬 FASE 1: PASO A PASO

### ETAPA 1: PREPARACIÓN (Semana 1)

#### 1.1 Mapeo Completo de Datos
- [ ] Revisar cada tab del Google Sheets
- [ ] Documentar estructura exacta de campos
- [ ] Identificar tipos de auditorías
- [ ] Crear lista de todas las áreas posibles
- [ ] Crear lista de todos los líderes/auditors
- [ ] Documentar estados válidos (Cumple, Alerta, No Cumple, etc.)

**Archivos a crear:**
- `docs/ESTRUCTURA_DATOS.md` - Mapa completo de campos

#### 1.2 Diseño de Base de Datos Relacional
Necesitamos normalizar los datos en una estructura de BD que permita:
- Auditorías (id, fecha, auditor_id, area_id, score, estado, observaciones)
- Auditors (id, nombre, area_asignada, email, rol)
- Areas (id, nombre, descripcion, lider_id)
- Compromises (id, auditor_id, descripcion, fecha_estimada, estado)
- Lideres (id, nombre, email, areas_responsables)

**Archivos a crear:**
- `lib/db-schema.ts` - Estructura de tipos TypeScript
- `docs/SCHEMA_DB.md` - Documentación de la base de datos

#### 1.3 Definir Métricas Clave
Qué mediremos:
- **Por Área:** % cumplimiento, auditorías realizadas, tendencia
- **Por Auditor:** cantidad auditorías, score promedio, áreas auditadas
- **Por Líder:** desempeño del equipo, compromisos cumplidos, tendencia de mejora
- **Histórico:** últimos 7, 14, 30 días

---

### ETAPA 2: INFRAESTRUCTURA (Semana 1-2)

#### 2.1 Configurar Google Sheets API (mejorado)
- [ ] Verificar credenciales de servicio
- [ ] Crear función para leer TODOS los 12 tabs simultáneamente
- [ ] Crear caché local para optimizar llamadas
- [ ] Implementar auto-refresh cada 30 minutos

**Archivos a actualizar:**
- `lib/google-sheets.ts` - Mejorar con lectura multi-tab
- `lib/data-processor.ts` (NUEVO) - Normalizar y procesar datos

#### 2.2 Base de Datos Local (Supabase o similar)
Opciones:
- **Opción A:** Supabase (PostgreSQL serverless) - Recomendado
- **Opción B:** Firebase Firestore
- **Opción C:** MongoDB Atlas

Necesitamos:
- Tabla de auditorías (sync desde Google Sheets)
- Tabla de auditors
- Tabla de áreas
- Tabla de compromisos semanales
- Tabla de líderes

**Archivos a crear:**
- `lib/database.ts` - Conexión y funciones DB
- `pages/api/db-sync.ts` - API para sincronizar datos

#### 2.3 Autenticación y Control de Acceso
Roles:
- ADMIN (tu usuario) - Ve todo
- WENDY - Ve vista macro + todas las áreas
- LÍDERES - Ve solo su área y equipo
- BENITO - Recibe reporte por correo

**Archivos a crear:**
- `lib/auth.ts` - Lógica de autenticación
- `middleware/auth.ts` - Middleware de verificación
- `pages/api/auth/[...].ts` - Rutas de auth

---

### ETAPA 3: FRONTEND - VISTA MACRO (Semana 2-3)

#### 3.1 Dashboard Principal (para WENDY)
Componentes a crear/mejorar:

**3.1.1 KPI Cards - Header Principal**
```
┌─────────────┬──────────────┬──────────────┬──────────────┐
│ Auditorías  │ % Cumplimiento│ En Alerta    │ No Cumple    │
│   Total     │   General     │   (count)    │   (count)    │
└─────────────┴──────────────┴──────────────┴──────────────┘
```
- [ ] Crear `components/MacroKPIs.tsx`
- [ ] Mostrar números grandes, colores (verde, amarillo, rojo)
- [ ] Agregar iconos con lucide-react

**3.1.2 Resumen por Área (Grid de Cards)**
```
Para cada área:
┌──────────────────────┐
│ Nombre Área          │
│ 5/10 Cumple (50%)    │
│ 3 Alerta             │
│ 2 No Cumple          │
│ Tendencia: ↑ Mejora  │
└──────────────────────┘
```
- [ ] Crear `components/AreaSummaryGrid.tsx`
- [ ] 5 columnas en desktop, responsivo
- [ ] Orden por desempeño (mejores primero/últimos primero)

**3.1.3 Charts Principales**
- [ ] `StatusDistributionChart` - Pie/Donut de estados
- [ ] `AreaPerformanceChart` - Bar chart horizontal por área
- [ ] `AuditTrendChart` - Línea de 30 días
- [ ] `AuditorPerformanceChart` - Top 10 auditors
- [ ] Crear `components/TopProblems.tsx` - Top 5 problemas

**3.1.4 Tabla de Auditorías Recientes**
- [ ] Mostrar últimas 20 auditorías
- [ ] Columnas: Fecha, Auditor, Área, Estado, Score
- [ ] Ordenar por fecha descendente

**3.1.5 Alertas Críticas**
- [ ] Mostrar auditorías con "No Cumple" o "Alerta"
- [ ] Destacar en rojo/amarillo
- [ ] Máximo 10, con opción de ver más

**Archivo principal:**
- `pages/dashboard/macro.tsx` - Página completa para WENDY

#### 3.2 Mejorar UI/UX General
- [ ] Colores: Verde (cumple), Amarillo (alerta), Rojo (no cumple), Azul (neutro)
- [ ] Tipografía: H1 (3xl), H2 (2xl), body (base)
- [ ] Espaciado: Componentes con gap-4, p-4
- [ ] Dark mode: Soportar tema oscuro
- [ ] Responsive: Mobile, tablet, desktop

---

### ETAPA 4: FRONTEND - VISTA POR LÍDER (Semana 3)

#### 4.1 Dashboard por Líder
Cada líder accede y ve SOLO su información:

**4.1.1 Header Personalizado**
```
Hola [Nombre Líder]
Tu Área: [Área Asignada]
Semana del [fecha inicio] - [fecha fin]
```

**4.1.2 KPI Personales**
- Mi % Cumplimiento
- Mis Auditorías esta Semana
- Mis Compromisos Cumplidos
- Tendencia Personal

**4.1.3 Mi Trabajo**
- Tabla de auditorías que YO hice
- Desglose por área
- Score promedio mío
- Top 3 mi mejor desempeño
- Área donde tengo problemas

**4.1.4 Mis Compromisos**
- Tabla de compromisos semanales
- Columnas: Promesa, Fecha, Status (cumplido/pendiente/bloqueado)
- Botón para reportar progreso

**4.1.5 Notas de Wendy**
- Si Wendy dejó feedback la semana anterior
- Mostrar en sección destacada

**Archivo principal:**
- `pages/dashboard/leader.tsx` - Dashboard por líder
- `components/LeaderDashboard.tsx` - Componente reutilizable

---

### ETAPA 5: SISTEMA DE COMPROMISOS SEMANALES (Semana 3-4)

#### 5.1 Tabla de Compromisos
Campos:
- ID
- Auditor/Líder
- Descripción del Compromiso
- Fecha Estimada de Cumplimiento
- Estado: Pendiente, En Progreso, Completado, Bloqueado
- Notas de Progreso
- Fecha Creación
- Semana (para histórico)

**Archivos:**
- `pages/api/compromises/create.ts` - Crear compromiso (en reunión con Wendy)
- `pages/api/compromises/update.ts` - Actualizar estado
- `components/CompromiseForm.tsx` - Formulario
- `components/CompromiseList.tsx` - Tabla de compromisos

#### 5.2 Lógica de Reuniones
Workflow:
1. Líder abre su dashboard
2. Ve sus compromisos de la semana anterior
3. Ve feedback de Wendy
4. Sistema registra encuentro (fecha/hora)
5. Después de reunión, Wendy actualiza compromisos nuevos

**Archivos:**
- `pages/api/meetings/log.ts` - Registrar encuentro
- `lib/meeting-logic.ts` - Lógica de reuniones

---

### ETAPA 6: VISTA EJECUTIVA (BENITO) (Semana 4)

#### 6.1 Dashboard Benito
Página especial (protegida solo para Benito):

**6.1.1 Resumen Semanal**
- ¿Cuántas auditorías se hicieron?
- ¿Cuántos compromisos se cumplieron?
- ¿Cuántos se incumplieron?
- ¿Cuántos están bloqueados?

**6.1.2 Por Área - Tabla**
```
Área          │ Auditorías │ % Cumple │ Tendencia │ Líderes con Problemas
────────────────────────────────────────────────────────────────────────
Cocina        │ 15         │ 80%      │ ↑        │ None
Limpieza      │ 8          │ 50%      │ ↓        │ Juan, María
Servicio      │ 12         │ 75%      │ →        │ None
...
```

**6.1.3 Líderes con Incumplimiento**
- Listar líderes que no cumplen compromisos
- Cuántas semanas llevan incumpliendo
- Acciones tomadas

**6.1.4 Alertas Críticas**
- Áreas con < 60% cumplimiento
- Líderes con 2+ compromisos incumplidos
- Tendencias negativas

**6.1.5 Gráficas**
- Cumplimiento general últimas 4 semanas
- Comparativa por área
- Tendencia de compromisos

**Archivo principal:**
- `pages/dashboard/executive.tsx` - Dashboard para Benito

#### 6.2 Reporte Automático por Correo
Se envía automáticamente cada LUNES a las 6 AM:

**6.2.1 Contenido del Email**
- Subject: "📊 Reporte de Auditorías - Semana del [fecha]"
- HTML template con:
  - Resumen ejecutivo (2-3 párrafos)
  - Tabla: Área | Auditorías | % Cumple | Problemas
  - Sección: "Lo que está fallando" (top 3)
  - Sección: "Lo que está funcionando" (top 3)
  - Líderes con incumplimiento (si aplica)
  - Gráfica: cumplimiento últimas 4 semanas
  - Llamado a acción: "Ver dashboard completo"

**Archivos:**
- `lib/email-generator.ts` - Generar HTML del email
- `pages/api/reports/email-weekly.ts` - Función enviable por cron
- `lib/email-service.ts` - Envío de emails

---

### ETAPA 7: AUTENTICACIÓN Y SEGURIDAD (Semana 4-5)

#### 7.1 Sistema de Roles y Permisos
```
ADMIN (Tu usuario)
  - Ve todo
  - Puede crear líderes, areas
  - Puede modificar cualquier dato

WENDY (Directora)
  - Ve vista macro completa
  - Ve todos los líderes
  - Puede crear/actualizar compromisos
  - Recibe notificaciones de alertas

LÍDERES (5-10 usuarios)
  - Ve solo su área
  - Ve solo su trabajo
  - Puede reportar progreso de compromisos
  - Recibe notificaciones de reuniones programadas

BENITO (Dueño)
  - Ve vista ejecutiva
  - Recibe reporte por email

AUDITORS (opcional - mismos que líderes)
  - Pueden ingresar auditorías (si Google Forms no es suficiente)
```

**Archivos:**
- `lib/roles.ts` - Definición de roles
- `lib/permissions.ts` - Lógica de permisos
- `middleware/authorize.ts` - Middleware de verificación

#### 7.2 Autenticación (Recomendación)
- [ ] Usar NextAuth.js o similar
- [ ] OAuth con Google (puedes usar emails @tudominio)
- [ ] O emails + contraseña manual

**Archivos:**
- `pages/api/auth/[...nextauth].ts` - Config autenticación
- `pages/login.tsx` - Página de login

---

### ETAPA 8: TESTING Y POLISH (Semana 5)

#### 8.1 Testing Funcional
- [ ] Verificar carga de datos (todos los 12 tabs)
- [ ] Verificar cálculo de métricas
- [ ] Verificar acceso por roles
- [ ] Verificar generación de reportes
- [ ] Verificar emails se envían

**Archivo:**
- `tests/integration.test.ts` - Tests de integración

#### 8.2 Performance
- [ ] Optimizar queries Google Sheets (caché)
- [ ] Optimizar imágenes
- [ ] Minificar CSS/JS
- [ ] Lazy load de charts

#### 8.3 UI Polish
- [ ] Revisar diseño en mobile, tablet, desktop
- [ ] Consistencia de colores y espaciado
- [ ] Loading states
- [ ] Error states
- [ ] Animaciones sutiles

---

### ETAPA 9: DEPLOYMENT Y TRAINING (Semana 5-6)

#### 9.1 Deployment
- [ ] Deployar en Vercel (recomendado para Next.js)
- [ ] Configurar variables de entorno
- [ ] SSL/HTTPS automático
- [ ] Custom domain

**Archivos:**
- `.env.local` - Variables de entorno locales
- `.env.production` - Variables producción

#### 9.2 Documentación
- [ ] Manual para WENDY: cómo usar dashboard, agendar reuniones
- [ ] Manual para LÍDERES: cómo ver su información, reportar progreso
- [ ] Manual para BENITO: cómo leer el reporte
- [ ] Admin manual: cómo mantener el sistema

**Archivos:**
- `docs/MANUAL_WENDY.md`
- `docs/MANUAL_LIDERES.md`
- `docs/MANUAL_BENITO.md`
- `docs/ADMIN_GUIDE.md`

#### 9.3 Training
- [ ] Sesión 30 min con Wendy (demostración)
- [ ] Sesión 30 min con Líderes (en grupo)
- [ ] Sesión 15 min con Benito (explicar email)
- [ ] Videos cortos (opcional)

---

## 📁 ESTRUCTURA DE ARCHIVOS FINAL

```
anfiteatro-dashboard/
├── pages/
│   ├── index.tsx (dashboard por defecto)
│   ├── dashboard/
│   │   ├── macro.tsx (WENDY)
│   │   ├── leader.tsx (LÍDERES)
│   │   └── executive.tsx (BENITO)
│   ├── login.tsx
│   ├── admin/
│   │   ├── users.tsx (gestionar líderes)
│   │   ├── areas.tsx (gestionar áreas)
│   │   └── settings.tsx
│   └── api/
│       ├── auth/[...nextauth].ts
│       ├── audits/
│       │   ├── fetch.ts
│       │   └── list.ts
│       ├── compromises/
│       │   ├── create.ts
│       │   ├── update.ts
│       │   └── list.ts
│       ├── reports/
│       │   └── email-weekly.ts
│       └── db-sync.ts
├── components/
│   ├── Layout.tsx
│   ├── Navigation.tsx
│   ├── MacroKPIs.tsx (NEW)
│   ├── AreaSummaryGrid.tsx (NEW)
│   ├── TopProblems.tsx (NEW)
│   ├── LeaderDashboard.tsx (NEW)
│   ├── CompromiseForm.tsx (NEW)
│   ├── CompromiseList.tsx (NEW)
│   ├── StatusDistributionChart.tsx
│   ├── AreaPerformanceChart.tsx
│   ├── AuditTrendChart.tsx
│   ├── AuditorPerformanceChart.tsx
│   ├── AuditTable.tsx
│   └── ... (otros componentes)
├── lib/
│   ├── google-sheets.ts (MEJORAR)
│   ├── data-processor.ts (NEW)
│   ├── database.ts (NEW)
│   ├── db-schema.ts (NEW)
│   ├── auth.ts (NEW)
│   ├── roles.ts (NEW)
│   ├── permissions.ts (NEW)
│   ├── email-generator.ts (NEW)
│   ├── email-service.ts (NEW)
│   ├── meeting-logic.ts (NEW)
│   ├── audit-utils.ts
│   ├── audit-scoring.ts
│   └── hooks/
│       └── useAudits.ts
├── middleware/
│   ├── auth.ts (NEW)
│   └── authorize.ts (NEW)
├── docs/
│   ├── ESTRUCTURA_DATOS.md
│   ├── SCHEMA_DB.md
│   ├── MANUAL_WENDY.md
│   ├── MANUAL_LIDERES.md
│   ├── MANUAL_BENITO.md
│   └── ADMIN_GUIDE.md
├── tests/
│   └── integration.test.ts
├── public/
│   └── ... (logos, imágenes)
├── styles/
│   └── globals.css
├── .env.local (GITIGNORE)
├── .env.production (GITIGNORE)
├── package.json (ACTUALIZAR)
├── tsconfig.json
├── next.config.js
├── tailwind.config.js
└── PLAN_FASE1_COMPLETO.md (este archivo)
```

---

## 🎨 DISEÑO UI/UX RECOMENDADO

### Paleta de Colores
```
Estados:
- CUMPLE: #10B981 (green-500) - ✓
- ALERTA: #F59E0B (amber-500) - ⚠
- NO CUMPLE: #EF4444 (red-500) - ✗
- NEUTRO/PENDIENTE: #3B82F6 (blue-500) - ⏳

Neutrales:
- Fondo: #FFFFFF (light) / #111827 (dark)
- Texto: #111827 (light) / #F9FAFB (dark)
- Border: #E5E7EB (light) / #374151 (dark)
```

### Tipografía
- H1: 30px (3xl), font-bold, line-height 2.25rem
- H2: 24px (2xl), font-semibold, line-height 2rem
- H3: 20px (xl), font-semibold, line-height 1.75rem
- Body: 16px (base), font-normal, line-height 1.5rem
- Small: 14px (sm), font-normal, line-height 1.25rem

### Componentes Clave
- Cards: 8px border-radius, shadow-md on hover
- Buttons: 6px border-radius, padding 10px 16px, transition 200ms
- Tables: striped rows (alt gray-100), hover effect
- Charts: 400px height, responsive width

---

## 📊 MÉTRICAS A MEDIR

### Macro (WENDY)
- Total auditorías semana/mes
- % Cumplimiento general
- % Cumplimiento por área
- Tendencia (mejora, estable, empeora)
- Top 3 áreas mejor/peor desempeño
- Top 5 auditors por auditorías
- Promedio de compromisos cumplidos

### Por Líder
- Auditorías que yo hice
- Mi % cumplimiento
- Mis compromisos esta semana
- Cuántos cumplí semana pasada
- Mi tendencia

### Benito (Ejecutiva)
- % cumplimiento general (últimas 4 semanas)
- Auditorías totales (esta semana)
- Compromisos cumplidos vs incumplidos
- Líderes en plan de mejora
- Top 3 problemas
- Top 3 fortalezas

---

## 🚀 PRÓXIMAS FASES (FASE 2 y 3)

### FASE 2: Automatización y Reportes Avanzados
- [ ] Email automático cada lunes
- [ ] Exportar reports a PDF
- [ ] Historiales completos
- [ ] Análisis predictivo (¿dónde habrá problemas?)

### FASE 3: Movilidad y Notificaciones
- [ ] App mobile (React Native)
- [ ] Push notifications
- [ ] Entrada directa de auditorías desde app
- [ ] Seguimiento en tiempo real

---

## ✅ CHECKLIST DE COMPLETITUD FASE 1

Al final de Fase 1, debes poder marcar TODAS estas:

### Infraestructura
- [ ] BD configurada (Supabase o similar)
- [ ] Google Sheets API integrando todos 12 tabs
- [ ] Autenticación funcional
- [ ] Control de roles y permisos

### Frontend - Vistas
- [ ] Dashboard WENDY (macro) - COMPLETO y funcional
- [ ] Dashboard LÍDERES (por líder) - COMPLETO y funcional
- [ ] Dashboard BENITO (ejecutiva) - COMPLETO y funcional
- [ ] Página de login

### Funcionalidades Core
- [ ] Sistema de compromisos semanales
- [ ] Actualización de compromisos
- [ ] Cálculo automático de métricas
- [ ] Sincronización de datos Google Sheets

### Reportes
- [ ] Reporte HTML generado
- [ ] Email configurado para enviarse
- [ ] Template de email profesional

### Calidad
- [ ] Responsive en mobile/tablet/desktop
- [ ] Dark mode funcional
- [ ] Tests básicos pasando
- [ ] Sin console errors

### Documentación
- [ ] Manual WENDY
- [ ] Manual LÍDERES
- [ ] Manual BENITO
- [ ] Admin guide

### Deployment
- [ ] Deployado en Vercel (o similar)
- [ ] Variables de entorno configuradas
- [ ] Custom domain (opcional pero recomendado)

---

## 💡 RECOMENDACIONES CLAVE

1. **Seguridad:** NO guardes credenciales en código. Usa variables de entorno.
2. **Caché:** Google Sheets es lento. Implementa caché con refresco cada 30 min.
3. **Datos Reales:** Prueba con el Google Sheets real desde Semana 2.
4. **Feedback Temprano:** Muestra prototipos a WENDY desde Semana 2.
5. **Mobile First:** Diseña para mobile primero, luego expand a desktop.
6. **Colores:** Usa iconos + colores (no solo colores) para accesibilidad.
7. **Emails:** Test emails manualmente antes de automatizar.

---

## 📞 SOPORTE Y DUDAS

Durante implementación, documenta:
- Preguntas sin respuesta
- Decisiones técnicas tomadas
- Cambios respecto al plan
- Lecciones aprendidas

---

**Creado:** 2026-04-21
**Actualizado:** (se actualizará conforme avances)
**Estado:** LISTO PARA INICIAR ETAPA 1

---

## 🎯 SIGUIENTE PASO INMEDIATO

👉 Ir a ETAPA 1.1: Mapeo Completo de Datos
  - Abrir el Google Sheets
  - Documentar estructura de cada uno de los 12 tabs
  - Listar todos los campos disponibles
  - Crear archivo `docs/ESTRUCTURA_DATOS.md`

**Tiempo estimado:** 2-3 horas
