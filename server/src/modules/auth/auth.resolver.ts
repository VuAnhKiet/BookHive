import { Context, Mutation, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { access } from 'fs';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) { }

  @Mutation(() => String)
  refreshToken(@Context() ctx: any) {
    const refreshToken = ctx.req.cookies?.refresh_token;
    return this.authService.refreshAccessToken(refreshToken);
  }
}
