export default () => ({
  jwt: {
    secret: process.env.JWT_SECRET ?? 'my-secret',
    expiresIn: Number(process.env.JWT_EXPIRES_IN ?? 3600),
  },
});