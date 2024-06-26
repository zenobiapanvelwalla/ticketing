import express , {Request, Response} from 'express';
import { Order } from '../models/order';
import { NotFoundError, requireAuth } from '@zenobiapanvelwala/common';

const router = express.Router();

router.get('/api/orders', 
requireAuth,
async (req: Request, res: Response) => {
  const orders = await Order.find({
    userId: req.currentUser!.id
  }).populate('ticket');

  if(!orders || orders.length === 0){
    throw new NotFoundError();
  }

  res.status(200).send(orders);
});

export { router as indexOrderRouter};