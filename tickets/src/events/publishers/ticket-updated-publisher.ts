import {Publisher, Subjects, TicketUpdatedEvent} from '@zenobiapanvelwala/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdate = Subjects.TicketUpdate;
}