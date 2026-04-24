export class ScqrError extends Error {
  constructor(message: string, readonly code: string, readonly details?: unknown) {
    super(message);
    this.name = 'ScqrError';
  }
}

export class SourceFetchError extends ScqrError {
  constructor(sourceId: number, url: string, cause: unknown) {
    super(`Source ${sourceId} (${url}) failed to fetch`, 'SOURCE_FETCH_ERROR', cause);
  }
}

export class ValidationError extends ScqrError {
  constructor(message: string, issues: unknown) {
    super(message, 'VALIDATION_ERROR', issues);
  }
}

export class PipelineError extends ScqrError {
  constructor(stage: string, message: string, details?: unknown) {
    super(`Pipeline[${stage}]: ${message}`, 'PIPELINE_ERROR', details);
  }
}
