import { natsWrapper } from "../../../nats-wrapper";
import { TicketUpdatedEvent } from "@zenobiapanvelwala/common";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../../models/ticket";
import { TicketUpdatedListener } from "../ticket-updated-listener";

const setup = async () => {
  // create an instance of the listener
  const listener = new TicketUpdatedListener(natsWrapper.client);

  // Create and save a ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20
  });
  await ticket.save();
  
  // create a fake data event
  const data: TicketUpdatedEvent['data'] = {
    version: ticket.version + 1,
    id: ticket.id,
    userId: 'sesdfsdf',
    title: 'new concert',
    price: 999
  };

  // create a fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  };

  return {listener, data, msg, ticket};
};

it('it finds, updates and saves a ticket', async () => {
  
  const {listener, data, msg, ticket} = await setup();
  // call the onMessage function with the data object + msg obj
  await listener.onMessage(data, msg);
  
  // write assertions to make sure a ticket was created
  const updatedTicket = await Ticket.findById(ticket.id);
  
  expect(updatedTicket!.title).toEqual(data.title);
  expect(updatedTicket!.price).toEqual(data.price);
  // expect(updatedTicket!.version).toEqual(data.version);
});

it('it acks the message', async () => {
  const {listener, data, msg} = await setup();

  // call the onMessage function with the data object + msg obj
  await listener.onMessage(data, msg);

  // make assertions that ack function was called
  expect(msg.ack).toHaveBeenCalled();
});

// useful test if versioning is running
// it('does not ack if the event has a skipped version number', async () => {
//     const {listener, data, msg, ticket} = await setup();
//     data.version = 10;
//     try{
//       await listener.onMessage(data, msg);
//     }catch(e){

//     }
//     expect(msg.ack).not.toHaveBeenCalled();

//     // if ticket is searched by id and version then this test should pass

// });