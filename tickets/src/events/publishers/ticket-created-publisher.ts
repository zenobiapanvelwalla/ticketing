import {Publisher, Subjects, TicketCreatedEvent} from '@zenobiapanvelwala/common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
}