import request from 'supertest';
import app from '../src/index';

describe('Members API', () => {
  let memberId: string;

  it('should create a new member', async () => {
    const response = await request(app)
      .post('/api/members')
      .send({
        name: 'Test Member',
        monthlyContribution: 5000
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe('Test Member');
    expect(response.body.monthlyContribution).toBe(5000);

    memberId = response.body.id;
  });

  it('should get all members', async () => {
    const response = await request(app)
      .get('/api/members');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it('should update a member', async () => {
    const response = await request(app)
      .put(`/api/members/${memberId}`)
      .send({
        name: 'Updated Member',
        monthlyContribution: 6000
      });

    expect(response.status).toBe(204);
  });

  it('should fail to create member with invalid data', async () => {
    const response = await request(app)
      .post('/api/members')
      .send({
        name: '',
        monthlyContribution: -100
      });

    expect(response.status).toBe(400);
  });

  it('should delete a member', async () => {
    const response = await request(app)
      .delete(`/api/members/${memberId}`);

    expect(response.status).toBe(204);
  });
});
