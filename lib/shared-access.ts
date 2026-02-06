// Shared access link generation and management system
import crypto from 'crypto';

export type AccessLevel = 'viewer' | 'collaborator' | 'admin';
export type AccessType = 'dev-link' | 'team-invite' | 'public-url';

export interface AccessLink {
  id: string;
  token: string;
  type: AccessType;
  accessLevel: AccessLevel;
  projectId: string;
  createdAt: Date;
  expiresAt?: Date;
  teamId?: string;
  createdBy: string;
  active: boolean;
  viewCount: number;
}

export interface TeamMember {
  id: string;
  email: string;
  accessLevel: AccessLevel;
  joinedAt: Date;
  lastAccessed?: Date;
}

export interface SharedProject {
  id: string;
  name: string;
  accessLinks: AccessLink[];
  teamMembers: TeamMember[];
  createdAt: Date;
  owner: string;
}

// In-memory storage (replace with database in production)
const accessLinks = new Map<string, AccessLink>();
const sharedProjects = new Map<string, SharedProject>();
const teamInvites = new Map<string, { projectId: string; email: string; expiresAt: Date; accessLevel: AccessLevel }>();

export function generateAccessToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function generateShareLink(
  projectId: string,
  type: AccessType,
  accessLevel: AccessLevel = 'viewer',
  createdBy: string = 'system',
  expiresIn?: number
): AccessLink {
  const token = generateAccessToken();
  const id = crypto.randomBytes(16).toString('hex');
  
  const link: AccessLink = {
    id,
    token,
    type,
    accessLevel,
    projectId,
    createdAt: new Date(),
    expiresAt: expiresIn ? new Date(Date.now() + expiresIn) : undefined,
    active: true,
    createdBy,
    viewCount: 0,
  };

  accessLinks.set(id, link);
  return link;
}

export function generateTeamInvite(
  projectId: string,
  email: string,
  accessLevel: AccessLevel = 'collaborator'
): string {
  const inviteId = crypto.randomBytes(16).toString('hex');
  teamInvites.set(inviteId, {
    projectId,
    email,
    accessLevel,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  });
  return inviteId;
}

export function getAccessLink(linkId: string): AccessLink | null {
  const link = accessLinks.get(linkId);
  if (link && link.active) {
    if (link.expiresAt && link.expiresAt < new Date()) {
      link.active = false;
      return null;
    }
    link.viewCount++;
    return link;
  }
  return null;
}

export function validateAccessToken(token: string): AccessLink | null {
  for (const link of accessLinks.values()) {
    if (link.token === token && link.active) {
      if (link.expiresAt && link.expiresAt < new Date()) {
        link.active = false;
        continue;
      }
      link.viewCount++;
      return link;
    }
  }
  return null;
}

export function revokeAccessLink(linkId: string): boolean {
  const link = accessLinks.get(linkId);
  if (link) {
    link.active = false;
    return true;
  }
  return false;
}

export function createSharedProject(
  projectId: string,
  name: string,
  owner: string
): SharedProject {
  const project: SharedProject = {
    id: projectId,
    name,
    owner,
    accessLinks: [],
    teamMembers: [],
    createdAt: new Date(),
  };
  sharedProjects.set(projectId, project);
  return project;
}

export function addTeamMember(
  projectId: string,
  email: string,
  accessLevel: AccessLevel = 'collaborator'
): TeamMember {
  const project = sharedProjects.get(projectId);
  if (!project) throw new Error('Project not found');

  const member: TeamMember = {
    id: crypto.randomBytes(8).toString('hex'),
    email,
    accessLevel,
    joinedAt: new Date(),
  };

  project.teamMembers.push(member);
  return member;
}

export function getSharedProject(projectId: string): SharedProject | null {
  return sharedProjects.get(projectId) || null;
}

export function getAllAccessLinks(projectId: string): AccessLink[] {
  const project = sharedProjects.get(projectId);
  if (!project) return [];
  return Array.from(accessLinks.values()).filter(
    (link) => link.projectId === projectId && link.active
  );
}

export function getTeamMembers(projectId: string): TeamMember[] {
  const project = sharedProjects.get(projectId);
  return project?.teamMembers || [];
}

export function updateAccessLevel(
  projectId: string,
  memberId: string,
  newLevel: AccessLevel
): boolean {
  const project = sharedProjects.get(projectId);
  if (!project) return false;

  const member = project.teamMembers.find((m) => m.id === memberId);
  if (member) {
    member.accessLevel = newLevel;
    return true;
  }
  return false;
}

export function removeTeamMember(projectId: string, memberId: string): boolean {
  const project = sharedProjects.get(projectId);
  if (!project) return false;

  const index = project.teamMembers.findIndex((m) => m.id === memberId);
  if (index !== -1) {
    project.teamMembers.splice(index, 1);
    return true;
  }
  return false;
}
