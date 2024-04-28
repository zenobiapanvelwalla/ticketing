import express ,{Request, Response} from "express";
import {body} from 'express-validator';
import { validateRequest, BadRequesError } from "@zenobiapanvelwala/common";
import { User } from "../models/user";
import { Password } from "../services/password";
import jwt from 'jsonwebtoken';

const router = express.Router();

router.post('/api/users/signin', [
  body('email')
  .isEmail()
  .withMessage('Email must be valid'),
  body('password')
  .trim()
  .notEmpty()
  .withMessage('Password must be provided')
],
validateRequest,
async (req: Request, res: Response) => {
  const {email, password} = req.body;
  const existingUser = await User.findOne({email});
  if(!existingUser){
    throw new BadRequesError('Invalid credentials');
  }

  const passwordsMatch = await Password.compare(existingUser.password, password);
  if(!passwordsMatch){
    throw new BadRequesError('Invalid credentials');
  }
  // generate JWT
  const userJwt = jwt.sign({
    id: existingUser.id,
    email: existingUser.email
  }, process.env.JWT_KEY!); // adding a "!" tells typescript that we know that JWT_KEY is defined

  // store it on session object
  req.session  = {
    jwt: userJwt
  }
  res.status(200).send(existingUser);
});

export { router as signinRouter };