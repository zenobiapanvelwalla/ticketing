import request from 'supertest';
import {app} from '../../app';
import mongoose from 'mongoose';
import { Order } from '../../models/order';
import { Ticket } from '../../models/ticket';

const buildTicket = async (title: string, price: number) => {
  const ticketId = new mongoose.Types.ObjectId().toHexString();
  const ticket = Ticket.build({
    id: ticketId,
    title,
    price
  });
  await ticket.save();
  return ticket;
};

it('fetches the order for a particular user',  async () => {
  // Create a user
  const user = global.signin();

  // Create a tickets
  const ticket = await buildTicket('Taylor Swift Concert', 250);
  
  // Create one order for user
  const { body: order} = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({
      ticketId: ticket.id
    }).expect(201);

  // Make request to get order by order's id for the user
    const {body: fetchedOrder} = await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send()
    .expect(200);

  // Make sure we only got the correct order
    expect(fetchedOrder.id).toEqual(order.id);
});

it('returns an error if one user tries to fetch another user\'s error',  async () => {
  // Create a user
  const user = global.signin();

  // Create a tickets
  const ticket = await buildTicket('Taylor Swift Concert', 250);
  
  // Create one order for user
  const { body: order} = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({
      ticketId: ticket.id
    }).expect(201);

  // Make request to get order by order's id for another user
    const {body: fetchedOrder} = await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', global.signin())
    .send()
    .expect(401);
});




