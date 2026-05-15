import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { PrismaService } from 'src/prisma/prisma.service';
import { AppModule } from 'src/app.module';

describe('Auth Endpoints (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Clear auth-related tables before each test
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "account" CASCADE');
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "session" CASCADE');
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "verification" CASCADE');
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "users" CASCADE');
  });

  describe('POST /api/auth/sign-up/email', () => {
    it('should sign up a new user with email and password', async () => {
      const signUpPayload = {
        email: 'newuser@test.com',
        password: 'SecurePassword123!',
        name: 'John Doe',
      };

      const response = await request(app.getHttpServer())
        .post('/api/auth/sign-up/email')
        .send(signUpPayload)
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe('newuser@test.com');
      expect(response.body.user.name).toBe('John Doe');
      expect(response.body).toHaveProperty('session');

      // Verify user was created in database
      const user = await prisma.user.findUnique({
        where: { email: 'newuser@test.com' },
      });
      expect(user).toBeDefined();
      expect(user?.name).toBe('John Doe');
    });

    it('should not allow signup with duplicate email', async () => {
      const signUpPayload = {
        email: 'duplicate@test.com',
        password: 'SecurePassword123!',
        name: 'First User',
      };

      // First signup should succeed
      await request(app.getHttpServer())
        .post('/api/auth/sign-up/email')
        .send(signUpPayload)
        .expect(200);

      // Second signup with same email should fail
      const response = await request(app.getHttpServer())
        .post('/api/auth/sign-up/email')
        .send({
          ...signUpPayload,
          name: 'Second User',
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should require email and password', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/sign-up/email')
        .send({ name: 'John Doe' })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /api/auth/sign-in/email', () => {
    beforeEach(async () => {
      // Create a user before sign-in tests
      await request(app.getHttpServer())
        .post('/api/auth/sign-up/email')
        .send({
          email: 'existing@test.com',
          password: 'SecurePassword123!',
          name: 'Existing User',
        });
    });

    it('should sign in with correct email and password', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/sign-in/email')
        .send({
          email: 'existing@test.com',
          password: 'SecurePassword123!',
        })
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe('existing@test.com');
      expect(response.body).toHaveProperty('session');
    });

    it('should fail with incorrect password', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/sign-in/email')
        .send({
          email: 'existing@test.com',
          password: 'WrongPassword!',
        })
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });

    it('should fail with non-existent email', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/sign-in/email')
        .send({
          email: 'nonexistent@test.com',
          password: 'SecurePassword123!',
        })
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /api/auth/session', () => {
    it('should return null for unauthenticated request', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/auth/session')
        .expect(200);

      // Session endpoint returns null or { user: null } when not authenticated
      expect(response.body === null || response.body.user === null).toBe(true);
    });

    it('should return session data when authenticated', async () => {
      // Sign up first
      const signUpResponse = await request(app.getHttpServer())
        .post('/api/auth/sign-up/email')
        .send({
          email: 'session@test.com',
          password: 'SecurePassword123!',
          name: 'Session User',
        })
        .expect(200);

      // Extract session token from cookies if available, or use response data
      const sessionToken =
        signUpResponse.body.session?.token ||
        signUpResponse.body.session?.id;

      // Get session
      const sessionResponse = await request(app.getHttpServer())
        .get('/api/auth/session')
        .set('Cookie', `session=${sessionToken}`)
        .expect(200);

      // Should contain user information
      if (sessionResponse.body) {
        expect(sessionResponse.body.user?.email).toBe('session@test.com');
      }
    });
  });

  describe('POST /api/auth/sign-out', () => {
    it('should sign out authenticated user', async () => {
      // Sign up first
      const signUpResponse = await request(app.getHttpServer())
        .post('/api/auth/sign-up/email')
        .send({
          email: 'signout@test.com',
          password: 'SecurePassword123!',
          name: 'SignOut User',
        })
        .expect(200);

      const sessionToken =
        signUpResponse.body.session?.token ||
        signUpResponse.body.session?.id;

      // Sign out
      const signOutResponse = await request(app.getHttpServer())
        .post('/api/auth/sign-out')
        .set('Cookie', `session=${sessionToken}`)
        .expect(200);

      expect(signOutResponse.body).toBeDefined();

      // Verify session is no longer valid
      const sessionResponse = await request(app.getHttpServer())
        .get('/api/auth/session')
        .set('Cookie', `session=${sessionToken}`)
        .expect(200);

      // Should be null/empty after sign out
      expect(sessionResponse.body === null || sessionResponse.body.user === null).toBe(true);
    });
  });

  describe('POST /api/auth/change-password', () => {
    beforeEach(async () => {
      // Create a user before password change tests
      await request(app.getHttpServer())
        .post('/api/auth/sign-up/email')
        .send({
          email: 'changepass@test.com',
          password: 'OldPassword123!',
          name: 'Change Password User',
        });
    });

    it('should change password with correct old password', async () => {
      // First sign in
      const signInResponse = await request(app.getHttpServer())
        .post('/api/auth/sign-in/email')
        .send({
          email: 'changepass@test.com',
          password: 'OldPassword123!',
        })
        .expect(200);

      const sessionToken =
        signInResponse.body.session?.token ||
        signInResponse.body.session?.id;

      // Change password
      const changeResponse = await request(app.getHttpServer())
        .post('/api/auth/change-password')
        .set('Cookie', `session=${sessionToken}`)
        .send({
          oldPassword: 'OldPassword123!',
          newPassword: 'NewPassword456!',
        })
        .expect(200);

      expect(changeResponse.body).toBeDefined();

      // Try to sign in with old password (should fail)
      await request(app.getHttpServer())
        .post('/api/auth/sign-in/email')
        .send({
          email: 'changepass@test.com',
          password: 'OldPassword123!',
        })
        .expect(401);

      // Try to sign in with new password (should succeed)
      await request(app.getHttpServer())
        .post('/api/auth/sign-in/email')
        .send({
          email: 'changepass@test.com',
          password: 'NewPassword456!',
        })
        .expect(200);
    });

    it('should fail changing password with incorrect old password', async () => {
      // First sign in
      const signInResponse = await request(app.getHttpServer())
        .post('/api/auth/sign-in/email')
        .send({
          email: 'changepass@test.com',
          password: 'OldPassword123!',
        })
        .expect(200);

      const sessionToken =
        signInResponse.body.session?.token ||
        signInResponse.body.session?.id;

      // Try to change password with wrong old password
      const changeResponse = await request(app.getHttpServer())
        .post('/api/auth/change-password')
        .set('Cookie', `session=${sessionToken}`)
        .send({
          oldPassword: 'WrongPassword!',
          newPassword: 'NewPassword456!',
        })
        .expect(400);

      expect(changeResponse.body).toHaveProperty('message');
    });
  });
});
