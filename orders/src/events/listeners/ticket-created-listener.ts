import { Message } from "node-nats-streaming";
import { Subjects, Listener, TicketCreatedEvent } from "@zenobiapanvelwala/common";
import { Ticket } from "../../models/ticket";
import { queueGroupName } from "./queue-group-name";

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
  queueGroupName: string = queueGroupName;

  async onMessage(data: TicketCreatedEvent['data'], msg: Message) {
    const {id, title, price} = data;
    const ticket = Ticket.build({
      id, 
      title, 
      price
    });
    await ticket.save();

    // Acknowledge the message so that any other service copy listening to the same queue does not get the same message
    msg.ack();
  }
}