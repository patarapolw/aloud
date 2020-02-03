import jwt from 'express-jwt'
import jwksRsa from 'jwks-rsa'
import config from '../../aloud.config'

const secureMiddleware = jwt({
  // Dynamically provide a signing key based on the kid in the header and the singing keys provided by the JWKS endpoint.
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${config.auth0.domain}/.well-known/jwks.json`
  }),

  // Validate the audience and the issuer.
  audience: `https://${config.auth0.domain}/api/v2/`,
  algorithms: ['RS256'],
  getToken: (req) => {
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
      const token = req.headers.authorization.split(' ')[1]
      req.session.token = token
      return token
    }
    return null
  }
})

export default secureMiddleware
