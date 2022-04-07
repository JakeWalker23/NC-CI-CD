const request = require('supertest');
const app = require('../app');

test('responds to /s3', async () => {
  const res = await request(app).get('/s3');
  expect(res.statusCode).toBe(200);
  expect(res.headers['content-type']).toBe('text/html; charset=UTF-8');
  expect(res.text).toContain('S3 buckets are cool!');
});

test('responds to /lambda', async () => {
  const res = await request(app).get('/lambda');
  expect(res.statusCode).toBe(200);
  expect(res.headers['content-type']).toBe('text/html; charset=UTF-8');
  expect(res.text).toContain('Lambda functions are even cooler!');
});

test('responds to /ec2', async () => {
  const res = await request(app).get('/ec2');
  expect(res.statusCode).toBe(200);
  expect(res.headers['content-type']).toBe('text/html; charset=UTF-8');
  expect(res.text).toContain('EC2 is just the coolest!');
});
