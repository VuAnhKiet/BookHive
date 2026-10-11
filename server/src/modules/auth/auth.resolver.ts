import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { Query } from '@nestjs/common';
import { RegisterInput } from 'src/modules/auth/input/register.input';
import { LoginInput } from 'src/modules/auth/input/login.input';
import { AuthResponse } from 'src/modules/auth/model/auth.model';
import { ResetPasswordInput } from 'src/modules/auth/input/reset-password.input';

function getRefreshTokenFromRequest(req: any): string | undefined {
  if (req?.cookies?.refresh_token) {
    return req.cookies.refresh_token;
  }

  const cookieHeader = req?.headers?.cookie;
  if (!cookieHeader) {
    return undefined;
  }

  const cookie = cookieHeader
    .split(';')
    .map((part: string) => part.trim())
    .find((part: string) => part.startsWith('refresh_token='));

  if (!cookie) {
    return undefined;
  }

  return decodeURIComponent(cookie.split('=').slice(1).join('='));
}

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) { }

  @Mutation(() => AuthResponse)
  register(@Args('registerInput') registerInput: RegisterInput) {
    return this.authService.register(registerInput);
  }

  @Mutation(() => AuthResponse)
  login(@Args('loginInput') loginInput: LoginInput, @Context() ctx: any) {
    return this.authService.login(loginInput, ctx.res);
  }

  @Mutation(() => AuthResponse)
  refreshToken(@Context() ctx: any) {
    const refreshToken = getRefreshTokenFromRequest(ctx.req);
    return this.authService.refreshAccessToken(refreshToken);
  }

  @Mutation(() => AuthResponse)
  logout(@Context() ctx: any) {
    return this.authService.logout(ctx.res);
  }

  @Mutation(() => AuthResponse)
  sendMail(@Args('email') email: string) {
    return this.authService.sendMail(email);
  }

  @Mutation(() => AuthResponse)
  resetPassword(
    @Args('resetPasswordInput') resetPasswordInput: ResetPasswordInput,
  ) {
    return this.authService.resetPassword(resetPasswordInput);
  }
}
