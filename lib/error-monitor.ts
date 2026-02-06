// Error monitoring and detection system
import { Span } from './tracing-core';

export interface ErrorEvent {
  id: string;
  projectId: string;
  message: string;
  stack: string;
  type: string;
  severity: 'critical' | 'error' | 'warning';
  context: Record<string, any>;
  timestamp: Date;
  url?: string;
  userId?: string;
  sessionId?: string;
  breadcrumbs: BreadcrumbEntry[];
  sourceFile?: string;
  lineNumber?: number;
  columnNumber?: number;
  environment: string;
  frequency: number; // how many times this error occurred
}

export interface BreadcrumbEntry {
  timestamp: Date;
  category: string;
  message: string;
  data?: Record<string, any>;
}

export interface ErrorPattern {
  id: string;
  pattern: string; // regex or substring
  severity: 'critical' | 'error' | 'warning';
  description: string;
  enabled: boolean;
}

export interface ErrorGroup {
  id: string;
  projectId: string;
  title: string;
  message: string;
  stack: string;
  errorCount: number;
  lastOccurrence: Date;
  firstOccurrence: Date;
  affectedUsers: number;
  resolution?: string;
  resolved: boolean;
}

// In-memory storage
const errors = new Map<string, ErrorEvent>();
const errorPatterns = new Map<string, ErrorPattern>();
const errorGroups = new Map<string, ErrorGroup>();
const errorGroupMap = new Map<string, string>(); // error message hash -> group id

export function captureError(
  projectId: string,
  message: string,
  stack: string,
  type: string = 'Error',
  context: Record<string, any> = {},
  environment: string = 'production'
): ErrorEvent {
  const id = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const error: ErrorEvent = {
    id,
    projectId,
    message,
    stack,
    type,
    severity: determineSeverity(message, type),
    context,
    timestamp: new Date(),
    breadcrumbs: [],
    environment,
    frequency: 1,
  };

  errors.set(id, error);

  // Group similar errors
  groupError(projectId, error);

  return error;
}

export function addBreadcrumb(
  errorId: string,
  category: string,
  message: string,
  data?: Record<string, any>
): boolean {
  const error = errors.get(errorId);
  if (error) {
    error.breadcrumbs.push({
      timestamp: new Date(),
      category,
      message,
      data,
    });
    return true;
  }
  return false;
}

export function getError(errorId: string): ErrorEvent | null {
  return errors.get(errorId) || null;
}

export function getErrorsByProject(projectId: string, limit: number = 50): ErrorEvent[] {
  const projectErrors = Array.from(errors.values()).filter(
    (error) => error.projectId === projectId
  );
  return projectErrors.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, limit);
}

export function getErrorStats(projectId: string): {
  totalErrors: number;
  criticalErrors: number;
  errorCount24h: number;
  affectedUsers: number;
  topErrors: ErrorGroup[];
} {
  const projectErrors = getErrorsByProject(projectId, 1000);
  const now = new Date();
  const day = 24 * 60 * 60 * 1000;

  const stats = {
    totalErrors: projectErrors.length,
    criticalErrors: projectErrors.filter((e) => e.severity === 'critical').length,
    errorCount24h: projectErrors.filter((e) => now.getTime() - e.timestamp.getTime() < day).length,
    affectedUsers: new Set(projectErrors.map((e) => e.userId).filter(Boolean)).size,
    topErrors: getTopErrorGroups(projectId, 5),
  };

  return stats;
}

export function groupError(projectId: string, error: ErrorEvent): ErrorGroup | null {
  const messageHash = hashMessage(error.message);
  const groupId = errorGroupMap.get(messageHash);

  if (groupId) {
    const group = errorGroups.get(groupId);
    if (group) {
      group.errorCount++;
      group.lastOccurrence = error.timestamp;
      if (error.userId && !group.affectedUsers) {
        group.affectedUsers = 1;
      }
      return group;
    }
  }

  // Create new group
  const newGroupId = `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const group: ErrorGroup = {
    id: newGroupId,
    projectId,
    title: error.type,
    message: error.message,
    stack: error.stack,
    errorCount: 1,
    firstOccurrence: error.timestamp,
    lastOccurrence: error.timestamp,
    affectedUsers: error.userId ? 1 : 0,
    resolved: false,
  };

  errorGroups.set(newGroupId, group);
  errorGroupMap.set(messageHash, newGroupId);
  return group;
}

export function getErrorGroups(projectId: string): ErrorGroup[] {
  return Array.from(errorGroups.values())
    .filter((group) => group.projectId === projectId)
    .sort((a, b) => b.lastOccurrence.getTime() - a.lastOccurrence.getTime());
}

export function getTopErrorGroups(projectId: string, limit: number = 10): ErrorGroup[] {
  return getErrorGroups(projectId)
    .sort((a, b) => b.errorCount - a.errorCount)
    .slice(0, limit);
}

export function getErrorGroup(groupId: string): ErrorGroup | null {
  return errorGroups.get(groupId) || null;
}

export function resolveErrorGroup(groupId: string, resolution: string): boolean {
  const group = errorGroups.get(groupId);
  if (group) {
    group.resolved = true;
    group.resolution = resolution;
    return true;
  }
  return false;
}

export function createErrorPattern(
  pattern: string,
  severity: 'critical' | 'error' | 'warning',
  description: string
): ErrorPattern {
  const id = `pattern_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const errorPattern: ErrorPattern = {
    id,
    pattern,
    severity,
    description,
    enabled: true,
  };
  errorPatterns.set(id, errorPattern);
  return errorPattern;
}

export function getErrorPatterns(): ErrorPattern[] {
  return Array.from(errorPatterns.values()).filter((p) => p.enabled);
}

export function deleteErrorPattern(patternId: string): boolean {
  return errorPatterns.delete(patternId);
}

function hashMessage(message: string): string {
  let hash = 0;
  for (let i = 0; i < message.length; i++) {
    const char = message.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

function determineSeverity(
  message: string,
  type: string
): 'critical' | 'error' | 'warning' {
  const criticalKeywords = ['crash', 'fatal', 'critical', 'null pointer', 'access violation'];
  const messageAndType = `${message} ${type}`.toLowerCase();

  if (criticalKeywords.some((keyword) => messageAndType.includes(keyword))) {
    return 'critical';
  }

  if (type.includes('Error') || message.includes('failed')) {
    return 'error';
  }

  return 'warning';
}

export function captureFromSpan(projectId: string, span: Span): void {
  const attributes = span.attributes || {};
  const error = attributes['error'] === true;

  if (error || attributes['error.type']) {
    const errorMessage = attributes['error.description'] || span.name || 'Unknown error';
    const errorType = attributes['error.type'] || 'SpanError';
    const stack = attributes['error.stack'] || '';

    captureError(
      projectId,
      errorMessage,
      stack,
      errorType,
      {
        spanId: span.id,
        traceId: span.traceId,
        duration: span.duration,
        attributes,
      },
      'production'
    );
  }
}
