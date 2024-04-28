import request from 'supertest';
import {app} from '../../app';

it('fails when email does not exist', async () => {
  await request(app)
    .post('/api/users/signin')
    .send({
      email:'test@gmail.com',
      password: 'password'
    })
    .expect(400);
});

it('fails when incorrect password is passed', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email:'test@gmail.com',
      password: 'password'
    })
    .expect(201);

    await request(app)
    .post('/api/users/signin')
    .send({
      email:'test@gmail.com',
      password: 'sdfs'
    })
    .expect(400);
});

it('responds with a cookie when credentials are valid', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email:'test@gmail.com',
      password: 'password'
    })
    .expect(201);

    const response = await request(app)
    .post('/api/users/signin')
    .send({
      email:'test@gmail.com',
      password: 'password'
    })
    .expect(200);

    expect(response.get('Set-Cookie')).toBeDefined();
});
