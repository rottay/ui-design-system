# dm-recruiter - Orchestrators

> **Servicios de aplicación que coordinan workflows complejos**

---

## ¿Qué es un Orchestrator?

Un orchestrator coordina múltiples use cases y servicios para completar un workflow complejo. Vive en `application/services/` y tiene su propio port.

---

## JobPublishingOrchestrator

**Ubicación:** `application/services/job-publishing-orchestrator/`

Coordina la publicación de un puesto en múltiples canales.

```typescript
interface IJobPublishingOrchestrator {
  publishJob(jobId: string, channels: PublishChannel[], context: TenantContext): Promise<UseCaseResult<PublishResult>>;
  unpublishJob(jobId: string, context: TenantContext): Promise<UseCaseResult<void>>;
  syncJobToChannels(jobId: string, context: TenantContext): Promise<UseCaseResult<SyncResult>>;
}
```

**Pasos del workflow:**
1. Validar que el job está listo para publicar
2. Generar contenido para cada canal
3. Publicar en job boards (LinkedIn, Indeed, etc.)
4. Actualizar estado del job
5. Notificar a recruiters

---

## ApplicationPipelineOrchestrator

**Ubicación:** `application/services/application-pipeline-orchestrator/`

Gestiona el movimiento de aplicaciones a través del pipeline.

```typescript
interface IApplicationPipelineOrchestrator {
  advanceToNextStage(applicationId: string, context: TenantContext): Promise<UseCaseResult<Application>>;
  moveToStage(applicationId: string, stage: ApplicationStage, context: TenantContext): Promise<UseCaseResult<Application>>;
  bulkAdvance(applicationIds: string[], context: TenantContext): Promise<UseCaseResult<BulkResult>>;
  getRecommendedNextActions(applicationId: string, context: TenantContext): Promise<UseCaseResult<RecommendedAction[]>>;
}
```

**Pasos del workflow:**
1. Validar transición de etapa
2. Actualizar aplicación
3. Crear tareas para siguiente etapa
4. Notificar a candidato y recruiter
5. Actualizar métricas

---

## InterviewSchedulingOrchestrator

**Ubicación:** `application/services/interview-scheduling-orchestrator/`

Coordina el scheduling de entrevistas con múltiples participantes.

```typescript
interface IInterviewSchedulingOrchestrator {
  scheduleInterview(input: ScheduleInterviewInput, context: TenantContext): Promise<UseCaseResult<Interview>>;
  findAvailableSlots(input: FindSlotsInput, context: TenantContext): Promise<UseCaseResult<TimeSlot[]>>;
  rescheduleInterview(interviewId: string, newTime: Date, context: TenantContext): Promise<UseCaseResult<Interview>>;
  sendReminders(context: TenantContext): Promise<UseCaseResult<number>>;
}
```

**Pasos del workflow:**
1. Consultar disponibilidad de entrevistadores
2. Consultar disponibilidad del candidato
3. Encontrar slots comunes
4. Crear evento de calendario
5. Enviar invitaciones
6. Crear recordatorios

---

## OfferManagementOrchestrator

**Ubicación:** `application/services/offer-management-orchestrator/`

Gestiona el flujo completo de ofertas laborales.

```typescript
interface IOfferManagementOrchestrator {
  createAndSendOffer(input: CreateOfferInput, context: TenantContext): Promise<UseCaseResult<Offer>>;
  processResponse(offerId: string, response: OfferResponse, context: TenantContext): Promise<UseCaseResult<Offer>>;
  handleNegotiation(offerId: string, counterOffer: CounterOffer, context: TenantContext): Promise<UseCaseResult<Offer>>;
  processApproval(offerId: string, decision: ApprovalDecision, context: TenantContext): Promise<UseCaseResult<Offer>>;
}
```

**Pasos del workflow:**
1. Generar documento de oferta
2. Obtener aprobaciones necesarias
3. Enviar oferta al candidato
4. Procesar negociaciones
5. Finalizar contratación

---

## AiInterviewOrchestrator

**Ubicación:** `application/services/ai-interview-orchestrator/`

Coordina entrevistas conducidas por IA.

```typescript
interface IAiInterviewOrchestrator {
  startAiInterview(applicationId: string, templateId: string, context: TenantContext): Promise<UseCaseResult<AiSession>>;
  processResponse(sessionId: string, response: CandidateResponse, context: TenantContext): Promise<UseCaseResult<AiQuestion>>;
  completeInterview(sessionId: string, context: TenantContext): Promise<UseCaseResult<AiInterviewResult>>;
  generateReport(sessionId: string, context: TenantContext): Promise<UseCaseResult<InterviewReport>>;
}
```

**Pasos del workflow:**
1. Cargar template de entrevista
2. Generar preguntas iniciales
3. Procesar respuestas del candidato
4. Generar preguntas de seguimiento
5. Evaluar respuestas con LLM
6. Generar reporte final

---

## CandidateEngagementOrchestrator

**Ubicación:** `application/services/candidate-engagement-orchestrator/`

Gestiona el engagement y comunicación con candidatos.

```typescript
interface ICandidateEngagementOrchestrator {
  sendStatusUpdate(applicationId: string, context: TenantContext): Promise<UseCaseResult<void>>;
  sendNurturingEmail(candidateId: string, campaignId: string, context: TenantContext): Promise<UseCaseResult<void>>;
  scheduleFollowUp(applicationId: string, followUpType: FollowUpType, context: TenantContext): Promise<UseCaseResult<void>>;
  trackEngagement(candidateId: string, event: EngagementEvent, context: TenantContext): Promise<UseCaseResult<void>>;
}
```

---

## HiringProcessOrchestrator

**Ubicación:** `application/services/hiring-process-orchestrator/`

Coordina el proceso de contratación end-to-end.

```typescript
interface IHiringProcessOrchestrator {
  initiateHiring(applicationId: string, context: TenantContext): Promise<UseCaseResult<HiringProcess>>;
  completeOnboarding(processId: string, context: TenantContext): Promise<UseCaseResult<void>>;
  generateContracts(processId: string, context: TenantContext): Promise<UseCaseResult<Contract[]>>;
  trackCompliance(processId: string, context: TenantContext): Promise<UseCaseResult<ComplianceStatus>>;
}
```

---

## NotificationOrchestrator

**Ubicación:** `application/services/notification-orchestrator/`

Centraliza el envío de notificaciones del módulo.

```typescript
interface INotificationOrchestrator {
  notifyApplicationReceived(applicationId: string, context: TenantContext): Promise<UseCaseResult<void>>;
  notifyInterviewScheduled(interviewId: string, context: TenantContext): Promise<UseCaseResult<void>>;
  notifyOfferSent(offerId: string, context: TenantContext): Promise<UseCaseResult<void>>;
  sendBulkNotification(recipientIds: string[], template: string, context: TenantContext): Promise<UseCaseResult<void>>;
}
```

---

## AnalyticsOrchestrator

**Ubicación:** `application/services/analytics-orchestrator/`

Procesa y agrega datos de analytics.

```typescript
interface IAnalyticsOrchestrator {
  calculateHiringMetrics(dateRange: DateRange, context: TenantContext): Promise<UseCaseResult<HiringMetrics>>;
  generatePipelineReport(jobId: string, context: TenantContext): Promise<UseCaseResult<PipelineReport>>;
  trackConversion(applicationId: string, event: ConversionEvent, context: TenantContext): Promise<UseCaseResult<void>>;
  predictTimeToHire(jobId: string, context: TenantContext): Promise<UseCaseResult<Prediction>>;
}
```

---

## TokenManagementOrchestrator

**Ubicación:** `application/services/token-management-orchestrator/`

Gestiona tokens de acceso para integraciones.

```typescript
interface ITokenManagementOrchestrator {
  refreshExpiredTokens(context: TenantContext): Promise<UseCaseResult<number>>;
  revokeTokensForUser(userId: string, context: TenantContext): Promise<UseCaseResult<void>>;
  validateToken(token: string, context: TenantContext): Promise<UseCaseResult<TokenValidation>>;
}
```

---

## Patrón de Implementación

```typescript
// application/services/job-publishing-orchestrator/index.ts
export class JobPublishingOrchestrator implements IJobPublishingOrchestrator {
  constructor(
    private readonly jobRepo: JobRepositoryPort,
    private readonly publisherService: JobPublisherServicePort,
    private readonly notificationService: NotificationServicePort,
    private readonly logger: Logger,
  ) {}

  async publishJob(
    jobId: string,
    channels: PublishChannel[],
    context: TenantContext
  ): Promise<UseCaseResult<PublishResult>> {
    // 1. Obtener job
    const job = await this.jobRepo.findById(jobId, context.tenantId);
    if (!job) {
      return error(new JobNotFoundError(jobId));
    }

    // 2. Validar estado
    if (job.status !== 'draft') {
      return error(new InvalidJobStateError(jobId, job.status));
    }

    // 3. Publicar en canales
    const results = await Promise.all(
      channels.map(channel => this.publisherService.publish(job, channel))
    );

    // 4. Actualizar estado
    await this.jobRepo.update(jobId, { status: 'published', publishedAt: new Date() });

    // 5. Notificar
    await this.notificationService.notify({
      type: 'job_published',
      jobId,
      channels,
    }, context);

    return success({ jobId, channels: results });
  }
}
```
