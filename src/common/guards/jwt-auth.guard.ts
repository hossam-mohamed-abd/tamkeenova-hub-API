import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import * as jwt from 'jsonwebtoken';
import { JwtPayload } from 'jsonwebtoken';

// -- Protect Routes with JWT Authentication --
@Injectable()
export class JwtAuthGuard implements CanActivate {
  // -- Validate the Bearer Token and Attach Its Payload to the Request --
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Authorization header missing');
    }

    const [type, token] = authHeader.split(' ');

    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid token format');
    }

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

      request.user = {
        sub: payload.sub,
        email: payload.email,
        role: payload.role,
      };

      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
