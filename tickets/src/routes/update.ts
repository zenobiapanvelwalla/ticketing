import express, {Request, Response} from 'express';
import { requireAuth, validateRequest, NotFoundError, NotAuthorizedError, BadRequesError } from '@zenobiapanvelwala/common';
import {body} from 'express-validator';
import { Ticket } from '../models/ticket';
import { TicketUpdatedPublisher } from '../events/publishers/ticket-updated-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.put('/api/tickets/:id', 
requireAuth,
[
  body('title')
  .not()
  .notEmpty()
  .withMessage('Title is required'),
  body('price')
  .isFloat({gt: 0})
  .withMessage('Price must be greater that 0')
],
validateRequest,
async (req: Request, res: Response) => {
  const ticket = await Ticket.findById(req.params.id);

  if(!ticket){
    throw new NotFoundError();
  }

  if(ticket.orderId){
    throw new BadRequesError('Cannot edit a reserved ticket');
  }

  if(ticket.userId !== req.currentUser!.id){
    throw new NotAuthorizedError();
  }

  const {title, price} = req.body;
  ticket.set({
    title,
    price,
    version: ticket.version
  });

  await ticket.save();
  // do not have to refetch the ticket

  new TicketUpdatedPublisher(natsWrapper.client).publish({
    id: ticket.id,
    title: ticket.title,
    price: ticket.price,
    userId: ticket.userId,
    version: ticket.version
  });
  res.send(ticket);
});

export { router as updateTicketRouter};