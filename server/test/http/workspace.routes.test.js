import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const authServiceMock = vi.hoisted(() => ({
  verifyAndTouchSession: vi.fn(),
}));

const workspaceServiceMock = vi.hoisted(() => ({
  listWorkspaces: vi.fn(),
  createWorkspace: vi.fn(),
  switchWorkspace: vi.fn(),
}));

vi.mock('../../src/services/auth.service.js', () => ({ authService: authServiceMock }));
vi.mock('../../src/services/workspace.service.js', () => ({ workspaceService: workspaceServiceMock }));

const { default: app } = await import('../../src/app.js');

describe('workspace HTTP routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authServiceMock.verifyAndTouchSession.mockResolvedValue({
      userId: 'user-id',
      workspaceId: 'workspace-id',
      workspaceName: 'Acme Outreach',
      workspaceRole: 'OWNER',
      sessionId: 'session-id',
    });
  });

  it('lists the authenticated user workspaces', async () => {
    workspaceServiceMock.listWorkspaces.mockResolvedValue({
      currentWorkspaceId: 'workspace-id',
      workspaces: [{ id: 'workspace-id', name: 'Acme Outreach', role: 'OWNER' }],
    });

    const response = await request(app)
      .get('/api/v1/workspaces')
      .set('Cookie', 'gmass_session=session-token');

    expect(response.status).toBe(200);
    expect(response.body.data.workspaces[0].name).toBe('Acme Outreach');
    expect(workspaceServiceMock.listWorkspaces).toHaveBeenCalledWith('user-id', 'workspace-id');
  });

  it('creates a workspace for the authenticated user', async () => {
    workspaceServiceMock.createWorkspace.mockResolvedValue({
      id: 'new-workspace-id',
      name: 'Client Campaigns',
      role: 'OWNER',
    });

    const response = await request(app)
      .post('/api/v1/workspaces')
      .set('Cookie', 'gmass_session=session-token')
      .send({ name: ' Client Campaigns ' });

    expect(response.status).toBe(201);
    expect(response.body.data.workspace.name).toBe('Client Campaigns');
    expect(workspaceServiceMock.createWorkspace).toHaveBeenCalledWith(
      'user-id',
      'session-id',
      'Client Campaigns'
    );
  });

  it('rejects invalid workspace names before the service runs', async () => {
    const response = await request(app)
      .post('/api/v1/workspaces')
      .set('Cookie', 'gmass_session=session-token')
      .send({ name: 'x' });

    expect(response.status).toBe(400);
    expect(workspaceServiceMock.createWorkspace).not.toHaveBeenCalled();
  });

  it('switches the authenticated session to a member workspace', async () => {
    workspaceServiceMock.switchWorkspace.mockResolvedValue({
      id: 'other-workspace-id',
      name: 'Client Campaigns',
      role: 'MEMBER',
    });

    const response = await request(app)
      .post('/api/v1/workspaces/11111111-1111-4111-8111-111111111111/switch')
      .set('Cookie', 'gmass_session=session-token');

    expect(response.status).toBe(200);
    expect(response.body.data.workspace.name).toBe('Client Campaigns');
    expect(workspaceServiceMock.switchWorkspace).toHaveBeenCalledWith(
      'user-id',
      'session-id',
      '11111111-1111-4111-8111-111111111111'
    );
  });
});
