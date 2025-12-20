import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err, user, info) {
    // Si hay error o no hay usuario, retornamos null en lugar de lanzar excepción
    // Esto permite que la ruta siga siendo accesible públicamente
    if (err || !user) {
      return null;
    }
    return user;
  }
}
