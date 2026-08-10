import { validationResult } from 'express-validator'
import { ApiError } from '../utils/ApiError.js'

export const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const messages = [...new Set(errors.array().map((e) => e.msg).filter(Boolean))]
    return next(new ApiError(400, messages.join('. '), errors.array()))
  }
  next()
}
