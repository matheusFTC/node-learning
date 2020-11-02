describe('Beach forecast function tests', () => {
  it('should return a forecast with just a few times', async () => {
    const { status, body } = await global.request.get('/forecast');
    expect(status).toEqual(200);
    expect(body).toEqual({ message: 'ok' });
  });
});
