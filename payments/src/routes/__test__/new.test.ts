import request from 'supertest';
import {app } from '../../app';
import mongoose from 'mongoose';
import { Order } from '../../models/order';
import { OrderStatus } from '@zenobiapanvelwala/common';
import {stripe} from '../../stripe';
import { Payment } from '../../models/payment';

jest.mock('../../stripe');

it('returns a 404 when purchasing an order that does not exist', async () => {
  await request(app)
  .post('/api/payments')
  .set('Cookie', global.signin())
  .send({
    token: 'sdfsd',
    orderId:  new mongoose.Types.ObjectId().toHexString()
  })
  .expect(404);
});

it('return a 401 when purshasing an order that does not belong to user', async () => {
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    userId: new mongoose.Types.ObjectId().toHexString(),
    price: 10,
    status: OrderStatus.Created
  });
  await order.save();

  await request(app)
  .post('/api/payments')
  .set('Cookie', global.signin())
  .send({
    token: 'sdfsd',
    orderId:  order.id
  })
  .expect(401);
});

it('return a 400 when purchasing a cancelled order', async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();

  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    userId: userId,
    price: 10,
    status: OrderStatus.Cancelled
  });
  await order.save();

  await request(app)
  .post('/api/payments')
  .set('Cookie', global.signin(userId))
  .send({
    token: 'sdfsdfs',
    orderId:  order.id
  })
  .expect(400);
});

// To make the following 2 tests run - added the STRIPE_KEY in the test/setup.ts file as process.env.STRIPE_KEY value 
// and call the actual Stripe API instead of using the mock

it.skip('returns a 204 with valid inputs', async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();

  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    userId: userId,
    price: 10,
    status: OrderStatus.Created
  });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin(userId))
    .send({
      token: 'tok_visa',
      orderId: order.id
    })
    .expect(201); 

  const chargeOpts = (stripe.charges.create as jest.Mock).mock.calls[0][0];
  expect(chargeOpts.source).toEqual('tok_visa');
  expect(chargeOpts.amount).toEqual(10 * 100);
  expect(chargeOpts.currency).toEqual('usd');
});

it.skip('returns a 204 with valid inputs - saves payment in the db', async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  const price = Math.floor(Math.random() * 100000);
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    userId: userId,
    price,
    status: OrderStatus.Created
  });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin(userId))
    .send({
      token: 'tok_visa',
      orderId: order.id
    })
    .expect(201); 

  const chargeOpts = (stripe.charges.create as jest.Mock).mock.calls[0][0];
  expect(chargeOpts.source).toEqual('tok_visa');
  expect(chargeOpts.amount).toEqual(price * 100);
  expect(chargeOpts.currency).toEqual('usd');

  const stripeCharges = await stripe.charges.list({ limit: 50 });
  const stripeCharge = stripeCharges.data.find((charge) => {
    return charge.amount === price * 100;
  });
  
  expect(stripeCharge).toBeDefined();
  expect(stripeCharge!.currency).toEqual('usd');

  const payment = await Payment.findOne({
    orderId: order.id,
    stripeId: stripeCharge!.id,
  });
  expect(payment).not.toBeNull();
});