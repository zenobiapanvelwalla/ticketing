import request from 'supertest';
import {app} from '../../app';


const createTicket = (ticket: any) => {
  return request(app)
  .post('/api/tickets')
  .set('Cookie', global.signin())
  .send(ticket);
};

it('Get list of all tickets', async ()=> {
 await createTicket({
  title: "Chicago",
  price: 30
  });
  await createTicket({
    title: "Cursed Child",
    price: 50
  });
  await createTicket({
    title: "Lion King",
    price: 90
  });

  const response = await request(app)
  .get('/api/tickets')
  .send()
  .expect(200);

  expect(response.body.length).toEqual(3);
});