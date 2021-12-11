import { Request, Response, Express } from 'jest-express';
import health from '../src/api/health';

var req, res;

beforeEach(() => {
  req = new Request();
  res = new Response();
})

test('Setting Health APIs', () => {
  const api = new Express();
  health.registerApi(api);

  expect(api.get).toBeCalledWith('/api/health/ping', expect.anything());
})

describe('GET /api/health/ping', () => {
  test('Success', () => {
    health.methods.ping(req, res);
    expect(res.sendStatus).toBeCalledWith(200);
  })
})